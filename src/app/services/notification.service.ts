import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { BehaviorSubject, Observable } from 'rxjs';
import { NotificationConfig } from '../interfaces/common.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notificationSubject = new BehaviorSubject<NotificationConfig | null>(null);

  constructor(private snackBar: MatSnackBar) {}

  // Get current notification observable
  get notification$(): Observable<NotificationConfig | null> {
    return this.notificationSubject.asObservable();
  }

  // Show success message
  showSuccess(message: string, duration: number = 5000, action?: string): void {
    this.showNotification({
      type: 'success',
      message,
      duration,
      action
    });
  }

  // Show error message
  showError(message: string, duration: number = 8000, action?: string): void {
    this.showNotification({
      type: 'error',
      message,
      duration,
      action
    });
  }

  // Show warning message
  showWarning(message: string, duration: number = 6000, action?: string): void {
    this.showNotification({
      type: 'warning',
      message,
      duration,
      action
    });
  }

  // Show info message
  showInfo(message: string, duration: number = 5000, action?: string): void {
    this.showNotification({
      type: 'info',
      message,
      duration,
      action
    });
  }

  // Show notification with custom config
  private showNotification(config: NotificationConfig): void {
    const snackBarConfig: MatSnackBarConfig = {
      duration: config.duration || 5000,
      verticalPosition: 'top',
      horizontalPosition: 'right',
      panelClass: [`notification-${config.type}`]
    };

    this.snackBar.open(config.message, config.action || 'Close', snackBarConfig);
    
    // Update notification subject
    this.notificationSubject.next(config);
    
    // Clear notification after duration
    setTimeout(() => {
      this.notificationSubject.next(null);
    }, config.duration || 5000);
  }

  // Clear current notification
  clearNotification(): void {
    this.snackBar.dismiss();
    this.notificationSubject.next(null);
  }
}