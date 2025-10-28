import { Injectable } from '@angular/core';
import { 
  Storage, 
  ref, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject
} from '@angular/fire/storage';
import { 
  Firestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc, 
  query, 
  orderBy, 
  limit
} from '@angular/fire/firestore';
import { Observable, from, map, BehaviorSubject } from 'rxjs';
import { Photo, PhotoUploadData } from '../interfaces/photo.interface';
import { PaginatedResponse } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class PhotoService {
  private uploadProgress$ = new BehaviorSubject<number>(0);
  private isUploading$ = new BehaviorSubject<boolean>(false);

  constructor(
    private storage: Storage,
    private firestore: Firestore
  ) {}

  // Get upload progress observable
  get uploadProgress(): Observable<number> {
    return this.uploadProgress$.asObservable();
  }

  // Get upload status observable
  get isUploading(): Observable<boolean> {
    return this.isUploading$.asObservable();
  }

  // Upload photo
  async uploadPhoto(uploadData: PhotoUploadData, userId: string): Promise<Photo> {
    try {
      this.isUploading$.next(true);
      
      // Create unique filename
      const timestamp = Date.now();
      const fileName = `${timestamp}_${uploadData.file.name}`;
      const photoRef = ref(this.storage, `photos/${userId}/${fileName}`);
      
      // Upload file with progress tracking
      const uploadTask = uploadBytesResumable(photoRef, uploadData.file);
      
      // Track upload progress
      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploadProgress$.next(progress);
        }
      );

      // Wait for upload to complete
      await uploadTask;
      
      // Get download URL
      const imageUrl = await getDownloadURL(photoRef);
      
      // Create simplified photo document
      const photo: Omit<Photo, 'id'> = {
        title: uploadData.title,
        description: uploadData.description || '',
        imageUrl,
        uploadedAt: new Date()
      };

      // Save to Firestore
      const photosCollection = collection(this.firestore, 'photos');
      const docRef = await addDoc(photosCollection, photo);
      
      this.uploadProgress$.next(0);
      this.isUploading$.next(false);
      
      return { ...photo, id: docRef.id } as Photo;
    } catch (error) {
      this.isUploading$.next(false);
      this.uploadProgress$.next(0);
      throw error;
    }
  }

  // Get all photos with pagination
  getAllPhotos(pageSize: number = 12): Observable<PaginatedResponse<Photo>> {
    const q = query(
      collection(this.firestore, 'photos'),
      orderBy('uploadedAt', 'desc'),
      limit(pageSize)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => ({
        data: snapshot.docs.map(doc => ({ 
          ...doc.data(), 
          id: doc.id,
          uploadedAt: doc.data()['uploadedAt']?.toDate() || new Date()
        } as Photo)),
        totalCount: snapshot.size,
        page: 1,
        pageSize,
        hasNextPage: snapshot.docs.length === pageSize,
        hasPreviousPage: false
      }))
    );
  }

  // Get photo by ID
  getPhotoById(photoId: string): Observable<Photo | null> {
    const photoRef = doc(this.firestore, 'photos', photoId);
    return from(getDoc(photoRef)).pipe(
      map(doc => {
        if (doc.exists()) {
          const data = doc.data();
          return { 
            ...data, 
            id: doc.id,
            uploadedAt: data['uploadedAt']?.toDate() || new Date()
          } as Photo;
        }
        return null;
      })
    );
  }

  // Update photo
  async updatePhoto(photoId: string, updates: Partial<Omit<Photo, 'id' | 'uploadedAt'>>): Promise<void> {
    const photoRef = doc(this.firestore, 'photos', photoId);
    await updateDoc(photoRef, updates);
  }

  // Delete photo
  async deletePhoto(photoId: string, imageUrl: string): Promise<void> {
    try {
      // Delete from Storage
      const imageRef = ref(this.storage, imageUrl);
      await deleteObject(imageRef);
      
      // Delete from Firestore
      const photoRef = doc(this.firestore, 'photos', photoId);
      await deleteDoc(photoRef);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }

  // Search photos by title or description
  searchPhotos(searchTerm: string): Observable<Photo[]> {
    const q = query(
      collection(this.firestore, 'photos'),
      orderBy('uploadedAt', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => 
        snapshot.docs
          .map(doc => ({ 
            ...doc.data(), 
            id: doc.id,
            uploadedAt: doc.data()['uploadedAt']?.toDate() || new Date()
          } as Photo))
          .filter(photo => 
            photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (photo.description && photo.description.toLowerCase().includes(searchTerm.toLowerCase()))
          )
      )
    );
  }
}
