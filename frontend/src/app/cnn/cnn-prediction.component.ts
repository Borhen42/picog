import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-cnn-prediction',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './cnn-prediction.component.html',
  styleUrl: './cnn-prediction.component.css'
})
export class CNNPredictionComponent {
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  loading: boolean = false;
  loadingStage: string = '';
  loadingProgress: number = 0;
  prediction: any = null;
  error: string | null = null;
  success: string | null = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/dicom', 'application/dicom'];
      if (!validTypes.includes(file.type) && !file.name.endsWith('.dcm')) {
        this.error = 'Please select a valid brain scan image (JPG, PNG, or DICOM)';
        return;
      }

      this.selectedFile = file;
      this.error = null;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.previewUrl = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  uploadAndPredict(): void {
    if (!this.selectedFile) {
      this.error = 'Please select an image first';
      return;
    }

    this.loading = true;
    this.loadingProgress = 0;
    this.loadingStage = 'Preparing image...';
    this.error = null;
    this.success = null;
    this.prediction = null;

    console.log('🚀 Starting prediction with file:', this.selectedFile.name, 'Size:', this.selectedFile.size);

    // Simulate progress stages
    this.updateLoadingProgress(10, 'Uploading image to server...');

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    // Small delay to show upload progress
    setTimeout(() => {
      this.updateLoadingProgress(30, 'Processing image with AI model...');
      // Try Java backend first (port 8080)
      this.tryJavaBackend(formData);
    }, 300);
  }

  private updateLoadingProgress(progress: number, stage: string): void {
    this.loadingProgress = progress;
    this.loadingStage = stage;
  }

  private tryJavaBackend(formData: FormData): void {
    console.log('📤 Attempting Java backend: http://localhost:8084/api/cnn/predict');

    // Progress simulation
    let progressInterval: any = setInterval(() => {
      if (this.loading && this.loadingProgress < 90) {
        this.loadingProgress = Math.min(this.loadingProgress + 2, 90);
        if (this.loadingProgress < 50) {
          this.loadingStage = 'Analyzing brain structures...';
        } else if (this.loadingProgress < 70) {
          this.loadingStage = 'Running CNN model predictions...';
        } else {
          this.loadingStage = 'Finalizing results...';
        }
      }
    }, 500);

    this.http.post<any>(
      'http://localhost:8084/api/cnn/predict',
      formData
    ).subscribe({
      next: (response: any) => {
        if (progressInterval) clearInterval(progressInterval);
        this.updateLoadingProgress(100, 'Complete!');
        console.log('✅ Response received:', response);
        
        // Small delay to show 100% completion
        setTimeout(() => {
          this.loading = false;
          this.loadingProgress = 0;
          this.loadingStage = '';
        }, 300);
        
        try {
          console.log('📊 Full response:', response);
          
          // Handle response format: {success: true, data: {...}}
          if (response && response.success && response.data) {
            console.log('📊 Data object:', response.data);
            
            // Map backend response to frontend format
            const data = response.data;
            this.prediction = {
              diagnosis: data.diagnosis || data.prediction || 'Unknown',
              confidence: data.confidence || 0,
              model: data.model || 'CNN 3-Class',
              processingTime: data.processingTime || 'N/A',
              imageQuality: data.imageQuality || 'Unknown',
              recommendations: data.recommendations || [],
              scores: data.scores || []
            };
            
            this.success = '✅ Analysis completed successfully!';
            console.log('🎉 Prediction set:', this.prediction);
          } 
          // Handle direct data response (if backend returns data directly)
          else if (response && (response.diagnosis || response.prediction)) {
            console.log('📊 Direct data response');
            this.prediction = {
              diagnosis: response.diagnosis || response.prediction || 'Unknown',
              confidence: response.confidence || 0,
              model: response.model || 'CNN 3-Class',
              processingTime: response.processingTime || 'N/A',
              imageQuality: response.imageQuality || 'Unknown',
              recommendations: response.recommendations || [],
              scores: response.scores || []
            };
            this.success = '✅ Analysis completed successfully!';
            console.log('🎉 Prediction set:', this.prediction);
          } 
          else {
            this.error = response?.message || '❌ No prediction data in response';
            console.error('Invalid response format:', response);
          }
        } catch (e) {
          console.error('Error processing response:', e);
          this.error = '❌ Error processing prediction result: ' + (e instanceof Error ? e.message : 'Unknown error');
        }
      },
      error: (err: any) => {
        clearInterval(progressInterval);
        this.loading = false;
        this.loadingProgress = 0;
        this.loadingStage = '';
        console.error('❌ HTTP Error:', err);
        console.error('Status:', err.status);
        console.error('Status Text:', err.statusText);
        console.error('Error Object:', err.error);
        console.error('Full Error:', JSON.stringify(err, null, 2));

        if (err.status === 0) {
          this.error = '❌ Cannot reach CNN service on port 8084. Ensure cnn-service is running!';
        } else if (err.status === 405) {
          console.error('405 Method Not Allowed - trying Python backend as fallback');
          // Try Python backend as fallback
          this.tryPythonBackend(formData);
        } else if (err.status === 400) {
          this.error = '❌ Invalid file. Use JPG, PNG, or DICOM format.';
          this.loading = false;
        } else if (err.status === 413) {
          this.error = '❌ File too large (max 50MB).';
          this.loading = false;
        } else if (err.status === 500) {
          this.error = '❌ Server error: ' + (err.error?.message || 'Check backend logs');
          this.loading = false;
        } else if (err.status === 404) {
          console.error('404 Not Found - trying Python backend as fallback');
          this.tryPythonBackend(formData);
        } else {
          this.error = `❌ Error ${err.status}: ${err.statusText || err.error?.message || 'Unknown error'}`;
          this.loading = false;
        }
      }
    });
  }

