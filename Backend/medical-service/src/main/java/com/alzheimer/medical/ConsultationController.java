package com.alzheimer.medical;

import com.alzheimer.medical.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/consultations")
public class ConsultationController {

  private final ConsultationRepository consultationRepository;
  private final MedicalRecordRepository medicalRecordRepository;

  public ConsultationController(ConsultationRepository consultationRepository,
                                MedicalRecordRepository medicalRecordRepository) {
    this.consultationRepository = consultationRepository;
    this.medicalRecordRepository = medicalRecordRepository;
  }

  @GetMapping
  public ResponseEntity<ApiResponse<List<ConsultationDTO>>> getAllConsultations() {
    try {
      List<ConsultationDTO> consultations = consultationRepository.findAll()
          .stream()
          .map(ConsultationDTO::new)
          .collect(Collectors.toList());
      return ResponseEntity.ok(ApiResponse.success("Consultations retrieved successfully", consultations));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve consultations", e.getMessage()));
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<ApiResponse<ConsultationDTO>> getConsultationById(@PathVariable Long id) {
    try {
      Optional<Consultation> consultation = consultationRepository.findById(id);
      if (consultation.isPresent()) {
        return ResponseEntity.ok(ApiResponse.success("Consultation found", new ConsultationDTO(consultation.get())));
      }
      return ResponseEntity.status(HttpStatus.NOT_FOUND)
          .body(ApiResponse.error("Consultation not found", "No consultation with ID: " + id));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve consultation", e.getMessage()));
    }
  }

  @GetMapping("/medical-record/{medicalRecordId}")
  public ResponseEntity<ApiResponse<List<ConsultationDTO>>> getConsultationsByMedicalRecord(
      @PathVariable Long medicalRecordId) {
    try {
      List<ConsultationDTO> consultations = consultationRepository
          .findByMedicalRecordIdOrderByConsultationDateDesc(medicalRecordId)
          .stream()
          .map(ConsultationDTO::new)
          .collect(Collectors.toList());
      return ResponseEntity.ok(ApiResponse.success("Consultations for medical record retrieved", consultations));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve consultations", e.getMessage()));
    }
  }

  @GetMapping("/doctor/{doctorId}")
  public ResponseEntity<ApiResponse<List<ConsultationDTO>>> getConsultationsByDoctor(@PathVariable Long doctorId) {
    try {
      List<ConsultationDTO> consultations = consultationRepository.findByDoctorId(doctorId)
          .stream()
          .map(ConsultationDTO::new)
          .collect(Collectors.toList());
      return ResponseEntity.ok(ApiResponse.success("Consultations for doctor retrieved", consultations));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to retrieve consultations", e.getMessage()));
    }
  }

  @PostMapping
  public ResponseEntity<ApiResponse<ConsultationDTO>> createConsultation(@RequestBody Map<String, Object> request) {
    try {
      Long medicalRecordId = Long.valueOf(request.get("medicalRecordId").toString());
      Optional<MedicalRecord> medicalRecordOpt = medicalRecordRepository.findById(medicalRecordId);
      if (medicalRecordOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("Medical record not found", "No medical record with ID: " + medicalRecordId));
      }

      Consultation consultation = new Consultation();
      consultation.setMedicalRecord(medicalRecordOpt.get());

      if (request.containsKey("consultationDate")) {
        consultation.setConsultationDate(LocalDateTime.parse(request.get("consultationDate").toString()));
      } else {
        consultation.setConsultationDate(LocalDateTime.now());
      }
      if (request.containsKey("symptoms")) {
        consultation.setSymptoms(request.get("symptoms").toString());
      }
      if (request.containsKey("observations")) {
        consultation.setObservations(request.get("observations").toString());
      }
      if (request.containsKey("diagnosis")) {
        consultation.setDiagnosis(request.get("diagnosis").toString());
      }
      if (request.containsKey("recommendations")) {
        consultation.setRecommendations(request.get("recommendations").toString());
      }
      if (request.containsKey("riskLevel")) {
        consultation.setRiskLevel(RiskLevel.valueOf(request.get("riskLevel").toString()));
      }
      if (request.containsKey("confidenceScore")) {
        consultation.setConfidenceScore(Double.valueOf(request.get("confidenceScore").toString()));
      }
      if (request.containsKey("doctorId")) {
        consultation.setDoctorId(Long.valueOf(request.get("doctorId").toString()));
      }

      Consultation saved = consultationRepository.save(consultation);
      return ResponseEntity.status(HttpStatus.CREATED)
          .body(ApiResponse.success("Consultation created successfully", new ConsultationDTO(saved)));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to create consultation", e.getMessage()));
    }
  }

  @PutMapping("/{id}")
  public ResponseEntity<ApiResponse<ConsultationDTO>> updateConsultation(
      @PathVariable Long id,
      @RequestBody Map<String, Object> request) {
    try {
      Optional<Consultation> existingOpt = consultationRepository.findById(id);
      if (existingOpt.isEmpty()) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("Consultation not found", "No consultation with ID: " + id));
      }

      Consultation consultation = existingOpt.get();

      if (request.containsKey("consultationDate")) {
        consultation.setConsultationDate(LocalDateTime.parse(request.get("consultationDate").toString()));
      }
      if (request.containsKey("symptoms")) {
        consultation.setSymptoms(request.get("symptoms").toString());
      }
      if (request.containsKey("observations")) {
        consultation.setObservations(request.get("observations").toString());
      }
      if (request.containsKey("diagnosis")) {
        consultation.setDiagnosis(request.get("diagnosis").toString());
      }
      if (request.containsKey("recommendations")) {
        consultation.setRecommendations(request.get("recommendations").toString());
      }
      if (request.containsKey("riskLevel")) {
        consultation.setRiskLevel(RiskLevel.valueOf(request.get("riskLevel").toString()));
      }
      if (request.containsKey("confidenceScore")) {
        consultation.setConfidenceScore(Double.valueOf(request.get("confidenceScore").toString()));
      }
      if (request.containsKey("doctorId")) {
        consultation.setDoctorId(Long.valueOf(request.get("doctorId").toString()));
      }

      Consultation updated = consultationRepository.save(consultation);
      return ResponseEntity.ok(ApiResponse.success("Consultation updated successfully", new ConsultationDTO(updated)));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to update consultation", e.getMessage()));
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<ApiResponse<Void>> deleteConsultation(@PathVariable Long id) {
    try {
      if (!consultationRepository.existsById(id)) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
            .body(ApiResponse.error("Consultation not found", "No consultation with ID: " + id));
      }
      consultationRepository.deleteById(id);
      return ResponseEntity.ok(ApiResponse.success("Consultation deleted successfully", null));
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
          .body(ApiResponse.error("Failed to delete consultation", e.getMessage()));
    }
  }
}
