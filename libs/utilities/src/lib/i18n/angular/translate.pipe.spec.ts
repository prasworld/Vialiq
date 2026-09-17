import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from './translation.service';
import { signal } from '@angular/core';
import { vi } from 'vitest';

describe('TranslatePipe', () => {
  let pipe: TranslatePipe;
  let mockTranslationService: Partial<TranslationService>;
  let dummySignal: any;

  beforeEach(() => {
    dummySignal = signal(null);

    mockTranslationService = {
      translations: dummySignal,
      instant: vi.fn().mockImplementation((key: string) => {
        return `translated:${key}`;
      })
    };

    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    });

    pipe = TestBed.inject(TranslatePipe);
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should call translations() signal to establish dependency', () => {
    const spy = vi.spyOn(mockTranslationService, 'translations' as any);
    pipe.transform('TEST.KEY');
    expect(spy).toHaveBeenCalled();
  });

  it('should translate using TranslationService.instant', () => {
    const result = pipe.transform('TEST.KEY', { name: 'John' }, 'my-ns');
    expect(result).toBe('translated:TEST.KEY');
    expect(mockTranslationService.instant).toHaveBeenCalledWith('TEST.KEY', { name: 'John' }, 'my-ns');
  });
});
