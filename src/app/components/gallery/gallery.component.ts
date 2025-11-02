import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { UploadComponent } from './upload/upload.component';
import { ListComponent } from './list/list.component';
import { PhotoDialogComponent } from './photo-dialog/photo-dialog.component';
import { Photo } from '../../models/photo.model';
import { AuthService } from '../../services/auth.service';
import { PhotoService } from '../../services/photo.service';

@Component({
  selector: 'app-gallery',
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatTabsModule,
    UploadComponent,
    ListComponent
  ],
  templateUrl: './gallery.component.html',
  styleUrl: './gallery.component.scss'
})
export class GalleryComponent implements OnInit {
  @ViewChild('listComponent') listComponent!: ListComponent;
  userEmail: string | null = null;
  selectedTabIndex = 0;

  constructor(
    private authService: AuthService,
    private photoService: PhotoService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      if (!user) {
        this.router.navigate(['/login']);
      } else {
        this.userEmail = user.email;
      }
    });
  }

  onPhotoClick(photo: Photo) {
    const dialogRef = this.dialog.open(PhotoDialogComponent, {
      width: '90%',
      maxWidth: '800px',
      data: photo
    });

    dialogRef.afterClosed().subscribe((result) => {
      // Liste aktualisieren, wenn etwas geändert wurde
      if (result?.updated && this.listComponent) {
        this.listComponent.refresh();
      }
    });
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      }
    });
  }

  onUploadSuccess() {
    if (this.listComponent) {
      this.listComponent.refresh();
    }
  }

  onTabChange(index: number) {
    this.selectedTabIndex = index;
  }
}
