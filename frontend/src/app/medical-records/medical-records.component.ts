import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Brain3dComponent } from '../brain3d/brain3d.component';
import {
  MedicalService,
  MedicalRecord,
  Consultation,
  ConsultationInput,
  MmseTest,
  RiskLevel
} from '../services/medical.service';

@Component({
  selector: 'app-medical-records',
  standalone: true,
  imports: [CommonModule, FormsModule, Brain3dComponent],
  templateUrl: './medical-records.component.html',
  styleUrls: ['./medical-records.component.css']
})
export class MedicalRecordsComponent implements OnInit {
  records: MedicalRecord[] = [];
  selectedRecord: MedicalRecord | null = null;
  loading = true;
  error: string | null = null;
  showForm = false;
  isEditing = false;

  formData = {
    userId: null as number | null,
    age: null as number | null,
    gender: '',
    educationLevel: '',
    familyHistory: 'No',
    riskFactors: '',
    currentSymptoms: '',
    diagnosisNotes: ''
  };

  // --- Consultations for the selected record ---
  consultations: Consultation[] = [];
  consultationsLoading = false;
  showConsultationForm = false;
  isEditingConsultation = false;
  editingConsultationId: number | null = null;
  consultationError: string | null = null;
  readonly riskLevels: RiskLevel[] = ['LOW', 'MODERATE', 'HIGH', 'CRITICAL'];
  consultationForm: ConsultationInput = this.emptyConsultation();

  // --- MMSE cognitive tests for the selected record ---
  mmseTests: MmseTest[] = [];
  mmseLoading = false;

  // --- AI case summary ---
  aiSummary: string | null = null;
  aiGeneratedAt: string | null = null;
  aiLoading = false;
  aiError: string | null = null;

  constructor(private medical: MedicalService) {}

  ngOnInit(): void {
    this.loadRecords();
  }

  loadRecords(): void {
    this.loading = true;
    this.error = null;
    this.medical.getRecords().subscribe({
      next: (records) => {
        this.records = records;
        this.error = null;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading records', err);
        const status = err?.status;
        this.error =
          status === 0 || err?.message?.includes('Unknown Error')
            ? 'Cannot reach the API gateway (port 8093). Start the backend (Eureka, gateway, medical-service) and try again.'
            : 'Failed to load medical records';
        this.loading = false;
      }
    });
  }

  // ============================================================
  //  Record detail (opens consultations + tests + AI panel)
  // ============================================================

  viewRecord(record: MedicalRecord): void {
    this.selectedRecord = record;
    this.resetAiSummary();
    this.closeConsultationForm();
    this.loadConsultations(record.id);
    this.loadMmseTests(record.id);
  }

  closeDetails(): void {
    this.selectedRecord = null;
    this.consultations = [];
    this.mmseTests = [];
    this.closeConsultationForm();
    this.resetAiSummary();
  }

  // ============================================================
  //  Medical record CRUD
  // ============================================================

  openCreateForm(): void {
    this.isEditing = false;
    this.error = null;
    this.formData = {
      userId: null,
      age: null,
      gender: '',
      educationLevel: '',
      familyHistory: 'No',
      riskFactors: '',
      currentSymptoms: '',
      diagnosisNotes: ''
    };
    this.showForm = true;
  }

  openEditForm(record: MedicalRecord): void {
    this.isEditing = true;
    this.error = null;
    this.formData = {
      userId: record.userId,
      age: record.age,
      gender: record.gender,
      educationLevel: record.educationLevel,
      familyHistory: record.familyHistory,
      riskFactors: record.riskFactors,
      currentSymptoms: record.currentSymptoms,
      diagnosisNotes: record.diagnosisNotes
    };
    this.selectedRecord = record;
    this.showForm = true;
  }

  closeForm(): void {
    this.showForm = false;
    this.error = null;
  }

  submitForm(): void {
    if (!this.formData.userId || !this.formData.age || !this.formData.gender) {
      this.error = 'Please fill in all required fields (User ID, Age, Gender)';
      return;
    }

    if (this.isEditing && this.selectedRecord) {
      this.medical.updateRecord(this.selectedRecord.id, this.formData).subscribe({
        next: () => {
          this.loadRecords();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error updating record', err);
          this.error = 'Failed to update record: ' + (err.error?.message || err.message);
        }
      });
    } else {
      this.medical.createRecord(this.formData).subscribe({
        next: () => {
          this.loadRecords();
          this.closeForm();
        },
        error: (err) => {
          console.error('Error creating record', err);
          this.error = 'Failed to create record: ' + (err.error?.message || err.message);
        }
      });
    }
  }

  deleteRecord(id: number): void {
    if (confirm('Are you sure you want to delete this medical record?')) {
      this.medical.deleteRecord(id).subscribe({
        next: () => {
          this.loadRecords();
          this.closeDetails();
        },
        error: (err) => {
          console.error('Error deleting record', err);
          this.error = 'Failed to delete record';
        }
      });
    }
  }

  // ============================================================
  //  Consultations
  // ============================================================

  loadConsultations(recordId: number): void {
    this.consultationsLoading = true;
    this.medical.getConsultations(recordId).subscribe({
      next: (list) => {
        this.consultations = list;
        this.consultationsLoading = false;
      },
      error: (err) => {
        console.error('Error loading consultations', err);
        this.consultations = [];
        this.consultationsLoading = false;
      }
    });
  }

  openAddConsultation(): void {
    this.isEditingConsultation = false;
    this.editingConsultationId = null;
    this.consultationError = null;
    this.consultationForm = this.emptyConsultation();
    this.showConsultationForm = true;
  }

