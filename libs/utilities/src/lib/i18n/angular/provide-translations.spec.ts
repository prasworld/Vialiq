import { TestBed } from '@angular/core/testing';
import { provideTranslations } from './provide-translations';
import { APP_INITIALIZER } from '@angular/core';

describe('provideTranslations', () => {
  it('should provide eager APP_INITIALIZER by default', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslations({ namespace: 'test', baseUrl: '/test' })
      ]
    });

    const initializers = TestBed.inject(APP_INITIALIZER);
    expect(initializers).toBeTruthy();
    expect(initializers.length).toBeGreaterThan(0);
  });

  it('should NOT provide APP_INITIALIZER if eager is false', () => {
    TestBed.configureTestingModule({
      providers: [
        provideTranslations({ namespace: 'lazy-test', baseUrl: '/lazy', eager: false })
      ]
    });

    const initializers = TestBed.inject(APP_INITIALIZER, null, { optional: true });
    expect(initializers).toBeNull();
  });
});
