import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithPopup, GoogleAuthProvider, User } from '@angular/fire/auth';
import { Observable, from, of } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: Auth) {}

  // Aktuellen Benutzer als Observable zurückgeben
  get currentUser$(): Observable<User | null> {
    return new Observable(observer => {
      this.auth.onAuthStateChanged(user => {
        observer.next(user);
      });
    });
  }

  // Aktuellen Benutzer synchron abrufen
  get currentUser(): User | null {
    return this.auth.currentUser;
  }

  // Registrierung mit E-Mail und Passwort
  signUp(email: string, password: string): Observable<User> {
    return from(createUserWithEmailAndPassword(this.auth, email, password)).pipe(
      map(result => result.user)
    );
  }

  // Anmeldung mit E-Mail und Passwort
  login(email: string, password: string): Observable<User> {
    return from(signInWithEmailAndPassword(this.auth, email, password)).pipe(
      map(result => result.user)
    );
  }

  // Anmeldung mit Google
  loginWithGoogle(): Observable<User> {
    const provider = new GoogleAuthProvider();
    return from(signInWithPopup(this.auth, provider)).pipe(
      map(result => result.user)
    );
  }

  // Abmeldung
  logout(): Observable<void> {
    return from(signOut(this.auth));
  }
}

