import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { PhotoGalleryComponent } from './components/gallery/photo-gallery/photo-gallery.component';
import { PhotoUploadComponent } from './components/gallery/photo-upload/photo-upload.component';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/gallery', pathMatch: 'full' },
  { path: 'gallery', component: PhotoGalleryComponent, canActivate: [AuthGuard] },
  { path: 'upload', component: PhotoUploadComponent, canActivate: [AuthGuard] },
  { path: 'auth/login', component: LoginComponent },
  { path: 'auth/register', component: RegisterComponent },
  { path: '**', redirectTo: '/gallery' }
];
