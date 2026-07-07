package com.alzheimer.mmse;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MMSERepository extends JpaRepository<MMSETest, Long> {
  List<MMSETest> findByPatientName(String patientName);

  List<MMSETest> findByPatientNameIgnoreCase(String patientName);

  List<MMSETest> findByMedicalRecordId(Long medicalRecordId);
}

