import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  error?: string;
  timestamp?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8091/api/admin';
  private usersApiUrl = 'http://localhost:8082/api/users';
  private mmseApiUrl = 'http://localhost:8085/api/mmse';

  constructor(private http: HttpClient) {}

  getSuperDashboard(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/super-dashboard`).pipe(
      map(response => response.data)
    );
  }

  getDashboard(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/users-with-mmse`).pipe(
      map(response => response.data)
    );
  }

  getStats(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.apiUrl}/stats`).pipe(
      map(response => response.data)
    );
  }

  getMedicalRecords(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/medical-records`).pipe(
      map((response) => response.data)
    );
  }

  updateMedicalRecord(recordId: number, updates: Record<string, any>): Observable<any> {
    return this.http.put<ApiResponse<any>>(`${this.apiUrl}/medical-records/${recordId}`, updates).pipe(
      map((response) => response.data)
    );
  }

  deleteMedicalRecord(recordId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/medical-records/${recordId}`);
  }

  searchUsers(query: string): Observable<any[]> {
    const params = new HttpParams().set('query', query);
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/search`, { params }).pipe(
      map(response => response.data)
    );
  }

  filterUsers(role?: string, active?: boolean): Observable<any[]> {
    let params = new HttpParams();
    if (role) {
      params = params.set('role', role);
    }
    if (active !== undefined) {
      params = params.set('active', active.toString());
    }
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/filter`, { params }).pipe(
      map(response => response.data)
    );
  }

  exportUsers(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/export/users`).pipe(
      map(response => response.data)
    );
  }

  exportMMSE(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/export/mmse`).pipe(
      map(response => response.data)
    );
  }

  getMMSETests(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/mmse-tests`).pipe(
      map((response) => response.data),
      catchError((adminErr) => {
        // Fallback for when admin-service isn't restarted / endpoint missing.
        return this.http.get<ApiResponse<any[]>>(`${this.mmseApiUrl}/results`).pipe(
          map((response) => response.data),
          catchError(() => throwError(() => adminErr))
        );
      })
    );
  }

  getActivityLog(limit?: number): Observable<any[]> {
    const params = new HttpParams().set('limit', (limit || 50).toString());
    return this.http.get<ApiResponse<any[]>>(`${this.apiUrl}/activity-log`, { params }).pipe(
      map(response => response.data)
    );
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.usersApiUrl}/${userId}`);
  }

  backupDatabase(): Observable<any> {
    return this.http.post<ApiResponse<any>>(`${this.apiUrl}/backup`, {}).pipe(
      map(response => response.data)
    );
  }

  submitMMSETest(testData: any): Observable<any> {
    return this.http.post<any>('http://localhost:8085/api/mmse/submit', testData);
  }
}
