import { Component, Input, WritableSignal, signal } from '@angular/core';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TranslateDirective } from './translate.directive';
import { TranslationService } from './translation.service';
import { vi } from 'vitest';

@Component({
  template: '',
  standalone: true,
  imports: [TranslateDirective]
})
class TestComponent {
  @Input() key = 'FORM.TEST';
  params: Record<string, unknown> | undefined = undefined;
}

describe('TranslateDirective', () => {
  let fixture: ComponentFixture<TestComponent>;
  let mockTranslationService: Partial<TranslationService>;
  let dummySignal: WritableSignal<number>;

  beforeEach(() => {
    dummySignal = signal(0);

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
    }).overrideTemplate(
      TestComponent, 
      '<span [viTranslate]="key" [viTranslateParams]="params"></span>'
    );

    fixture = TestBed.createComponent(TestComponent);
  });

  it('should translate key and set textContent', () => {
    fixture.detectChanges(); // initial binding
    
    const span = fixture.nativeElement.querySelector('span');
    expect(span.textContent).toBe('translated:FORM.TEST');
    expect(mockTranslationService.instant).toHaveBeenCalledWith('FORM.TEST', undefined, undefined);
  });

  // ─── Params ─────────────────────────────────────────────────────────────────

  it('should pass viTranslateParams through to instant()', () => {
    fixture.componentInstance.params = { count: 3, name: 'Alice' };
    fixture.detectChanges();

    expect(mockTranslationService.instant).toHaveBeenCalledWith(
      'FORM.TEST',
      { count: 3, name: 'Alice' },
      undefined
    );
  });

  // ─── Key-change reactivity ───────────────────────────────────────────────────

  it('should re-translate and update DOM when the key input changes', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    const span = fixture.nativeElement.querySelector('span');
    expect(span.textContent).toBe('translated:FORM.TEST');

    // fixture.componentRef.setInput is the Angular-blessed way to change
    // component inputs in tests without triggering NG0100.
    fixture.componentRef.setInput('key', 'FORM.SUBMIT');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(span.textContent).toBe('translated:FORM.SUBMIT');
    expect(mockTranslationService.instant).toHaveBeenCalledWith('FORM.SUBMIT', undefined, undefined);
  });

  // ─── Locale-switch reactivity ────────────────────────────────────────────────

  it('should re-render DOM when translations() signal fires (simulates locale switch)', async () => {
    // Initial render
    (mockTranslationService.instant as any).mockReturnValue('Hello');
    fixture.detectChanges();

    const span = fixture.nativeElement.querySelector('span');
    expect(span.textContent).toBe('Hello');

    // Update mock to return French value, then fire the translations signal
    // Use a non-identical value so Angular's signal equality detects a change.
    (mockTranslationService.instant as any).mockReturnValue('Bonjour');
    dummySignal.set(1); // new reference — triggers signal consumers
    fixture.detectChanges();
    await fixture.whenStable();

    expect(span.textContent).toBe('Bonjour');
  });
});


