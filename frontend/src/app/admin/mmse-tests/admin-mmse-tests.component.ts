import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-admin-mmse-tests',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './admin-mmse-tests.component.html',
  styleUrl: './admin-mmse-tests.component.css'
})
export class AdminMmseTestsComponent implements OnInit {
  loading = true;
  error: string | null = null;
  tests: any[] = [];
  query = '';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading = true;
    this.error = null;
    this.adminService.getMMSETests().subscribe({
      next: (data: any[]) => {
        const list = Array.isArray(data) ? data : [];
        this.tests = list;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading MMSE tests', err);
        const status = typeof err?.status === 'number' ? ` (HTTP ${err.status})` : '';
        this.error = `Failed to load MMSE tests${status}`;
        this.loading = false;
      }
    });
  }

  get filtered(): any[] {
    const q = this.query.trim().toLowerCase();
    if (!q) return this.tests;
    return this.tests.filter((t) => {
      const patient = String(t?.patientName ?? '').toLowerCase();
      const notes = String(t?.notes ?? '').toLowerCase();
      return patient.includes(q) || notes.includes(q);
    });
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

  scoreOf(test: any): number {
    const v = test?.totalScore;
    const n = typeof v === 'number' ? v : Number(v ?? 0);
    return Number.isFinite(n) ? n : 0;
  }
}

