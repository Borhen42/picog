package com.alzheimer.medical;

import com.alzheimer.medical.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;

/**
 * AI-powered patient case summary. Kept in its own controller so the AI concern is separate from
 * CRUD, but mapped under /api/medical-records so it is reachable through the existing gateway route.
 */
@RestController
@RequestMapping("/api/medical-records")
public class AiSummaryController {

  private final MedicalRecordRepository medicalRecordRepository;
  private final AiSummaryService aiSummaryService;

  public AiSummaryController(MedicalRecordRepository medicalRecordRepository,
                            AiSummaryService aiSummaryService) {
    this.medicalRecordRepository = medicalRecordRepository;
    this.aiSummaryService = aiSummaryService;
  }

  @PostMapping("/{id}/ai-summary")
  public ResponseEntity<ApiResponse<Map<String, Object>>> summarizeCase(@PathVariable Long id) {
    Optional<MedicalRecord> recordOpt = medicalRecordRepository.findById(id);
    if (recordOpt.isEmpty()) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(ApiResponse.error("Medical record not found", "No medical record with ID: " + id));
    }

    try {
      String summary = aiSummaryService.summarize(recordOpt.get());
      Map<String, Object> data = new LinkedHashMap<>();
      data.put("medicalRecordId", id);
      data.put("summary", summary);
      data.put("generatedAt", LocalDateTime.now());
      return ResponseEntity.ok(ApiResponse.success("AI case summary generated", data));
    } catch (IllegalStateException e) {
      // Not configured / empty model response -> 503 with an actionable message.
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(ApiResponse.error("AI summary unavailable", e.getMessage()));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to generate AI summary", e.getMessage()));
    }
  }
}
