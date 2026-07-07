package com.alzheimer.medical;

import com.openai.azure.credential.AzureApiKeyCredential;
import com.openai.client.OpenAIClient;
import com.openai.client.okhttp.OpenAIOkHttpClient;
import com.openai.models.ChatModel;
import com.openai.models.chat.completions.ChatCompletion;
import com.openai.models.chat.completions.ChatCompletionCreateParams;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Generates a plain-language, doctor-facing summary of a patient's whole case by sending the
 * medical record + every consultation (+ best-effort MMSE scores) to an Azure AI Foundry
 * deployment through the OpenAI-compatible Java SDK.
 */
@Service
public class AiSummaryService {

  private static final Logger log = LoggerFactory.getLogger(AiSummaryService.class);
  private static final DateTimeFormatter DATE = DateTimeFormatter.ofPattern("yyyy-MM-dd");

  private static final String SYSTEM_PROMPT = """
      You are a clinical assistant helping a physician review a patient being assessed for \
      Alzheimer's disease and other cognitive disorders. You will be given a structured medical \
      record and the full history of consultations. Write a concise, professional case summary \
      for the treating doctor using these sections:
      1. Overview - who the patient is and the main clinical picture.
      2. Symptom & diagnosis progression - how things have changed across consultations over time.
      3. Cognitive testing - trend of MMSE scores if provided.
      4. Current risk assessment - your read of the overall risk level and why.
      5. Suggested focus for the next visit - practical, non-prescriptive points.
      Be factual and only use the information given; never invent findings. Keep it under ~300 words \
      and finish with: "AI-generated summary for clinical decision support only - verify against the \
      full record.".""";

  private final ConsultationRepository consultationRepository;
  private final RestClient mmseServiceClient;

  @Value("${azure.ai.endpoint:}")
  private String endpoint;

  @Value("${azure.ai.deployment:}")
  private String deployment;

  @Value("${azure.ai.api-key:}")
  private String apiKey;

  /** Built lazily on first use so the service starts fine even with no API key configured. */
  private volatile OpenAIClient client;

  public AiSummaryService(ConsultationRepository consultationRepository,
                          @Qualifier("mmseServiceClient") RestClient mmseServiceClient) {
    this.consultationRepository = consultationRepository;
    this.mmseServiceClient = mmseServiceClient;
  }

  /** True only when endpoint, deployment and API key are all present. */
  public boolean isConfigured() {
    return isSet(endpoint) && isSet(deployment) && isSet(apiKey);
  }

  /**
   * Builds the prompt from the record + its consultations and asks the model for a summary.
   * @throws IllegalStateException if the AI credentials are not configured.
   */
  public String summarize(MedicalRecord record) {
    if (!isConfigured()) {
      throw new IllegalStateException(
          "AI summary is not configured. Set the AZURE_AI_API_KEY environment variable "
              + "(and azure.ai.endpoint / azure.ai.deployment) on the medical-service.");
    }

    List<Consultation> consultations =
        consultationRepository.findByMedicalRecordIdOrderByConsultationDateAsc(record.getId());
    String prompt = buildPrompt(record, consultations, fetchMmseSection(record.getId()));

    ChatCompletionCreateParams params = ChatCompletionCreateParams.builder()
        .model(ChatModel.of(deployment))
        .addSystemMessage(SYSTEM_PROMPT)
        .addUserMessage(prompt)
        .build();

    ChatCompletion completion = client().chat().completions().create(params);
    return completion.choices().stream()
        .findFirst()
        .flatMap(choice -> choice.message().content())
        .map(String::trim)
        .filter(s -> !s.isEmpty())
        .orElseThrow(() -> new IllegalStateException("The AI model returned an empty response."));
  }

  private OpenAIClient client() {
    OpenAIClient local = client;
    if (local == null) {
      synchronized (this) {
        local = client;
        if (local == null) {
          local = OpenAIOkHttpClient.builder()
              .baseUrl(endpoint)
              .credential(AzureApiKeyCredential.create(apiKey))
              .build();
          client = local;
        }
      }
    }
    return local;
  }

