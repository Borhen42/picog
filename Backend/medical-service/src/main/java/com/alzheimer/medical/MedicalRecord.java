package com.alzheimer.medical;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "medical_records")
public class MedicalRecord {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(name = "user_id", nullable = false)
  private Long userId;

  @Column(name = "age")
  private Integer age;

  @Column(name = "gender", nullable = false)
  @Enumerated(EnumType.STRING)
  private Gender gender;

  @Column(name = "education_level", length = 100)
  private String educationLevel;

  @Enumerated(EnumType.STRING)
  @Column(name = "family_history")
  private FamilyHistory familyHistory = FamilyHistory.No;

  @Column(name = "risk_factors", columnDefinition = "TEXT")
  private String riskFactors;

  @Column(name = "current_symptoms", columnDefinition = "TEXT")
  private String currentSymptoms;

  @Column(name = "diagnosis_notes", columnDefinition = "TEXT")
  private String diagnosisNotes;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @OneToMany(mappedBy = "medicalRecord", cascade = CascadeType.ALL, orphanRemoval = true)
  private List<Consultation> consultations;

  @PreUpdate
  public void preUpdate() {
    this.updatedAt = LocalDateTime.now();
  }

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

  public Gender getGender() {
    return gender;
  }

  public void setGender(Gender gender) {
    this.gender = gender;
  }

  public String getEducationLevel() {
    return educationLevel;
  }

  public void setEducationLevel(String educationLevel) {
    this.educationLevel = educationLevel;
  }

  public FamilyHistory getFamilyHistory() {
    return familyHistory;
  }

  public void setFamilyHistory(FamilyHistory familyHistory) {
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

  public List<Consultation> getConsultations() {
    return consultations;
  }

  public void setConsultations(List<Consultation> consultations) {
    this.consultations = consultations;
  }
}

