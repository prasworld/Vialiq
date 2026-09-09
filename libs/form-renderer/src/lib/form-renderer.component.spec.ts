import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormRendererComponent } from './form-renderer.component';

describe('FormRenderer', () => {
  let component: FormRendererComponent;
  let fixture: ComponentFixture<FormRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormRendererComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(FormRendererComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