  private String buildPrompt(MedicalRecord r, List<Consultation> consultations, String mmseSection) {
    StringBuilder sb = new StringBuilder();
    sb.append("MEDICAL RECORD\n");
    sb.append("- Record ID: ").append(r.getId()).append('\n');
    sb.append("- Patient user ID: ").append(r.getUserId()).append('\n');
    sb.append("- Age: ").append(orNa(r.getAge())).append('\n');
    sb.append("- Gender: ").append(r.getGender() != null ? r.getGender().name() : "N/A").append('\n');
    sb.append("- Education level: ").append(orNa(r.getEducationLevel())).append('\n');
    sb.append("- Family history of Alzheimer's: ")
        .append(r.getFamilyHistory() != null ? r.getFamilyHistory().name() : "N/A").append('\n');
    sb.append("- Risk factors: ").append(orNa(r.getRiskFactors())).append('\n');
    sb.append("- Current symptoms: ").append(orNa(r.getCurrentSymptoms())).append('\n');
    sb.append("- Diagnosis notes: ").append(orNa(r.getDiagnosisNotes())).append('\n');

    sb.append("\nCONSULTATIONS (").append(consultations.size()).append(", oldest first)\n");
    if (consultations.isEmpty()) {
      sb.append("- No consultations have been recorded yet.\n");
    } else {
      int i = 1;
      for (Consultation c : consultations) {
        sb.append(i++).append(". Date: ")
            .append(c.getConsultationDate() != null ? c.getConsultationDate().format(DATE) : "N/A")
            .append('\n');
        sb.append("   - Symptoms: ").append(orNa(c.getSymptoms())).append('\n');
        sb.append("   - Observations: ").append(orNa(c.getObservations())).append('\n');
        sb.append("   - Diagnosis: ").append(orNa(c.getDiagnosis())).append('\n');
        sb.append("   - Recommendations: ").append(orNa(c.getRecommendations())).append('\n');
        sb.append("   - Risk level: ").append(c.getRiskLevel() != null ? c.getRiskLevel().name() : "N/A");
        if (c.getConfidenceScore() != null) {
          sb.append(" (confidence ").append(c.getConfidenceScore()).append(')');
        }
        sb.append('\n');
      }
    }

    if (!mmseSection.isEmpty()) {
      sb.append('\n').append(mmseSection);
    }

    sb.append("\nWrite the case summary now.");
    return sb.toString();
  }

  /**
   * Best-effort pull of MMSE scores from mmse-service. Any failure (service down, no tests -> 404)
   * simply yields an empty section so the summary can still be produced.
   */
  private String fetchMmseSection(Long recordId) {
    try {
      Map<String, Object> body = mmseServiceClient.get()
          .uri("/api/mmse/results/medical-record/{id}", recordId)
          .retrieve()
          .body(new ParameterizedTypeReference<Map<String, Object>>() {});

      if (body == null || !(body.get("data") instanceof List<?> tests) || tests.isEmpty()) {
        return "";
      }

      StringBuilder sb = new StringBuilder("MMSE COGNITIVE TESTS (").append(tests.size()).append(")\n");
      for (Object test : tests) {
        if (test instanceof Map<?, ?> m) {
          sb.append("- Date: ").append(str(m.get("testDate")))
              .append(", total score: ").append(str(m.get("totalScore"))).append("/30")
              .append(", interpretation: ").append(str(m.get("interpretation"))).append('\n');
        }
      }
      return sb.toString();
    } catch (Exception e) {
      log.debug("MMSE scores unavailable for record {} ({}); summarizing without them.",
          recordId, e.getMessage());
      return "";
    }
  }

  private static boolean isSet(String v) {
    return v != null && !v.isBlank();
  }

  private static String orNa(Object v) {
    if (v == null) {
      return "N/A";
    }
    String s = v.toString().trim();
    return s.isEmpty() ? "N/A" : s;
  }

  private static String str(Object v) {
    return v == null ? "N/A" : v.toString();
  }
}
