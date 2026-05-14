import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AblankLayoutComponent } from './ablank-layout.component';

describe('AblankLayoutComponent', () => {
  let component: AblankLayoutComponent;
  let fixture: ComponentFixture<AblankLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AblankLayoutComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AblankLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
