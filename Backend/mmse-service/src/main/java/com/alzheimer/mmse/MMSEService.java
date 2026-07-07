package com.alzheimer.mmse;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MMSEService {

  private final MMSERepository repository;

  public MMSEService(MMSERepository repository) {
    this.repository = repository;
  }

  public MMSETest save(MMSETest test) {
    return repository.save(test);
  }

  public List<MMSETest> findAll() {
    return repository.findAll();
  }

  public MMSETest findById(Long id) {
    return repository.findById(id)
        .orElseThrow(() -> new RuntimeException("MMSE Test not found"));
  }

  public MMSETest update(Long id, MMSETest updatedTest) {
    MMSETest existing = findById(id);

    existing.setPatientName(updatedTest.getPatientName());
    existing.setOrientationScore(updatedTest.getOrientationScore());
    existing.setRegistrationScore(updatedTest.getRegistrationScore());
    existing.setAttentionScore(updatedTest.getAttentionScore());
    existing.setRecallScore(updatedTest.getRecallScore());
    existing.setLanguageScore(updatedTest.getLanguageScore());
    existing.setMedicalRecordId(updatedTest.getMedicalRecordId());
    existing.setNotes(updatedTest.getNotes());

    return repository.save(existing);
  }

  public void delete(Long id) {
    repository.deleteById(id);
  }
}

