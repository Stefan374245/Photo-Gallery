import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UploadSuccessAnimationComponent } from './upload-success-animation.component';

describe('UploadSuccessAnimationComponent', () => {
  let component: UploadSuccessAnimationComponent;
  let fixture: ComponentFixture<UploadSuccessAnimationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UploadSuccessAnimationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UploadSuccessAnimationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
