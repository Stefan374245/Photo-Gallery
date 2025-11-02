import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoAnimationService } from '../../services/logo-animation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-upload-success-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './upload-success-animation.component.html',
  styleUrl: './upload-success-animation.component.scss'
})
export class UploadSuccessAnimationComponent implements OnInit, OnDestroy {
  isVisible = false;
  isAnimating = false;
  private subscription?: Subscription;

  constructor(private logoAnimationService: LogoAnimationService) {}

  ngOnInit() {
    // Nur auf externe Trigger hören (nicht beim Start)
    this.subscription = this.logoAnimationService.animationTrigger$.subscribe(() => {
      this.playAnimation();
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  playAnimation() {
    this.isVisible = true;
    this.isAnimating = true;

    // Nach 1.5 Sekunden Animation beenden
    setTimeout(() => {
      this.isAnimating = false;
      this.isVisible = false;
    }, 1500);
  }
}
