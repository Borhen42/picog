package com.alzheimer.medical;

import com.alzheimer.medical.dto.ApiResponse;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/medical-records")
public class MedicalRecordController {

  private final MedicalRecordRepository medicalRecordRepository;
  private final RestClient userServiceClient;

  public MedicalRecordController(MedicalRecordRepository medicalRecordRepository,
                                  @Qualifier("userServiceClient") RestClient userServiceClient) {
    this.medicalRecordRepository = medicalRecordRepository;
    this.userServiceClient = userServiceClient;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<MedicalRecordDTO>>> getAllRecords() {
    try {
      List<MedicalRecordDTO> records = medicalRecordRepository.findAll()
          .stream()
          .map(MedicalRecordDTO::new)
          .collect(Collectors.toList());
      return ResponseEntity.ok(ApiResponse.success("Medical records retrieved successfully", records));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve medical records", e.getMessage()));
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<MedicalRecordDTO>> getRecordById(@PathVariable Long id) {
    try {
      Optional<MedicalRecord> record = medicalRecordRepository.findById(id);
      if (record.isPresent()) {
        return ResponseEntity.ok(ApiResponse.success("Medical record found", new MedicalRecordDTO(record.get())));
      }
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(ApiResponse.error("Medical record not found", "No record with ID: " + id));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve medical record", e.getMessage()));
    }
  }

  @GetMapping("/user/{userId}")
  public ResponseEntity<ApiResponse<List<MedicalRecordDTO>>> getRecordsByUser(@PathVariable Long userId) {
    try {
      List<MedicalRecordDTO> records = medicalRecordRepository.findByUserId(userId)
          .stream()
          .map(MedicalRecordDTO::new)
          .collect(Collectors.toList());
      return ResponseEntity.ok(ApiResponse.success("Medical records for user retrieved", records));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve medical records", e.getMessage()));
    }
  }

  @GetMapping("/user/{userId}/latest")
  public ResponseEntity<ApiResponse<MedicalRecordDTO>> getLatestRecordByUser(@PathVariable Long userId) {
    try {
      Optional<MedicalRecord> record = medicalRecordRepository.findFirstByUserIdOrderByCreatedAtDesc(userId);
      if (record.isPresent()) {
        return ResponseEntity.ok(ApiResponse.success("Latest medical record found", new MedicalRecordDTO(record.get())));
      }
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(ApiResponse.error("No medical record found", "No records for user ID: " + userId));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve medical record", e.getMessage()));
    }
  }

  @PostMapping
  public ResponseEntity<ApiResponse<MedicalRecordDTO>> createRecord(@RequestBody Map<String, Object> request) {
    try {
      Long userId = Long.valueOf(request.get("userId").toString());

      // Validate user exists in user-service when reachable; if user-service is down, still save so records persist to MySQL
      Boolean userOk = userExists(userId);
      if (Boolean.FALSE.equals(userOk)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("User not found", "No user with ID: " + userId));
      }

      MedicalRecord record = new MedicalRecord();
      record.setUserId(userId);

      if (request.containsKey("age")) {
        record.setAge(Integer.valueOf(request.get("age").toString()));
      }
      if (request.containsKey("gender")) {
        record.setGender(Gender.valueOf(request.get("gender").toString()));
      }
      if (request.containsKey("educationLevel")) {
        record.setEducationLevel(request.get("educationLevel").toString());
      }
      if (request.containsKey("familyHistory")) {
        record.setFamilyHistory(FamilyHistory.valueOf(request.get("familyHistory").toString()));
      }
      if (request.containsKey("riskFactors")) {
        record.setRiskFactors(request.get("riskFactors").toString());
      }
      if (request.containsKey("currentSymptoms")) {
        record.setCurrentSymptoms(request.get("currentSymptoms").toString());
      }
      if (request.containsKey("diagnosisNotes")) {
        record.setDiagnosisNotes(request.get("diagnosisNotes").toString());
      }

      MedicalRecord saved = medicalRecordRepository.save(record);
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(ApiResponse.success("Medical record created successfully", new MedicalRecordDTO(saved)));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to create medical record", e.getMessage()));
    }
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<MedicalRecordDTO>> updateRecord(
      @PathVariable Long id,
      @RequestBody Map<String, Object> request
  ) {
    try {
      Optional<MedicalRecord> existingOpt = medicalRecordRepository.findById(id);
      if (existingOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("Medical record not found", "No record with ID: " + id));
      }

      MedicalRecord record = existingOpt.get();

      if (request.containsKey("age")) {
        record.setAge(Integer.valueOf(request.get("age").toString()));
      }
      if (request.containsKey("gender")) {
        record.setGender(Gender.valueOf(request.get("gender").toString()));
      }
      if (request.containsKey("educationLevel")) {
        record.setEducationLevel(request.get("educationLevel").toString());
      }
      if (request.containsKey("familyHistory")) {
        record.setFamilyHistory(FamilyHistory.valueOf(request.get("familyHistory").toString()));
      }
      if (request.containsKey("riskFactors")) {
        record.setRiskFactors(request.get("riskFactors").toString());
      }
      if (request.containsKey("currentSymptoms")) {
        record.setCurrentSymptoms(request.get("currentSymptoms").toString());
      }
      if (request.containsKey("diagnosisNotes")) {
        record.setDiagnosisNotes(request.get("diagnosisNotes").toString());
      }

      MedicalRecord updated = medicalRecordRepository.save(record);
      return ResponseEntity.ok(ApiResponse.success("Medical record updated successfully", new MedicalRecordDTO(updated)));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to update medical record", e.getMessage()));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteRecord(@PathVariable Long id) {
    try {
      if (!medicalRecordRepository.existsById(id)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("Medical record not found", "No record with ID: " + id));
      }
      medicalRecordRepository.deleteById(id);
      return ResponseEntity.ok(ApiResponse.success("Medical record deleted successfully", null));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to delete medical record", e.getMessage()));
    }
  }

  @GetMapping("/stats")
  public ResponseEntity<ApiResponse<Map<String, Object>>> getStats() {
    try {
      long totalRecords = medicalRecordRepository.count();
      long withFamilyHistory = medicalRecordRepository.findByFamilyHistory(FamilyHistory.Yes).size();
      long malePatients = medicalRecordRepository.findByGender(Gender.Male).size();
      long femalePatients = medicalRecordRepository.findByGender(Gender.Female).size();

      Map<String, Object> stats = Map.of(
          "totalRecords", totalRecords,
          "withFamilyHistory", withFamilyHistory,
          "malePatients", malePatients,
          "femalePatients", femalePatients
      );

      return ResponseEntity.ok(ApiResponse.success("Statistics retrieved successfully", stats));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve statistics", e.getMessage()));
    }
  }

  /**
   * Returns true if user exists, false if user-service returned 404. Returns null if user-service is unreachable (so we still save the record).
   */
  private Boolean userExists(Long userId) {
    try {
      userServiceClient.get()
          .uri("/api/users/{id}", userId)
          .retrieve()
          .toBodilessEntity();
      return true;
    } catch (RestClientResponseException e) {
      if (e.getStatusCode() != null && e.getStatusCode().value() == 404) {
        return false;
      }
      return null; // other 4xx/5xx: don't block save
    } catch (Exception e) {
      return null; // connection refused, timeout, etc.: don't block save so records can persist to MySQL
    }
  }
}

