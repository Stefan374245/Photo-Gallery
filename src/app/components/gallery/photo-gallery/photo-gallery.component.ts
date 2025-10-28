import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router'; // Add Router import
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Observable } from 'rxjs';
import { PhotoService } from '../../../services/photo.service';
import { LoadingService } from '../../../services/loading.service';
import { Photo } from '../../../interfaces/photo.interface';
import { PaginatedResponse } from '../../../interfaces/common.interface';

@Component({
  selector: 'app-photo-gallery',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatGridListModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './photo-gallery.component.html',
  styleUrl: './photo-gallery.component.scss',
})
export class PhotoGalleryComponent implements OnInit {
  photos: Photo[] = [];
  isLoading$: Observable<boolean>;

  constructor(
    private photoService: PhotoService,
    private loadingService: LoadingService,
    private router: Router // Add Router injection
  ) {
    this.isLoading$ = this.loadingService.isLoading$;
  }

  ngOnInit(): void {
    this.loadPhotos();
  }

  loadPhotos(): void {
    this.loadingService.show();
    this.photoService.getAllPhotos(20).subscribe({
      next: (response: PaginatedResponse<Photo>) => {
        this.photos = response.data;
        this.loadingService.hide();
      },
      error: (error) => {
        console.error('Error loading photos:', error);
        this.loadingService.hide();
      },
    });
  }

  onPhotoClick(photo: Photo): void {
    // TODO: Open photo detail modal or navigate to detail page
    console.log('Photo clicked:', photo);
  }

  onUploadClick(): void {
    this.router.navigate(['/upload']); // Navigate to upload page
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src =
      'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBhdmFpbGFibGU8L3RleHQ+PC9zdmc+';
    img.alt = 'Image not available';
  }

  getPhotoLabel(photo: Photo): string {
    return photo.title ? `Photo titled ${photo.title}` : 'Uploaded photo';
  }
}