  private tryPythonBackend(formData: FormData): void {
    console.log('📤 Attempting Python backend: http://localhost:8000/predict');
    this.updateLoadingProgress(40, 'Trying alternative backend...');

    // Progress simulation for Python backend
    let progressInterval: any = setInterval(() => {
      if (this.loading && this.loadingProgress < 90) {
        this.loadingProgress = Math.min(this.loadingProgress + 2, 90);
        if (this.loadingProgress < 60) {
          this.loadingStage = 'Connecting to AI model...';
        } else if (this.loadingProgress < 80) {
          this.loadingStage = 'Processing with deep learning...';
        } else {
          this.loadingStage = 'Generating diagnosis...';
        }
      }
    }, 500);

    this.http.post<any>(
      'http://localhost:8000/predict',
      formData
    ).subscribe({
      next: (response: any) => {
        if (progressInterval) clearInterval(progressInterval);
        this.updateLoadingProgress(100, 'Complete!');
        console.log('✅ Python backend response:', response);
        
        setTimeout(() => {
          this.loading = false;
          this.loadingProgress = 0;
          this.loadingStage = '';
        }, 300);
        
        try {
          // Python backend might return different format
          const data = response.data || response;
          this.prediction = {
            diagnosis: data.prediction || data.diagnosis || 'Unknown',
            confidence: data.confidence || 0,
            model: data.model || 'CNN Model',
            processingTime: data.processingTime || 'N/A',
            imageQuality: data.imageQuality || 'Unknown',
            recommendations: data.recommendations || [],
            scores: data.scores || []
          };
          
          this.success = '✅ Analysis completed successfully! (Python backend)';
          console.log('🎉 Prediction set:', this.prediction);
        } catch (e) {
          console.error('Error processing Python response:', e);
          this.error = '❌ Error processing prediction result: ' + (e instanceof Error ? e.message : 'Unknown error');
        }
      },
      error: (err: any) => {
        if (progressInterval) clearInterval(progressInterval);
        this.loading = false;
        this.loadingProgress = 0;
        this.loadingStage = '';
        console.error('❌ Python backend also failed:', err);
        this.error = '❌ Both backends failed. Ensure Python model is running on 8000 or cnn-service on 8084.';
      }
    });

    // Timeout safeguard (reduced from 30s to 20s)
    const timeoutId = setTimeout(() => {
      if (this.loading) {
        if (progressInterval) clearInterval(progressInterval);
        this.loading = false;
        this.loadingProgress = 0;
        this.loadingStage = '';
        this.error = '❌ Request timeout - server took too long to respond (20s limit)';
      }
    }, 20000);
  }

  resetPrediction(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.prediction = null;
    this.error = null;
    this.success = null;
  }

  getRiskClass(diagnosis: string): string {
    if (!diagnosis) return '';
    const lower = diagnosis.toLowerCase();
    if (lower.includes('normal')) return 'risk-normal';
    if (lower.includes('mild')) return 'risk-mild';
    if (lower.includes('moderate')) return 'risk-moderate';
    if (lower.includes('severe')) return 'risk-severe';
    return '';
  }
}
