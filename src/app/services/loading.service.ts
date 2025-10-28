import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private loadingCounter = 0;

  constructor() {}

  // Get loading state observable
  get isLoading$(): Observable<boolean> {
    return this.loadingSubject.asObservable();
  }

  // Show loading
  show(): void {
    this.loadingCounter++;
    this.loadingSubject.next(true);
  }

  // Hide loading
  hide(): void {
    this.loadingCounter--;
    if (this.loadingCounter <= 0) {
      this.loadingCounter = 0;
      this.loadingSubject.next(false);
    }
  }

  // Force hide loading
  forceHide(): void {
    this.loadingCounter = 0;
    this.loadingSubject.next(false);
  }

  // Get current loading state
  get isLoading(): boolean {
    return this.loadingSubject.value;
  }
}