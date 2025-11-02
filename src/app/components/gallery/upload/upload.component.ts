import { Component, ElementRef, ViewChild, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { PhotoService } from '../../../services/photo.service';

@Component({
  selector: 'app-upload',
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './upload.component.html',
  styleUrl: './upload.component.scss'
})
export class UploadComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @Output() uploadSuccess = new EventEmitter<void>();
  
  isDragging = false;
  uploadProgress = 0;
  isUploading = false;
  selectedFile: File | null = null;
  description = '';

  constructor(private photoService: PhotoService) {}

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      this.handleFile(files[0]);
    }
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  handleFile(file: File) {
    // Prüfen, ob es eine Bilddatei ist
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei aus');
      return;
    }

    this.selectedFile = file;
    this.uploadProgress = 0;
  }

  removeSelectedFile() {
    this.selectedFile = null;
    this.description = '';
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  upload() {
    if (!this.selectedFile) {
      return;
    }

    this.isUploading = true;
    this.uploadProgress = 0;

    // Progress überwachen
    this.photoService.getUploadProgress(this.selectedFile).subscribe({
      next: (progress) => {
        this.uploadProgress = progress;
      },
      error: (error) => {
        console.error('Upload-Fortschritt Fehler:', error);
      }
    });

    // Upload starten
    this.photoService.uploadPhoto(this.selectedFile, this.description).subscribe({
      next: () => {
        this.uploadProgress = 100;
        this.isUploading = false;
        this.selectedFile = null;
        this.description = '';
        if (this.fileInput) {
          this.fileInput.nativeElement.value = '';
        }
        this.uploadSuccess.emit();
      },
      error: (error) => {
        console.error('Upload-Fehler:', error);
        alert('Upload fehlgeschlagen: ' + (error.message || 'Unbekannter Fehler'));
        this.isUploading = false;
        this.uploadProgress = 0;
      }
    });
  }
}
