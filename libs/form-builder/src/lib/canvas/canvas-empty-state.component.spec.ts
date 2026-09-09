import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CanvasEmptyStateComponent } from './canvas-empty-state.component';

describe('CanvasEmptyStateComponent', () => {
  let component: CanvasEmptyStateComponent;
  let fixture: ComponentFixture<CanvasEmptyStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasEmptyStateComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CanvasEmptyStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
