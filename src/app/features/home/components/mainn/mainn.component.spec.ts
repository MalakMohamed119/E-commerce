import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainnComponent } from './mainn.component';

describe('MainnComponent', () => {
  let component: MainnComponent;
  let fixture: ComponentFixture<MainnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