  openEditConsultation(c: Consultation): void {
    this.isEditingConsultation = true;
    this.editingConsultationId = c.id;
    this.consultationError = null;
    this.consultationForm = {
      consultationDate: c.consultationDate ? c.consultationDate.substring(0, 16) : '',
      symptoms: c.symptoms,
      observations: c.observations,
      diagnosis: c.diagnosis,
      recommendations: c.recommendations,
      riskLevel: c.riskLevel,
      confidenceScore: c.confidenceScore,
      doctorId: c.doctorId
    };
    this.showConsultationForm = true;
  }

  closeConsultationForm(): void {
    this.showConsultationForm = false;
    this.isEditingConsultation = false;
    this.editingConsultationId = null;
    this.consultationError = null;
  }

  submitConsultation(): void {
    if (!this.selectedRecord) {
      return;
    }
    const form = this.consultationForm;
    if (!form.symptoms?.trim() && !form.diagnosis?.trim() && !form.observations?.trim()) {
      this.consultationError = 'Add at least symptoms, observations or a diagnosis.';
      return;
    }

    const payload: ConsultationInput = {
      ...form,
      confidenceScore:
        form.confidenceScore === null || form.confidenceScore === undefined || (form.confidenceScore as any) === ''
          ? null
          : Number(form.confidenceScore),
      doctorId:
        form.doctorId === null || form.doctorId === undefined || (form.doctorId as any) === ''
          ? null
          : Number(form.doctorId)
    };

    if (this.isEditingConsultation && this.editingConsultationId != null) {
      this.medical.updateConsultation(this.editingConsultationId, payload).subscribe({
        next: () => {
          this.loadConsultations(this.selectedRecord!.id);
          this.closeConsultationForm();
        },
        error: (err) => {
          this.consultationError = 'Failed to save consultation: ' + (err.error?.message || err.message);
        }
      });
    } else {
      this.medical.createConsultation({ ...payload, medicalRecordId: this.selectedRecord.id }).subscribe({
        next: () => {
          this.loadConsultations(this.selectedRecord!.id);
          this.closeConsultationForm();
        },
        error: (err) => {
          this.consultationError = 'Failed to save consultation: ' + (err.error?.message || err.message);
        }
      });
    }
  }

  deleteConsultation(c: Consultation): void {
    if (!this.selectedRecord) {
      return;
    }
    if (confirm('Delete this consultation?')) {
      this.medical.deleteConsultation(c.id).subscribe({
        next: () => this.loadConsultations(this.selectedRecord!.id),
        error: (err) => console.error('Error deleting consultation', err)
      });
    }
  }

  // ============================================================
  //  MMSE cognitive tests
  // ============================================================

  loadMmseTests(recordId: number): void {
    this.mmseLoading = true;
    this.medical.getMmseTests(recordId).subscribe({
      next: (tests) => {
        this.mmseTests = tests;
        this.mmseLoading = false;
      },
      error: () => {
        this.mmseTests = [];
        this.mmseLoading = false;
      }
    });
  }

  // ============================================================
  //  AI case summary
  // ============================================================

  generateSummary(): void {
    if (!this.selectedRecord) {
      return;
    }
    this.aiLoading = true;
    this.aiError = null;
    this.aiSummary = null;
    this.medical.generateAiSummary(this.selectedRecord.id).subscribe({
      next: (result) => {
        this.aiSummary = result.summary;
        this.aiGeneratedAt = result.generatedAt;
        this.aiLoading = false;
      },
      error: (err) => {
        console.error('Error generating AI summary', err);
        this.aiError = err.error?.error || err.error?.message || 'Failed to generate AI summary.';
        this.aiLoading = false;
      }
    });
  }

  private resetAiSummary(): void {
    this.aiSummary = null;
    this.aiGeneratedAt = null;
    this.aiError = null;
    this.aiLoading = false;
  }

  private emptyConsultation(): ConsultationInput {
    // Pre-fill the date with "now" in the datetime-local format (YYYY-MM-DDTHH:mm).
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - offset * 60000);
    return {
      consultationDate: local.toISOString().substring(0, 16),
      symptoms: '',
      observations: '',
      diagnosis: '',
      recommendations: '',
      riskLevel: null,
      confidenceScore: null,
      doctorId: null
    };
  }

  // ============================================================
  //  Presentation helpers
  // ============================================================

  getRiskClass(familyHistory: string): string {
    return familyHistory === 'Yes' ? 'high-risk' : 'low-risk';
  }

  riskLevelClass(level: RiskLevel | null): string {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return 'risk-high';
      case 'MODERATE':
        return 'risk-moderate';
      case 'LOW':
        return 'risk-low';
      default:
        return 'risk-none';
    }
  }

  mmseScoreClass(score: number): string {
    if (score >= 24) return 'score-normal';
    if (score >= 18) return 'score-mild';
    if (score >= 10) return 'score-moderate';
    return 'score-severe';
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatDateTime(dateString: string): string {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getInitials(name?: string | null): string {
    const safe = (name ?? '').trim();
    if (!safe) return '?';

    const initials = safe
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();

    return initials || '?';
  }

  getHighRiskCount(): number {
    return this.records.filter((r) => r.familyHistory === 'Yes').length;
  }

  getAverageAge(): number {
    if (this.records.length === 0) return 0;
    const sum = this.records.reduce((acc, r) => acc + (r.age || 0), 0);
    return Math.round(sum / this.records.length);
  }
}
