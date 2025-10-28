import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Observable } from 'rxjs';
import { PhotoService } from '../../../services/photo.service';
import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import { PhotoUploadData } from '../../../interfaces/photo.interface';

@Component({
  selector: 'app-photo-upload',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule
  ],
  templateUrl: './photo-upload.component.html',
  styleUrl: './photo-upload.component.scss'
})
export class PhotoUploadComponent {
  // Individual FormControls with detailed validation
  titleControl = new FormControl('', [
    Validators.required, 
    Validators.minLength(3),
    Validators.maxLength(100),
    Validators.pattern(/^[a-zA-Z0-9\s\-_.,!?]+$/) // Allow alphanumeric and common punctuation
  ]);
  
  descriptionControl = new FormControl('', [
    Validators.maxLength(500)
  ]);

  uploadForm: FormGroup;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  uploadProgress$: Observable<number>;
  isUploading$: Observable<boolean>;

  constructor(
    private fb: FormBuilder,
    private photoService: PhotoService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private router: Router
  ) {
    this.uploadForm = this.fb.group({
      title: this.titleControl,
      description: this.descriptionControl
    });

    this.uploadProgress$ = this.photoService.uploadProgress;
    this.isUploading$ = this.photoService.isUploading;
  }
  onSubmit(): void { }
  

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        this.notificationService.showError('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.notificationService.showError('File size must be less than 10MB');
        return;
      }
      
      this.selectedFile = file;
      
      // Generate preview
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewUrl = e.target?.result as string;
      };
      reader.readAsDataURL(file);
      
      // Auto-fill title from filename
      if (!this.uploadForm.get('title')?.value) {
        const filename = file.name.split('.')[0];
        this.uploadForm.patchValue({ title: filename });
      }
    }
  }

  getTitleErrorMessage(): string {
    if (this.titleControl.hasError('required')) {
      return 'Title is required';
    }
    if (this.titleControl.hasError('minlength')) {
      return 'Title must be at least 3 characters';
    }
    if (this.titleControl.hasError('maxlength')) {
      return 'Title must be no more than 100 characters';
    }
    if (this.titleControl.hasError('pattern')) {
      return 'Title contains invalid characters';
    }
    return '';
  }

  getDescriptionErrorMessage(): string {
    if (this.descriptionControl.hasError('maxlength')) {
      return 'Description must be no more than 500 characters';
    }
    return '';
  }

  // FormControl status helpers
  isTitleValid(): boolean {
    return this.titleControl.valid && this.titleControl.touched;
  }

  isTitleInvalid(): boolean {
    return this.titleControl.invalid && this.titleControl.touched;
  }

  isDescriptionValid(): boolean {
    return this.descriptionControl.valid && this.descriptionControl.touched;
  }

  isDescriptionInvalid(): boolean {
    return this.descriptionControl.invalid && this.descriptionControl.touched;
  }

  uploadPhoto(): void {
    if (this.uploadForm.invalid || !this.selectedFile) {
      this.notificationService.showError('Please fill all required fields and select a file');
      return;
    }

    // Get current user
    this.authService.currentUser$.subscribe(async (user) => {
      if (!user) {
        this.notificationService.showError('You must be logged in to upload photos');
        this.router.navigate(['/auth/login']);
        return;
      }

      const { title, description } = this.uploadForm.value;
      
      const uploadData: PhotoUploadData = {
        file: this.selectedFile!,
        title,
        description
      };

      try {
        await this.photoService.uploadPhoto(uploadData, user.uid);
        this.notificationService.showSuccess('Photo uploaded successfully!');
        this.router.navigate(['/gallery']);
      } catch (error) {
        this.notificationService.showError(error instanceof Error ? error.message : 'Upload failed');
      }
    }).unsubscribe();
  }

  // Reset form controls
  resetFormControls(): void {
    this.titleControl.reset();
    this.descriptionControl.reset();
    this.titleControl.markAsUntouched();
    this.descriptionControl.markAsUntouched();
  }

  removeSelectedFile(): void {
    this.selectedFile = null;
    this.previewUrl = null;
    this.resetFormControls();
  }
}