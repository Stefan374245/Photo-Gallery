import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LogoAnimationService {
  private animationTrigger = new Subject<void>();
  
  animationTrigger$ = this.animationTrigger.asObservable();

  triggerAnimation() {
    this.animationTrigger.next();
  }
}
