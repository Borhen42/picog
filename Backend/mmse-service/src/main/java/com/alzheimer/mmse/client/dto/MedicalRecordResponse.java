package com.alzheimer.mmse.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.time.LocalDateTime;

/**
 * Read-only view of a MedicalRecord owned by medical-service.
 * Only the fields mmse-service needs are mapped; unknown fields are ignored
 * so the two services can evolve independently.
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public class MedicalRecordResponse {

  private Long id;
  private Long userId;
  private Integer age;
  private String gender;
  private String educationLevel;
  private String familyHistory;
  private String riskFactors;
  private String currentSymptoms;
  private String diagnosisNotes;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getUserId() {
    return userId;
  }

  public void setUserId(Long userId) {
    this.userId = userId;
  }

  public Integer getAge() {
    return age;
  }

  public void setAge(Integer age) {
    this.age = age;
  }

  public String getGender() {
    return gender;
  }

  public void setGender(String gender) {
    this.gender = gender;
  }

  public String getEducationLevel() {
    return educationLevel;
  }

  public void setEducationLevel(String educationLevel) {
    this.educationLevel = educationLevel;
  }

  public String getFamilyHistory() {
    return familyHistory;
  }

  public void setFamilyHistory(String familyHistory) {
    this.familyHistory = familyHistory;
  }

  public String getRiskFactors() {
    return riskFactors;
  }

  public void setRiskFactors(String riskFactors) {
    this.riskFactors = riskFactors;
  }

  public String getCurrentSymptoms() {
    return currentSymptoms;
  }

  public void setCurrentSymptoms(String currentSymptoms) {
    this.currentSymptoms = currentSymptoms;
  }

  public String getDiagnosisNotes() {
    return diagnosisNotes;
  }

  public void setDiagnosisNotes(String diagnosisNotes) {
    this.diagnosisNotes = diagnosisNotes;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }

  public LocalDateTime getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(LocalDateTime updatedAt) {
    this.updatedAt = updatedAt;
  }
}
