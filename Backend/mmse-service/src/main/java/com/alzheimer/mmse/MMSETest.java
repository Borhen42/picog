package com.alzheimer.mmse;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;

@Entity
@Table(name = "mmse_tests")
public class MMSETest {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  private String patientName;

  private int orientationScore;   // 0–10
  private int registrationScore;  // 0–3
  private int attentionScore;     // 0–5
  private int recallScore;        // 0–3
  private int languageScore;      // 0–9

  private int totalScore;
  private String interpretation;

  private LocalDate testDate;

  private Long medicalRecordId;

  private String notes;

  @PrePersist
  @PreUpdate
  public void calculateScore() {
    this.totalScore =
        orientationScore +
            registrationScore +
            attentionScore +
            recallScore +
            languageScore;

    if (totalScore >= 24) {
      interpretation = "Normal cognition";
    } else if (totalScore >= 18) {
      interpretation = "Mild cognitive impairment";
    } else if (totalScore >= 10) {
      interpretation = "Moderate cognitive impairment";
    } else {
      interpretation = "Severe cognitive impairment";
    }

    if (testDate == null) {
      testDate = LocalDate.now();
    }
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public String getPatientName() {
    return patientName;
  }

  public void setPatientName(String patientName) {
    this.patientName = patientName;
  }

  public int getOrientationScore() {
    return orientationScore;
  }

  public void setOrientationScore(int orientationScore) {
    this.orientationScore = orientationScore;
  }

  public int getRegistrationScore() {
    return registrationScore;
  }

  public void setRegistrationScore(int registrationScore) {
    this.registrationScore = registrationScore;
  }

  public int getAttentionScore() {
    return attentionScore;
  }

  public void setAttentionScore(int attentionScore) {
    this.attentionScore = attentionScore;
  }

  public int getRecallScore() {
    return recallScore;
  }

  public void setRecallScore(int recallScore) {
    this.recallScore = recallScore;
  }

  public int getLanguageScore() {
    return languageScore;
  }

  public void setLanguageScore(int languageScore) {
    this.languageScore = languageScore;
  }

  public int getTotalScore() {
    return totalScore;
  }

  public void setTotalScore(int totalScore) {
    this.totalScore = totalScore;
  }

  public String getInterpretation() {
    return interpretation;
  }

  public void setInterpretation(String interpretation) {
    this.interpretation = interpretation;
  }

  public LocalDate getTestDate() {
    return testDate;
  }

  public void setTestDate(LocalDate testDate) {
    this.testDate = testDate;
  }

  public Long getMedicalRecordId() {
    return medicalRecordId;
  }

  public void setMedicalRecordId(Long medicalRecordId) {
    this.medicalRecordId = medicalRecordId;
  }

  public String getNotes() {
    return notes;
  }

  public void setNotes(String notes) {
    this.notes = notes;
  }
}

