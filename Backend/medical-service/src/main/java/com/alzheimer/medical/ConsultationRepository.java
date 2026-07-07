package com.alzheimer.medical;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
  List<Consultation> findByMedicalRecordId(Long medicalRecordId);

  List<Consultation> findByDoctorId(Long doctorId);

  List<Consultation> findByRiskLevel(RiskLevel riskLevel);

  List<Consultation> findByMedicalRecordIdOrderByConsultationDateDesc(Long medicalRecordId);

  // Oldest-first: used to feed the AI case summary in chronological order.
  List<Consultation> findByMedicalRecordIdOrderByConsultationDateAsc(Long medicalRecordId);
}
