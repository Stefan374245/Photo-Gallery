import { Component, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LogoAnimationComponent } from './components/logo-animation/logo-animation.component';
import { UploadSuccessAnimationComponent } from './components/upload-success-animation/upload-success-animation.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, LogoAnimationComponent, UploadSuccessAnimationComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit {
  @ViewChild(LogoAnimationComponent) logoAnimation!: LogoAnimationComponent;
  title = 'photo-gallery';
  showContent = false;

  ngAfterViewInit() {
    // Content nach Animation anzeigen
    setTimeout(() => {
      this.showContent = true;
    }, 2000);
  }
}
