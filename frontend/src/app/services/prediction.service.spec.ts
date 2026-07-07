import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PredictionService } from './prediction.service';

describe('PredictionService', () => {
  let service: PredictionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PredictionService],
    });
    service = TestBed.inject(PredictionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should POST to http://localhost:8000/predict', () => {
    const file = new File(['brain-data'], 'brain.jpg', { type: 'image/jpeg' });
    const mockResponse = { diagnosis: 'Normal Cognition', confidence: 0.92 };

    service.predict(file).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    const req = httpMock.expectOne('http://localhost:8000/predict');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeInstanceOf(FormData);
    req.flush(mockResponse);
  });

  it('should append file under key "file" in FormData', () => {
    const file = new File(['data'], 'scan.png', { type: 'image/png' });

    service.predict(file).subscribe();

    const req = httpMock.expectOne('http://localhost:8000/predict');
    const formData = req.request.body as FormData;
    expect(formData.get('file')).toBe(file);
    req.flush({});
  });

  it('should return observable from HTTP response', (done) => {
    const file = new File(['x'], 'x.jpg', { type: 'image/jpeg' });
    const expected = { diagnosis: 'Mild Cognitive Impairment' };

    service.predict(file).subscribe(res => {
      expect(res).toEqual(expected);
      done();
    });

    httpMock.expectOne('http://localhost:8000/predict').flush(expected);
  });
});
