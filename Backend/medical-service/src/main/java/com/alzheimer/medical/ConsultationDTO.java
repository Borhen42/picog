package com.alzheimer.medical;

import java.time.LocalDateTime;

public class ConsultationDTO {
  private Long id;
  private Long medicalRecordId;
  private LocalDateTime consultationDate;
  private String symptoms;
  private String observations;
  private String diagnosis;
  private String recommendations;
  private String riskLevel;
  private Double confidenceScore;
  private Long doctorId;
  private LocalDateTime createdAt;

  public ConsultationDTO() {
  }

  public ConsultationDTO(Consultation consultation) {
    this.id = consultation.getId();
    this.medicalRecordId = consultation.getMedicalRecord() != null ? consultation.getMedicalRecord().getId() : null;
    this.consultationDate = consultation.getConsultationDate();
    this.symptoms = consultation.getSymptoms();
    this.observations = consultation.getObservations();
    this.diagnosis = consultation.getDiagnosis();
    this.recommendations = consultation.getRecommendations();
    this.riskLevel = consultation.getRiskLevel() != null ? consultation.getRiskLevel().name() : null;
    this.confidenceScore = consultation.getConfidenceScore();
    this.doctorId = consultation.getDoctorId();
    this.createdAt = consultation.getCreatedAt();
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Long getMedicalRecordId() {
    return medicalRecordId;
  }

  public void setMedicalRecordId(Long medicalRecordId) {
    this.medicalRecordId = medicalRecordId;
  }

  public LocalDateTime getConsultationDate() {
    return consultationDate;
  }

  public void setConsultationDate(LocalDateTime consultationDate) {
    this.consultationDate = consultationDate;
  }

  public String getSymptoms() {
    return symptoms;
  }

  public void setSymptoms(String symptoms) {
    this.symptoms = symptoms;
  }

  public String getObservations() {
    return observations;
  }

  public void setObservations(String observations) {
    this.observations = observations;
  }

  public String getDiagnosis() {
    return diagnosis;
  }

  public void setDiagnosis(String diagnosis) {
    this.diagnosis = diagnosis;
  }

  public String getRecommendations() {
    return recommendations;
  }

  public void setRecommendations(String recommendations) {
    this.recommendations = recommendations;
  }

  public String getRiskLevel() {
    return riskLevel;
  }

  public void setRiskLevel(String riskLevel) {
    this.riskLevel = riskLevel;
  }

  public Double getConfidenceScore() {
    return confidenceScore;
  }

  public void setConfidenceScore(Double confidenceScore) {
    this.confidenceScore = confidenceScore;
  }

  public Long getDoctorId() {
    return doctorId;
  }

  public void setDoctorId(Long doctorId) {
    this.doctorId = doctorId;
  }

  public LocalDateTime getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(LocalDateTime createdAt) {
    this.createdAt = createdAt;
  }
}
