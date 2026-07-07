package com.alzheimer.medical;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord, Long> {
  List<MedicalRecord> findByUserId(Long userId);

  Optional<MedicalRecord> findFirstByUserIdOrderByCreatedAtDesc(Long userId);

  List<MedicalRecord> findByGender(Gender gender);

  List<MedicalRecord> findByFamilyHistory(FamilyHistory familyHistory);

  List<MedicalRecord> findByAgeBetween(Integer minAge, Integer maxAge);

  List<MedicalRecord> findByEducationLevel(String educationLevel);
}

