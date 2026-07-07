package com.alzheimer.mmse;

import com.alzheimer.mmse.client.MedicalRecordClient;
import com.alzheimer.mmse.client.dto.MedicalRecordResponse;
import feign.FeignException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/mmse")
public class MMSEController {

  @Autowired
  private MMSERepository mmseRepository;

  @Autowired
  private MedicalRecordClient medicalRecordClient;

  @PostMapping("/submit")
  public ResponseEntity<?> submitMMSETest(@RequestBody MMSETestRequest request) {
    try {
      // When a medical record is linked, verify it exists in medical-service.
      // Definitive 404 blocks the submission; if medical-service is unreachable
      // we still save so tests are not lost (medical-service uses the same policy).
      if (request.getMedical_record_id() != null) {
        Boolean recordOk = medicalRecordExists(request.getMedical_record_id());
        if (Boolean.FALSE.equals(recordOk)) {
          return ResponseEntity.status(HttpStatus.NOT_FOUND)
              .body(new ApiResponse(false,
                  "Medical record not found: " + request.getMedical_record_id(), null));
        }
      }

      MMSETest test = new MMSETest();
      test.setPatientName(request.getPatient_name());
      test.setOrientationScore(request.getOrientation_score());
      test.setRegistrationScore(request.getRegistration_score());
      test.setAttentionScore(request.getAttention_score());
      test.setRecallScore(request.getRecall_score());
      test.setLanguageScore(request.getLanguage_score());
      test.setTotalScore(request.getTotal_score());
      test.setInterpretation(request.getInterpretation());
      test.setTestDate(LocalDate.parse(request.getTest_date()));
      test.setMedicalRecordId(request.getMedical_record_id());
      test.setNotes(request.getNotes());

      MMSETest saved = mmseRepository.save(test);

      return ResponseEntity.ok(new ApiResponse(
          true,
          "MMSE test submitted successfully",
          saved
      ));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error submitting test: " + e.getMessage(), null));
    }
  }

  @GetMapping("/results")
  public ResponseEntity<?> getMMSEResults() {
    try {
      List<MMSETest> tests = mmseRepository.findAll();
      return ResponseEntity.ok(new ApiResponse(true, "MMSE results retrieved", tests));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error retrieving results: " + e.getMessage(), null));
    }
  }

  @GetMapping("/count")
  public ResponseEntity<?> getMMSECount() {
    try {
      long count = mmseRepository.count();
      return ResponseEntity.ok(new ApiResponse(true, "MMSE tests count retrieved", count));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error retrieving count: " + e.getMessage(), null));
    }
  }

  @GetMapping("/count/raw")
  public long getMMSECountRaw() {
    return mmseRepository.count();
  }

  @GetMapping("/results/medical-record/{medicalRecordId}")
  public ResponseEntity<?> getResultsByMedicalRecordId(@PathVariable Long medicalRecordId) {
    try {
      List<MMSETest> tests = mmseRepository.findByMedicalRecordId(medicalRecordId);
      if (tests.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, "No results found for medical record: " + medicalRecordId, null));
      }
      return ResponseEntity.ok(new ApiResponse(true, "Results retrieved by medical record", tests));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error retrieving results: " + e.getMessage(), null));
    }
  }

  @GetMapping("/results/{patientName}")
  public ResponseEntity<?> getPatientResults(@PathVariable String patientName) {
    try {
      List<MMSETest> tests = mmseRepository.findByPatientNameIgnoreCase(patientName);
      if (tests.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, "No results found for patient: " + patientName, null));
      }
      return ResponseEntity.ok(new ApiResponse(true, "Patient results retrieved", tests));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error retrieving patient results: " + e.getMessage(), null));
    }
  }

  /**
   * Fetch the medical record linked to an MMSE test, retrieved from
   * medical-service over OpenFeign. Demonstrates cross-service communication.
   */
  @GetMapping("/{id}/medical-record")
  public ResponseEntity<?> getLinkedMedicalRecord(@PathVariable Long id) {
    try {
      MMSETest test = mmseRepository.findById(id).orElse(null);
      if (test == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, "MMSE test not found: " + id, null));
      }
      if (test.getMedicalRecordId() == null) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(new ApiResponse(false, "MMSE test " + id + " has no linked medical record", null));
      }

      MedicalRecordResponse record =
          medicalRecordClient.getMedicalRecordById(test.getMedicalRecordId()).getData();
      return ResponseEntity.ok(new ApiResponse(true, "Linked medical record retrieved", record));
    } catch (FeignException.NotFound e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(new ApiResponse(false, "Linked medical record no longer exists", null));
    } catch (FeignException e) {
      return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
          .body(new ApiResponse(false, "medical-service is unavailable: " + e.getMessage(), null));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(new ApiResponse(false, "Error retrieving medical record: " + e.getMessage(), null));
    }
  }

  /**
   * Returns true if the medical record exists, false on a definitive 404,
   * or null if medical-service could not be reached (so the caller can decide
   * not to block on transient outages).
   */
  private Boolean medicalRecordExists(Long medicalRecordId) {
    try {
      medicalRecordClient.getMedicalRecordById(medicalRecordId);
      return true;
    } catch (FeignException.NotFound e) {
      return false;
    } catch (Exception e) {
      return null; // service down, timeout, etc.: don't block the submission
    }
  }

  public static class MMSETestRequest {
    private String patient_name;
    private int orientation_score;
    private int registration_score;
    private int attention_score;
    private int recall_score;
    private int language_score;
    private int total_score;
    private String interpretation;
    private String test_date;
    private Long medical_record_id;
    private String notes;

    public String getPatient_name() {
      return patient_name;
    }

    public int getOrientation_score() {
      return orientation_score;
    }

    public int getRegistration_score() {
      return registration_score;
    }

    public int getAttention_score() {
      return attention_score;
    }

    public int getRecall_score() {
      return recall_score;
    }

    public int getLanguage_score() {
      return language_score;
    }

    public int getTotal_score() {
      return total_score;
    }

    public String getInterpretation() {
      return interpretation;
    }

    public String getTest_date() {
      return test_date;
    }

    public String getNotes() {
      return notes;
    }

    public void setPatient_name(String patient_name) {
      this.patient_name = patient_name;
    }

    public void setOrientation_score(int orientation_score) {
      this.orientation_score = orientation_score;
    }

    public void setRegistration_score(int registration_score) {
      this.registration_score = registration_score;
    }

    public void setAttention_score(int attention_score) {
      this.attention_score = attention_score;
    }

    public void setRecall_score(int recall_score) {
      this.recall_score = recall_score;
    }

    public void setLanguage_score(int language_score) {
      this.language_score = language_score;
    }

    public void setTotal_score(int total_score) {
      this.total_score = total_score;
    }

    public void setInterpretation(String interpretation) {
      this.interpretation = interpretation;
    }

    public void setTest_date(String test_date) {
      this.test_date = test_date;
    }

    public void setNotes(String notes) {
      this.notes = notes;
    }

    public Long getMedical_record_id() {
      return medical_record_id;
    }

    public void setMedical_record_id(Long medical_record_id) {
      this.medical_record_id = medical_record_id;
    }
  }

  public static class ApiResponse {
    private boolean success;
    private String message;
    private Object data;

    public ApiResponse(boolean success, String message, Object data) {
      this.success = success;
      this.message = message;
      this.data = data;
    }

    public boolean isSuccess() {
      return success;
    }

    public String getMessage() {
      return message;
    }

    public Object getData() {
      return data;
    }
  }
}

