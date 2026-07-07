import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Brain3dComponent } from '../brain3d/brain3d.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-upload',
  standalone: true,
  imports: [CommonModule, Brain3dComponent],
  templateUrl: './upload.html',
  styleUrl: './upload.css'
})
export class UploadComponent {

  selectedFile: File | null = null;
  loading = false;
  result: any = null;

  constructor(private http: HttpClient) {}

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onSubmit() {
    if (!this.selectedFile) return;

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.loading = true;

    this.http.post<any>('http://127.0.0.1:8000/predict', formData)
      .subscribe(res => {
        this.result = res;
        this.loading = false;
      });
  }
}
