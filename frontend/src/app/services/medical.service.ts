import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiResponse, GATEWAY_URL } from './api.config';

export interface MedicalRecord {
  id: number;
  userId: number;
  userName?: string;
  userEmail?: string;
  age: number;
  gender: string;
  educationLevel: string;
  familyHistory: string;
  riskFactors: string;
  currentSymptoms: string;
  diagnosisNotes: string;
  createdAt: string;
  updatedAt: string;
}

export type RiskLevel = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';

export interface Consultation {
  id: number;
  medicalRecordId: number;
  consultationDate: string;
  symptoms: string;
  observations: string;
  diagnosis: string;
  recommendations: string;
  riskLevel: RiskLevel | null;
  confidenceScore: number | null;
  doctorId: number | null;
  createdAt: string;
}

/** Payload for creating/updating a consultation (medicalRecordId required on create). */
export interface ConsultationInput {
  medicalRecordId?: number;
  consultationDate?: string;
  symptoms?: string;
  observations?: string;
  diagnosis?: string;
  recommendations?: string;
  riskLevel?: RiskLevel | null;
  confidenceScore?: number | null;
  doctorId?: number | null;
}

export interface MmseTest {
  id: number;
  patientName: string;
  orientationScore: number;
  registrationScore: number;
  attentionScore: number;
  recallScore: number;
  languageScore: number;
  totalScore: number;
  interpretation: string;
  testDate: string;
  medicalRecordId: number | null;
  notes: string;
}

export interface AiSummary {
  medicalRecordId: number;
  summary: string;
  generatedAt: string;
}

/**
 * Single entry point for the doctor's medical workflow. Every call goes through the API gateway
 * (see api.config.ts), so the component never references individual service ports.
 */
@Injectable({ providedIn: 'root' })
export class MedicalService {
  private recordsUrl = `${GATEWAY_URL}/api/medical-records`;
  private consultationsUrl = `${GATEWAY_URL}/api/consultations`;
  private mmseUrl = `${GATEWAY_URL}/api/mmse`;

  constructor(private http: HttpClient) {}

  // ---- Medical records ----------------------------------------------------

  getRecords(): Observable<MedicalRecord[]> {
    return this.http
      .get<ApiResponse<MedicalRecord[]>>(this.recordsUrl)
      .pipe(map((r) => r.data ?? []));
  }

  createRecord(input: Record<string, unknown>): Observable<MedicalRecord> {
    return this.http
      .post<ApiResponse<MedicalRecord>>(this.recordsUrl, input)
      .pipe(map((r) => r.data));
  }

  updateRecord(id: number, input: Record<string, unknown>): Observable<MedicalRecord> {
    return this.http
      .put<ApiResponse<MedicalRecord>>(`${this.recordsUrl}/${id}`, input)
      .pipe(map((r) => r.data));
  }

  deleteRecord(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.recordsUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  // ---- Consultations ------------------------------------------------------

  getConsultations(medicalRecordId: number): Observable<Consultation[]> {
    return this.http
      .get<ApiResponse<Consultation[]>>(`${this.consultationsUrl}/medical-record/${medicalRecordId}`)
      .pipe(map((r) => r.data ?? []));
  }

  createConsultation(input: ConsultationInput): Observable<Consultation> {
    return this.http
      .post<ApiResponse<Consultation>>(this.consultationsUrl, input)
      .pipe(map((r) => r.data));
  }

  updateConsultation(id: number, input: ConsultationInput): Observable<Consultation> {
    return this.http
      .put<ApiResponse<Consultation>>(`${this.consultationsUrl}/${id}`, input)
      .pipe(map((r) => r.data));
  }

  deleteConsultation(id: number): Observable<void> {
    return this.http
      .delete<ApiResponse<void>>(`${this.consultationsUrl}/${id}`)
      .pipe(map(() => undefined));
  }

  // ---- MMSE cognitive tests ----------------------------------------------

  /** Tests linked to a record. mmse-service answers 404 when there are none — treat as empty. */
  getMmseTests(medicalRecordId: number): Observable<MmseTest[]> {
    return this.http
      .get<ApiResponse<MmseTest[]>>(`${this.mmseUrl}/results/medical-record/${medicalRecordId}`)
      .pipe(
        map((r) => r.data ?? []),
        catchError(() => of([] as MmseTest[]))
      );
  }

  // ---- AI case summary ----------------------------------------------------

  generateAiSummary(medicalRecordId: number): Observable<AiSummary> {
    return this.http
      .post<ApiResponse<AiSummary>>(`${this.recordsUrl}/${medicalRecordId}/ai-summary`, {})
      .pipe(map((r) => r.data));
  }
}
