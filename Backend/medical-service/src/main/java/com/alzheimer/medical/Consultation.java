package com.alzheimer.medical;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "consultations")
public class Consultation {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne
  @JoinColumn(name = "medical_record_id")
  private MedicalRecord medicalRecord;

  @Column(name = "consultation_date", nullable = false)
  private LocalDateTime consultationDate;

  @Column(columnDefinition = "TEXT")
  private String symptoms;

  @Column(columnDefinition = "TEXT")
  private String observations;

  @Column(columnDefinition = "TEXT")
  private String diagnosis;

  @Column(columnDefinition = "TEXT")
  private String recommendations;

  @Enumerated(EnumType.STRING)
  @Column(name = "risk_level")
  private RiskLevel riskLevel;

  @Column(name = "confidence_score")
  private Double confidenceScore;

  @Column(name = "doctor_id")
  private Long doctorId;

  @Column(name = "created_at", nullable = false, updatable = false)
  private LocalDateTime createdAt = LocalDateTime.now();

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public MedicalRecord getMedicalRecord() {
    return medicalRecord;
  }

  public void setMedicalRecord(MedicalRecord medicalRecord) {
    this.medicalRecord = medicalRecord;
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

  public RiskLevel getRiskLevel() {
    return riskLevel;
  }

  public void setRiskLevel(RiskLevel riskLevel) {
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
