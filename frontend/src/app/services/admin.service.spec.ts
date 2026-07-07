import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { AdminService } from './admin.service';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;

  const adminUrl = 'http://localhost:8091/api/admin';
  const usersUrl = 'http://localhost:8082/api/users';
  const mmseUrl  = 'http://localhost:8085/api/mmse';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService],
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getSuperDashboard() — GET /super-dashboard, unwraps data', () => {
    const data = { usersCount: 10 };
    service.getSuperDashboard().subscribe(res => expect(res).toEqual(data));
    const req = httpMock.expectOne(`${adminUrl}/super-dashboard`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data });
  });

  it('getDashboard() — GET /users-with-mmse, unwraps data', () => {
    const data = [{ id: 1 }];
    service.getDashboard().subscribe(res => expect(res).toEqual(data));
    const req = httpMock.expectOne(`${adminUrl}/users-with-mmse`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data });
  });

  it('getStats() — GET /stats', () => {
    service.getStats().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/stats`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: {} });
  });

  it('getMedicalRecords() — GET /medical-records', () => {
    service.getMedicalRecords().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/medical-records`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('updateMedicalRecord() — PUT /medical-records/1 with body', () => {
    const updates = { age: 70 };
    service.updateMedicalRecord(1, updates).subscribe();
    const req = httpMock.expectOne(`${adminUrl}/medical-records/1`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updates);
    req.flush({ success: true, message: '', data: {} });
  });

  it('deleteMedicalRecord() — DELETE /medical-records/1', () => {
    service.deleteMedicalRecord(1).subscribe();
    const req = httpMock.expectOne(`${adminUrl}/medical-records/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('searchUsers() — GET /search?query=alice', () => {
    service.searchUsers('alice').subscribe();
    const req = httpMock.expectOne(`${adminUrl}/search?query=alice`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('filterUsers(role, active) — includes both params', () => {
    service.filterUsers('ADMIN', true).subscribe();
    const req = httpMock.expectOne(r =>
      r.url === `${adminUrl}/filter` &&
      r.params.get('role') === 'ADMIN' &&
      r.params.get('active') === 'true'
    );
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('filterUsers() — no params when omitted', () => {
    service.filterUsers().subscribe();
    const req = httpMock.expectOne(r =>
      r.url === `${adminUrl}/filter` &&
      !r.params.has('role') &&
      !r.params.has('active')
    );
    req.flush({ success: true, message: '', data: [] });
  });

  it('exportUsers() — GET /export/users', () => {
    service.exportUsers().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/export/users`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('exportMMSE() — GET /export/mmse', () => {
    service.exportMMSE().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/export/mmse`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getMMSETests() — GET /mmse-tests on success', () => {
    service.getMMSETests().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/mmse-tests`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getMMSETests() — falls back to mmse-service on admin 404', () => {
    service.getMMSETests().subscribe();
    const adminReq = httpMock.expectOne(`${adminUrl}/mmse-tests`);
    adminReq.flush(null, { status: 404, statusText: 'Not Found' });
    const fallbackReq = httpMock.expectOne(`${mmseUrl}/results`);
    expect(fallbackReq.request.method).toBe('GET');
    fallbackReq.flush({ success: true, message: '', data: [] });
  });

  it('getActivityLog() — default limit 50', () => {
    service.getActivityLog().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/activity-log?limit=50`);
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, message: '', data: [] });
  });

  it('getActivityLog(10) — custom limit', () => {
    service.getActivityLog(10).subscribe();
    const req = httpMock.expectOne(`${adminUrl}/activity-log?limit=10`);
    req.flush({ success: true, message: '', data: [] });
  });

  it('deleteUser() — DELETE on users API', () => {
    service.deleteUser(5).subscribe();
    const req = httpMock.expectOne(`${usersUrl}/5`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('backupDatabase() — POST /backup', () => {
    service.backupDatabase().subscribe();
    const req = httpMock.expectOne(`${adminUrl}/backup`);
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, message: '', data: { status: 'success' } });
  });

  it('submitMMSETest() — POST to mmse-service/submit with body', () => {
    const testData = { patient_name: 'Alice', total_score: 28 };
    service.submitMMSETest(testData).subscribe();
    const req = httpMock.expectOne(`${mmseUrl}/submit`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(testData);
    req.flush({ success: true });
  });
});
