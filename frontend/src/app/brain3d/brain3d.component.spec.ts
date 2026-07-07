import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Brain3dComponent } from './brain3d.component';

describe('Brain3dComponent', () => {
  let component: Brain3dComponent;
  let fixture: ComponentFixture<Brain3dComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Brain3dComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(Brain3dComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
