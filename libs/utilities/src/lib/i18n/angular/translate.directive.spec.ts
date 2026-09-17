import { Component, signal, WritableSignal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateDirective } from './translate.directive';
import { TranslationService } from './translation.service';
import { vi } from 'vitest';

const TEMPLATE = '<span [viTranslate]="key"></span>';

@Component({
  template: TEMPLATE,
  standalone: true,
  imports: [TranslateDirective]
})
class TestComponent {
  key = 'FORM.TEST';
}

describe('TranslateDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockTranslationService: Partial<TranslationService>;
  let dummySignal: WritableSignal<void | undefined>;

  beforeEach(() => {
    dummySignal = signal(undefined);

    mockTranslationService = {
      translations: dummySignal,
      instant: vi.fn().mockImplementation((key: string) => {
        return `translated:${key}`;
      })
    };

    TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    });

    fixture = TestBed.createComponent(TestComponent);
  });

  it('should translate key and set textContent', () => {
    fixture.detectChanges(); // initial binding
    
    const span = fixture.nativeElement.querySelector('span');
    expect(span.textContent).toBe('translated:FORM.TEST');
    expect(mockTranslationService.instant).toHaveBeenCalledWith('FORM.TEST', undefined, undefined);
  });
});
