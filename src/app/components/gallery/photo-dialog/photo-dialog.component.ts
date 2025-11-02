import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { Photo } from '../../../models/photo.model';
import { PhotoService } from '../../../services/photo.service';

@Component({
  selector: 'app-photo-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule
  ],
  templateUrl: './photo-dialog.component.html',
  styleUrl: './photo-dialog.component.scss'
})
export class PhotoDialogComponent {
  description: string;
  isEditing = false;
  saving = false;
  
  // Carousel properties
  allPhotos: Photo[] = [];
  currentIndex = 0;
  isAnimating = false;
  private animationDuration = 600; // ms

  constructor(
    public dialogRef: MatDialogRef<PhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { photo: Photo; allPhotos: Photo[]; currentIndex: number },
    private photoService: PhotoService
  ) {
    this.description = data.photo.description || '';
    this.allPhotos = data.allPhotos || [data.photo];
    this.currentIndex = data.currentIndex || 0;
  }

  get currentPhoto(): Photo {
    return this.allPhotos[this.currentIndex] || this.data.photo;
  }

  get carouselItems(): number[] {
    return Array.from({ length: this.allPhotos.length }, (_, i) => i);
  }

  // Carousel methods
  getCarouselTransform(): string {
    const angle = (360 / this.allPhotos.length) * this.currentIndex;
    const radius = 400;
    return `translateZ(-${radius}px) rotateY(-${angle}deg)`;
  }

  getItemTransform(index: number): string {
    const totalItems = this.allPhotos.length;
    const angle = (360 / totalItems) * index;
    const radius = 400;
    return `rotateY(${angle}deg) translateZ(${radius}px)`;
  }

  getPrevIndex(): number {
    return (this.currentIndex - 1 + this.allPhotos.length) % this.allPhotos.length;
  }

  getNextIndex(): number {
    return (this.currentIndex + 1) % this.allPhotos.length;
  }

  nextSlide(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = this.getNextIndex();
    this.description = this.currentPhoto.description || '';
    setTimeout(() => {
      this.isAnimating = false;
    }, this.animationDuration);
  }

  previousSlide(): void {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.currentIndex = this.getPrevIndex();
    this.description = this.currentPhoto.description || '';
    setTimeout(() => {
      this.isAnimating = false;
    }, this.animationDuration);
  }

  goToSlide(index: number): void {
    if (this.isAnimating || index === this.currentIndex) return;
    this.isAnimating = true;
    this.currentIndex = index;
    this.description = this.currentPhoto.description || '';
    setTimeout(() => {
      this.isAnimating = false;
    }, this.animationDuration);
  }

  toggleFavorite() {
    const newFavoriteStatus = !this.currentPhoto.isFavorite;
    
    this.photoService.toggleFavorite(this.currentPhoto.id, newFavoriteStatus).subscribe({
      next: () => {
        this.currentPhoto.isFavorite = newFavoriteStatus;
        this.dialogRef.close({ updated: true });
      },
      error: (error) => {
        console.error('Fehler beim Ändern des Favoriten-Status:', error);
        alert('Fehler beim Ändern des Favoriten-Status');
      }
    });
  }

  close(): void {
    this.dialogRef.close();
  }

  startEditing(): void {
    this.isEditing = true;
  }

  cancelEditing(): void {
    this.description = this.currentPhoto.description || '';
    this.isEditing = false;
  }

  saveDescription(): void {
    if (this.saving) return;

    this.saving = true;
    this.photoService.updatePhotoDescription(this.currentPhoto.id, this.description).subscribe({
      next: () => {
        this.currentPhoto.description = this.description;
        this.isEditing = false;
        this.saving = false;
        // Dialog-Ref zurückgeben, damit die Liste aktualisiert werden kann
        this.dialogRef.close({ updated: true });
      },
      error: (error) => {
        console.error('Fehler beim Speichern:', error);
        alert('Fehler beim Speichern der Beschreibung');
        this.saving = false;
      }
    });
  }
}
