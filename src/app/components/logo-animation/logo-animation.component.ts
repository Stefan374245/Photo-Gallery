import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LogoAnimationService } from '../../services/logo-animation.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-logo-animation',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './logo-animation.component.html',
  styleUrl: './logo-animation.component.scss'
})
export class LogoAnimationComponent implements OnInit, OnDestroy {
  isVisible = false;
  isAnimating = false;

  constructor(private logoAnimationService: LogoAnimationService) {}

  ngOnInit() {
    // Nur Animation beim App-Start
    this.playAnimation();
  }

  ngOnDestroy() {
  }

  playAnimation() {
    this.isVisible = true;
    this.isAnimating = true;

    // Nach 3 Sekunden Animation beenden und Component verstecken
    setTimeout(() => {
      this.isAnimating = false;
      this.isVisible = false;
    }, 3000);
  }
}
