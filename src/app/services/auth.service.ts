import { Injectable } from '@angular/core';
import { 
  Auth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  authState,
  User,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail
} from '@angular/fire/auth';
import { 
  Firestore, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs
} from '@angular/fire/firestore';
import { Observable, from, map, switchMap, of } from 'rxjs';
import { Router } from '@angular/router';
import { UserProfile } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private googleProvider = new GoogleAuthProvider();

  constructor(
    private auth: Auth,
    private firestore: Firestore,
    private router: Router
  ) {
    this.googleProvider.addScope('profile');
    this.googleProvider.addScope('email');
  }

  // Get current user observable
  get currentUser$(): Observable<User | null> {
    return authState(this.auth);
  }

  // Get current user profile
  get currentUserProfile$(): Observable<UserProfile | null> {
    return this.currentUser$.pipe(
      switchMap(user => {
        if (!user) return of(null);
        return this.getUserProfile(user.uid);
      })
    );
  }

  // Register with email and password
  async registerWithEmail(email: string, password: string, displayName: string): Promise<User> {
    try {
      const credential = await createUserWithEmailAndPassword(this.auth, email, password);
      await updateProfile(credential.user, { displayName });
      await this.createUserProfile(credential.user);
      await sendEmailVerification(credential.user);
      return credential.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Login with email and password
  async loginWithEmail(email: string, password: string): Promise<User> {
    try {
      const credential = await signInWithEmailAndPassword(this.auth, email, password);
      return credential.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Login with Google
  async loginWithGoogle(): Promise<User> {
    try {
      const credential = await signInWithPopup(this.auth, this.googleProvider);
      
      // Check if user profile exists, if not create one
      const userProfileExists = await this.checkUserProfileExists(credential.user.uid);
      if (!userProfileExists) {
        await this.createUserProfile(credential.user);
      }
      
      return credential.user;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Logout
  async logout(): Promise<void> {
    try {
      await signOut(this.auth);
      this.router.navigate(['/auth/login']);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Send password reset email
  async resetPassword(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Create user profile in Firestore
  private async createUserProfile(user: User): Promise<void> {
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      displayName: user.displayName || '',
      photoURL: user.photoURL || '',
      emailVerified: user.emailVerified,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      preferences: {
        theme: 'auto',
        language: 'en',
        emailNotifications: true,
        pushNotifications: true
      }
    };

    const userDoc = doc(this.firestore, 'users', user.uid);
    await setDoc(userDoc, userProfile);
  }

  // Check if user profile exists
  private async checkUserProfileExists(uid: string): Promise<boolean> {
    const userDoc = doc(this.firestore, 'users', uid);
    const userSnap = await getDoc(userDoc);
    return userSnap.exists();
  }

  // Get user profile
  private getUserProfile(uid: string): Observable<UserProfile | null> {
    const userDoc = doc(this.firestore, 'users', uid);
    return from(getDoc(userDoc)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return docSnap.data() as UserProfile;
        }
        return null;
      })
    );
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
    try {
      const userDoc = doc(this.firestore, 'users', uid);
      await updateDoc(userDoc, { ...updates, updatedAt: new Date() });
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // Handle authentication errors
  private handleError(error: any): Error {
    let message = 'An unexpected error occurred';
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'Email is already registered';
        break;
      case 'auth/weak-password':
        message = 'Password is too weak';
        break;
      case 'auth/user-not-found':
        message = 'User not found';
        break;
      case 'auth/wrong-password':
        message = 'Invalid password';
        break;
      case 'auth/invalid-email':
        message = 'Invalid email address';
        break;
      case 'auth/user-disabled':
        message = 'User account has been disabled';
        break;
      case 'auth/popup-closed-by-user':
        message = 'Sign-in popup was closed';
        break;
      default:
        message = error.message || message;
    }
    
    return new Error(message);
  }
}