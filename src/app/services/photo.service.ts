import { Injectable } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, collection, addDoc, doc, updateDoc, deleteDoc, query, onSnapshot, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Photo } from '../models/photo.model';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private readonly MAX_FILE_SIZE = 700 * 1024;

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  getAllPhotos(): Observable<Photo[]> {
    const user = this.auth.currentUser;
    if (!user) {
      return new Observable(observer => observer.next([]));
    }

    const photosRef = collection(this.firestore, `users/${user.uid}/photos`);
    const q = query(photosRef);
    
    return new Observable<Photo[]>(observer => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const photos = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Photo));
        observer.next(photos);
      }, (error) => {
        observer.error(error);
      });

      return () => unsubscribe();
    });
  }

  getPhotos(): Observable<Photo[]> {
    return this.getAllPhotos().pipe(
      map(photos => photos.filter(photo => !photo.deleted))
    );
  }

  getFavoritePhotos(): Observable<Photo[]> {
    return this.getAllPhotos().pipe(
      map(photos => photos.filter(photo => photo.isFavorite && !photo.deleted))
    );
  }

  getDeletedPhotos(): Observable<Photo[]> {
    return this.getAllPhotos().pipe(
      map(photos => photos.filter(photo => photo.deleted === true))
    );
  }

  private compressImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          let quality = 0.9;

          const maxDimension = 1920;
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = (height / width) * maxDimension;
              width = maxDimension;
            } else {
              width = (width / height) * maxDimension;
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas-Kontext konnte nicht erstellt werden'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);

          let base64String = canvas.toDataURL('image/jpeg', quality);

          while (base64String.length > this.MAX_FILE_SIZE * 1.33 && quality > 0.1) {
            quality -= 0.1;
            base64String = canvas.toDataURL('image/jpeg', quality);
          }

          if (base64String.length > this.MAX_FILE_SIZE * 1.5) {
            reject(new Error('Bild ist zu groß auch nach Komprimierung. Bitte verwenden Sie ein kleineres Bild.'));
            return;
          }

          resolve(base64String);
        };
        img.onerror = () => reject(new Error('Fehler beim Laden des Bildes'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Fehler beim Lesen der Datei'));
      reader.readAsDataURL(file);
    });
  }

  uploadPhoto(file: File, description?: string): Observable<Photo> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    return new Observable(observer => {
      this.compressImage(file)
        .then(async (base64String) => {
          try {
            const timestamp = Date.now();
            const filename = `${timestamp}_${file.name}`;

            const photoData = {
              url: base64String,
              filename: filename,
              description: description || '',
              contentType: file.type || 'image/jpeg',
              isFavorite: false,
              deleted: false
            };

            const photosRef = collection(this.firestore, `users/${user.uid}/photos`);
            const docRef = await addDoc(photosRef, photoData);

            const photo: Photo = {
              id: docRef.id,
              url: photoData.url,
              filename: photoData.filename,
              description: photoData.description
            };

            observer.next(photo);
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  updatePhotoDescription(photoId: string, description: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const photoRef = doc(this.firestore, `users/${user.uid}/photos/${photoId}`);
    return from(updateDoc(photoRef, { description }));
  }

  toggleFavorite(photoId: string, isFavorite: boolean): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const photoRef = doc(this.firestore, `users/${user.uid}/photos/${photoId}`);
    return from(updateDoc(photoRef, { isFavorite }));
  }

  moveToTrash(photoId: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const photoRef = doc(this.firestore, `users/${user.uid}/photos/${photoId}`);
    return from(updateDoc(photoRef, { deleted: true }));
  }

  restorePhoto(photoId: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const photoRef = doc(this.firestore, `users/${user.uid}/photos/${photoId}`);
    return from(updateDoc(photoRef, { deleted: false }));
  }

  permanentlyDeletePhoto(photoId: string): Observable<void> {
    const user = this.auth.currentUser;
    if (!user) {
      throw new Error('Benutzer nicht angemeldet');
    }

    const photoRef = doc(this.firestore, `users/${user.uid}/photos/${photoId}`);
    return from(deleteDoc(photoRef));
  }

  getUploadProgress(file: File): Observable<number> {
    return new Observable(observer => {
      observer.next(0);
      
      setTimeout(() => observer.next(30), 100);
      setTimeout(() => observer.next(60), 300);
      setTimeout(() => observer.next(90), 500);
      
      this.compressImage(file)
        .then(() => {
          observer.next(100);
          observer.complete();
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }
}
