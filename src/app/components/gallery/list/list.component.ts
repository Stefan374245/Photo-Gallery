import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PhotoService } from '../../../services/photo.service';
import { Photo } from '../../../models/photo.model';

@Component({
  selector: 'app-list',
  imports: [
    CommonModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './list.component.html',
  styleUrl: './list.component.scss'
})
export class ListComponent implements OnInit {
  photos: Photo[] = [];
  loading = true;
  mode: 'normal' | 'favorites' | 'trash' = 'normal';
  @Input() viewMode: 'normal' | 'favorites' | 'trash' = 'normal';
  @Output() photoClick = new EventEmitter<Photo>();
  @Output() photosChanged = new EventEmitter<void>();

  constructor(private photoService: PhotoService) {}

  ngOnInit() {
    this.loadPhotos();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['viewMode'] && this.viewMode) {
      this.mode = this.viewMode;
      this.loadPhotos();
    }
  }

  loadPhotos() {
    this.loading = true;
    let photos$;
    
    if (this.mode === 'favorites') {
      photos$ = this.photoService.getFavoritePhotos();
    } else if (this.mode === 'trash') {
      photos$ = this.photoService.getDeletedPhotos();
    } else {
      photos$ = this.photoService.getPhotos();
    }

    photos$.subscribe({
      next: (photos) => {
        this.photos = photos;
        this.loading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Fotos:', error);
        this.loading = false;
      }
    });
  }

  onPhotoClick(photo: Photo) {
    this.photoClick.emit(photo);
  }

  onToggleFavorite(photo: Photo, event: Event) {
    event.stopPropagation();
    const newFavoriteStatus = !photo.isFavorite;
    
    this.photoService.toggleFavorite(photo.id, newFavoriteStatus).subscribe({
      next: () => {
        this.loadPhotos();
        this.photosChanged.emit();
      },
      error: (error) => {
        console.error('Fehler beim Ändern des Favoriten-Status:', error);
        alert('Fehler beim Ändern des Favoriten-Status');
      }
    });
  }

  onMoveToTrash(photo: Photo, event: Event) {
    event.stopPropagation();
    
    if (confirm('Möchten Sie dieses Foto in den Papierkorb verschieben?')) {
      this.photoService.moveToTrash(photo.id).subscribe({
        next: () => {
          this.loadPhotos();
          this.photosChanged.emit();
        },
        error: (error) => {
          console.error('Fehler beim Löschen:', error);
          alert('Fehler beim Löschen des Fotos');
        }
      });
    }
  }

  onRestore(photo: Photo, event: Event) {
    event.stopPropagation();
    
    this.photoService.restorePhoto(photo.id).subscribe({
      next: () => {
        this.loadPhotos();
        this.photosChanged.emit();
      },
      error: (error) => {
        console.error('Fehler beim Wiederherstellen:', error);
        alert('Fehler beim Wiederherstellen des Fotos');
      }
    });
  }

  onPermanentlyDelete(photo: Photo, event: Event) {
    event.stopPropagation();
    
    if (confirm('Möchten Sie dieses Foto endgültig löschen? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      this.photoService.permanentlyDeletePhoto(photo.id).subscribe({
        next: () => {
          this.loadPhotos();
          this.photosChanged.emit();
        },
        error: (error) => {
          console.error('Fehler beim endgültigen Löschen:', error);
          alert('Fehler beim endgültigen Löschen des Fotos');
        }
      });
    }
  }

  refresh() {
    this.loadPhotos();
  }
}
