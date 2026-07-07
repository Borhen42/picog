import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.css'
})
export class AdminDashboardComponent implements OnInit {
  users: any[] = [];
  medicalRecords: any[] = [];
  stats: any = {
    usersCount: 0,
    mmseTestsCount: 0,
    activeUsersCount: 0,
    medicalRecordsCount: 0
  };
  loading = true;
  loadingMedical = true;
  error: string | null = null;
  medicalError: string | null = null;
  today = new Date();

  searchUsersQuery = '';
  searchMedicalQuery = '';
  filterUsersRole = '';
  filterUsersStatus = '';
  filterMedicalGender = '';
  filterMedicalFamilyHistory = '';
  sortUsersBy: string = 'userId';
  sortUsersDir: 'asc' | 'desc' = 'asc';
  sortMedicalBy: string = 'id';
  sortMedicalDir: 'asc' | 'desc' = 'asc';

  editingMedicalRecord: any | null = null;
  confirmDeleteUser: number | null = null;
  confirmDeleteMedical: number | null = null;
  deleteSuccessMessage: string | null = null;
  medicalForm = {
    age: null as number | null,
    gender: 'Male',
    educationLevel: '',
    familyHistory: 'No',
    riskFactors: '',
    currentSymptoms: '',
    diagnosisNotes: ''
  };

  constructor(
    private adminService: AdminService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadStats();
    this.loadMedicalRecords();
  }

