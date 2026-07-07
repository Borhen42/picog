import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PredictionService } from '../services/prediction.service';
import { Brain3dComponent } from '../brain3d/brain3d.component';


@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, Brain3dComponent],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.css'
})
export class UploadComponent {

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  result: any = null;
  loading = false;
  errorMessage: string | null = null;

  constructor(
    private predictionService: PredictionService,
    private cdr: ChangeDetectorRef
  ) {}

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
      this.errorMessage = null;
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.imagePreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit(): void {
    if (!this.selectedFile) {
      this.errorMessage = 'Please select an MRI image first.';
      return;
    }

    this.loading = true;
    this.result = null;
    this.errorMessage = null;

    this.predictionService.predict(this.selectedFile).subscribe({
      next: (res: any) => {
        console.log('API response:', res);

        // Handle different response formats
        const responseData = res.data || res;
        
        // Extract prediction (could be prediction, diagnosis, or class)
        const prediction = responseData.prediction || 
                          responseData.diagnosis || 
                          responseData.class || 
                          responseData.result || 
                          'Unknown';

        // Extract confidence (could be decimal 0-1 or percentage 0-100)
        let confidence = responseData.confidence || 
                        responseData.confidence_score || 
                        responseData.score || 
                        0;
        
        // Convert decimal to percentage if needed
        if (confidence <= 1 && confidence > 0) {
          confidence = Math.round(confidence * 100);
        } else {
          confidence = Math.round(confidence);
        }

        // Extract probabilities (could be probabilities, scores, or probs)
        let probabilities = responseData.probabilities || 
                           responseData.scores || 
                           responseData.probs || 
                           responseData.class_probabilities || 
                           {};

        // If probabilities is an array, convert to object
        if (Array.isArray(probabilities)) {
          const probObj: any = {};
          probabilities.forEach((prob: any, index: number) => {
            const label = prob.label || prob.class || prob.name || `Class ${index + 1}`;
            const value = prob.value || prob.probability || prob.score || 0;
            probObj[label] = Math.round((value <= 1 ? value * 100 : value) * 10) / 10;
          });
          probabilities = probObj;
        } else if (probabilities && typeof probabilities === 'object') {
          // Convert decimal probabilities to percentages
          const probObj: any = {};
          Object.keys(probabilities).forEach(key => {
            const value = probabilities[key];
            probObj[key] = Math.round((value <= 1 ? value * 100 : value) * 10) / 10;
          });
          probabilities = probObj;
        }

        // Build result object
        this.result = {
          prediction: prediction,
          confidence: confidence,
          probabilities: probabilities,
          imagePreview: this.imagePreview || null,
          rawResponse: responseData // Keep raw response for debugging
        };

        console.log('✅ Processed result:', this.result);
        console.log('✅ Prediction:', prediction);
        console.log('✅ Confidence:', confidence);
        console.log('✅ Probabilities:', probabilities);

        this.loading = false;
        this.errorMessage = null;

        // Force UI update
        this.cdr.detectChanges();
        
        // Scroll to results after a short delay
        setTimeout(() => {
          const resultsSection = document.querySelector('.results-section');
          if (resultsSection) {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 300);
      },
      error: (err) => {
        console.error('Prediction error:', err);
        this.errorMessage = err.error?.message || 
                           err.message || 
                           'Error analyzing MRI image. Please try again.';
        this.loading = false;
        this.result = null;
        this.cdr.detectChanges();
      }
    });
  }
}
