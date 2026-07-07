import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';

@Component({
  selector: 'app-super-admin-dashboard',
  standalone: true,
  imports: [CommonModule, HttpClientModule, FormsModule],
  templateUrl: './super-admin-dashboard.component.html',
  styleUrl: './super-admin-dashboard.component.css'
})
export class SuperAdminDashboardComponent implements OnInit {
  dashboardData: any = null;
  users: any[] = [];
  searchQuery: string = '';
  selectedRole: string = '';
  selectedStatus: string = '';
  loading = true;
  error: string | null = null;
  activeTab: string = 'overview';

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.adminService.getSuperDashboard().subscribe({
      next: (data: any) => {
        this.dashboardData = data;
        this.loading = false;
      },
      error: (err: any) => {
        console.error('Error loading dashboard', err);
        this.error = 'Failed to load dashboard data';
        this.loading = false;
      }
    });
  }

  searchUsers(): void {
    if (this.searchQuery.trim()) {
      this.adminService.searchUsers(this.searchQuery).subscribe({
        next: (data: any) => {
          this.users = data;
        }
      });
    }
  }

  filterUsers(): void {
    this.adminService.filterUsers(this.selectedRole || undefined, 
                                 this.selectedStatus === 'active' ? true : this.selectedStatus === 'inactive' ? false : undefined).subscribe({
      next: (data: any) => {
        this.users = data;
      }
    });
  }

  exportUsersCSV(): void {
    this.adminService.exportUsers().subscribe({
      next: (data: any) => {
        this.downloadCSV(data, 'users.csv');
      }
    });
  }

  exportMMSECSV(): void {
    this.adminService.exportMMSE().subscribe({
      next: (data: any) => {
        this.downloadCSV(data, 'mmse-tests.csv');
      }
    });
  }

  downloadCSV(data: any[], filename: string): void {
    const csv = this.convertToCSV(data);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
  }

  convertToCSV(data: any[]): string {
    if (!data || data.length === 0) return '';
    const headers = Object.keys(data[0]).join(',');
    const rows = data.map(obj => Object.values(obj).join(','));
    return [headers, ...rows].join('\n');
  }

  getHealthStatusClass(status: string): string {
    return status === 'HEALTHY' ? 'healthy' : status === 'WARNING' ? 'warning' : 'critical';
  }

  getTrendIcon(trend: string): string {
    return trend === 'UP' ? '📈' : trend === 'DOWN' ? '📉' : '➡️';
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user?')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.loadDashboard();
        }
      });
    }
  }
}
