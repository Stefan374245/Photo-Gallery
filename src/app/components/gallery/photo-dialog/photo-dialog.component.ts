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

  constructor(
    public dialogRef: MatDialogRef<PhotoDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Photo,
    private photoService: PhotoService
  ) {
    this.description = data.description || '';
  }

  toggleFavorite() {
    const newFavoriteStatus = !this.data.isFavorite;
    
    this.photoService.toggleFavorite(this.data.id, newFavoriteStatus).subscribe({
      next: () => {
        this.data.isFavorite = newFavoriteStatus;
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
    this.description = this.data.description || '';
    this.isEditing = false;
  }

  saveDescription(): void {
    if (this.saving) return;

    this.saving = true;
    this.photoService.updatePhotoDescription(this.data.id, this.description).subscribe({
      next: () => {
        this.data.description = this.description;
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
