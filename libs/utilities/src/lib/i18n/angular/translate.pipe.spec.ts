import { TestBed } from '@angular/core/testing';
import { TranslatePipe } from './translate.pipe';
import { TranslationService } from './translation.service';
import { MFE_NAMESPACE } from './tokens';
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

  // ─── MFE_NAMESPACE scoping ──────────────────────────────────────────────────

  it('should scope lookup to MFE_NAMESPACE when no explicit namespace is passed', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: MFE_NAMESPACE, useValue: 'my-mfe' }
      ]
    });
    const pipeMfe = TestBed.inject(TranslatePipe);

    pipeMfe.transform('KEY');
    expect(mockTranslationService.instant).toHaveBeenCalledWith('KEY', undefined, 'my-mfe');
  });

  it('should prefer an explicit namespace over MFE_NAMESPACE', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        TranslatePipe,
        { provide: TranslationService, useValue: mockTranslationService },
        { provide: MFE_NAMESPACE, useValue: 'my-mfe' }
      ]
    });
    const pipeMfe = TestBed.inject(TranslatePipe);

    pipeMfe.transform('KEY', undefined, 'explicit-ns');
    // explicit-ns wins over my-mfe
    expect(mockTranslationService.instant).toHaveBeenCalledWith('KEY', undefined, 'explicit-ns');
  });

  it('should pass undefined namespace when MFE_NAMESPACE is not provided and no explicit ns', () => {
    pipe.transform('KEY');
    expect(mockTranslationService.instant).toHaveBeenCalledWith('KEY', undefined, undefined);
  });
});