  loadDashboard(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getDashboard().subscribe({
      next: (data: any) => {
        this.users = data || [];
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading dashboard', err);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  loadStats(): void {
    this.adminService.getStats().subscribe({
      next: (stats: any) => {
        this.stats = stats || {
          usersCount: 0,
          mmseTestsCount: 0,
          activeUsersCount: 0,
          medicalRecordsCount: 0
        };
      },
      error: (err: any) => {
        console.error('Error loading stats', err);
      }
    });
  }

  loadMedicalRecords(): void {
    this.loadingMedical = true;
    this.medicalError = null;
    this.adminService.getMedicalRecords().subscribe({
      next: (data: any[]) => {
        this.medicalRecords = data || [];
        this.loadingMedical = false;
      },
      error: (err: any) => {
        console.error('Error loading medical records', err);
        this.medicalError = 'Failed to load medical records';
        this.loadingMedical = false;
      }
    });
  }

  goToMmseTests(): void {
    this.router.navigate(['/admin/mmse-tests']);
  }

  deleteUser(userId: number): void {
    this.confirmDeleteUser = userId;
  }

  cancelDeleteUser(): void {
    this.confirmDeleteUser = null;
  }

  confirmUserDelete(): void {
    const userId = this.confirmDeleteUser;
    if (userId == null) return;
    this.confirmDeleteUser = null;
    this.adminService.deleteUser(userId).subscribe({
      next: () => {
        this.loadDashboard();
        this.loadStats();
        this.deleteSuccessMessage = 'User has been deleted.';
        setTimeout(() => (this.deleteSuccessMessage = null), 2500);
      },
      error: (err: any) => {
        console.error('Error deleting user', err);
        this.error = 'Failed to delete user';
      }
    });
  }

  deleteMedicalRecord(recordId: number): void {
    this.confirmDeleteMedical = recordId;
  }

  cancelDeleteMedical(): void {
    this.confirmDeleteMedical = null;
  }

  confirmMedicalDelete(): void {
    const recordId = this.confirmDeleteMedical;
    if (recordId == null) return;
    this.confirmDeleteMedical = null;
    this.adminService.deleteMedicalRecord(recordId).subscribe({
      next: () => {
        this.loadMedicalRecords();
        this.loadStats();
        this.deleteSuccessMessage = 'Medical record has been deleted.';
        setTimeout(() => (this.deleteSuccessMessage = null), 2500);
      },
      error: (err: any) => {
        console.error('Error deleting medical record', err);
        this.medicalError = 'Failed to delete medical record';
      }
    });
  }

  editMedicalRecord(record: any): void {
    this.editingMedicalRecord = record;
    this.medicalForm = {
      age: typeof record.age === 'number' ? record.age : Number(record.age ?? 0),
      gender: record.gender || 'Male',
      educationLevel: record.educationLevel || '',
      familyHistory: record.familyHistory || 'No',
      riskFactors: record.riskFactors || '',
      currentSymptoms: record.currentSymptoms || '',
      diagnosisNotes: record.diagnosisNotes || ''
    };
  }

  closeMedicalEditor(): void {
    this.editingMedicalRecord = null;
  }

  saveMedicalRecord(): void {
    if (!this.editingMedicalRecord) return;

    const id = Number(this.editingMedicalRecord.id);
    const payload = {
      age: this.medicalForm.age,
      gender: this.medicalForm.gender,
      educationLevel: this.medicalForm.educationLevel,
      familyHistory: this.medicalForm.familyHistory,
      riskFactors: this.medicalForm.riskFactors,
      currentSymptoms: this.medicalForm.currentSymptoms,
      diagnosisNotes: this.medicalForm.diagnosisNotes
    };

    this.adminService.updateMedicalRecord(id, payload).subscribe({
      next: () => {
        this.closeMedicalEditor();
        this.loadMedicalRecords();
        this.loadStats();
      },
      error: (err: any) => {
        console.error('Error updating medical record', err);
        this.medicalError = 'Failed to update medical record';
      }
    });
  }

  getMMSEInterpretation(score: number): string {
    if (score >= 24) return 'Normal';
    if (score >= 18) return 'Mild Impairment';
    if (score >= 10) return 'Moderate Impairment';
    return 'Severe Impairment';
  }

  getInterpretationClass(score: number): string {
    if (score >= 24) return 'normal';
    if (score >= 18) return 'mild';
    if (score >= 10) return 'moderate';
    return 'severe';
  }

  getCareLabel(score: number): string {
    if (score < 12) return 'DANGER';
    if (score < 18) return 'NEEDS MEDICAL CARE';
    if (score < 24) return 'FOLLOW‑UP';
    return 'OK';
  }

  getCareClass(score: number): string {
    if (score < 12) return 'danger';
    if (score < 18) return 'care';
    if (score < 24) return 'followup';
    return 'ok';
  }

  get filteredUsers(): any[] {
    const q = (this.searchUsersQuery || '').toLowerCase().trim();
    let list = this.users;
    if (q) {
      list = list.filter(u =>
        [String(u.userId), (u.firstName || ''), (u.lastName || ''), (u.email || ''), (u.role || '')]
          .some(v => String(v).toLowerCase().includes(q))
      );
    }
    if (this.filterUsersRole) {
      list = list.filter(u => (u.role || '').toLowerCase() === this.filterUsersRole.toLowerCase());
    }
    if (this.filterUsersStatus) {
      const active = this.filterUsersStatus === 'active';
      list = list.filter(u => !!u.active === active);
    }
    list = [...list].sort((a, b) => {
      let va: any = a[this.sortUsersBy];
      let vb: any = b[this.sortUsersBy];
      if (this.sortUsersBy === 'firstName' || this.sortUsersBy === 'lastName') {
        va = [a.firstName, a.lastName].filter(Boolean).join(' ');
        vb = [b.firstName, b.lastName].filter(Boolean).join(' ');
      }
      if (va == null) va = '';
      if (vb == null) vb = '';
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return this.sortUsersDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }

  get filteredMedicalRecords(): any[] {
    const q = (this.searchMedicalQuery || '').toLowerCase().trim();
    let list = this.medicalRecords;
    if (q) {
      list = list.filter(r =>
        [String(r.id), String(r.userId), (r.userName || ''), (r.userEmail || ''), String(r.age), (r.gender || ''), (r.familyHistory || '')]
          .some(v => String(v).toLowerCase().includes(q))
      );
    }
    if (this.filterMedicalGender) {
      list = list.filter(r => (r.gender || '').toLowerCase() === this.filterMedicalGender.toLowerCase());
    }
    if (this.filterMedicalFamilyHistory) {
      list = list.filter(r => (r.familyHistory || '').toLowerCase() === this.filterMedicalFamilyHistory.toLowerCase());
    }
    list = [...list].sort((a, b) => {
      let va: any = a[this.sortMedicalBy];
      let vb: any = b[this.sortMedicalBy];
      if (this.sortMedicalBy === 'updatedAt' && !va) va = a.createdAt;
      if (this.sortMedicalBy === 'updatedAt' && !vb) vb = b.createdAt;
      if (va == null) va = '';
      if (vb == null) vb = '';
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;
      return this.sortMedicalDir === 'asc' ? cmp : -cmp;
    });
    return list;
  }

  setSortUsers(col: string): void {
    if (this.sortUsersBy === col) {
      this.sortUsersDir = this.sortUsersDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortUsersBy = col;
      this.sortUsersDir = 'asc';
    }
  }

  setSortMedical(col: string): void {
    if (this.sortMedicalBy === col) {
      this.sortMedicalDir = this.sortMedicalDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortMedicalBy = col;
      this.sortMedicalDir = 'asc';
    }
  }

  sortIconUsers(col: string): string {
    if (this.sortUsersBy !== col) return '↕';
    return this.sortUsersDir === 'asc' ? '↑' : '↓';
  }

  sortIconMedical(col: string): string {
    if (this.sortMedicalBy !== col) return '↕';
    return this.sortMedicalDir === 'asc' ? '↑' : '↓';
  }
}
