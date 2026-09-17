import { Directive, ElementRef, effect, inject, input } from '@angular/core';
import { TranslationService } from './translation.service';
import { MFE_NAMESPACE } from './tokens';

/**
 * Attribute directive for translation.
 * Usage:
 * <span [viTranslate]="'FORM.SUBMIT'" [viTranslateParams]="{ COUNT: 3 }"></span>
 */
@Directive({
  selector: '[viTranslate]',
  standalone: true
})
export class TranslateDirective {
  private readonly _el = inject(ElementRef);
  private readonly _ts = inject(TranslationService);
  private readonly _mfeNamespace = inject(MFE_NAMESPACE, { optional: true });

  readonly key = input.required<string>({ alias: 'viTranslate' });
  readonly params = input<Record<string, unknown> | undefined>(undefined, { alias: 'viTranslateParams' });

  constructor() {
    effect(() => {
      // Read the computed translations() signal to establish dependency
      this._ts.translations();
      
      const currentKey = this.key();
      if (currentKey) {
        const translated = this._ts.instant(currentKey, this.params(), this._mfeNamespace ?? undefined);
        this._el.nativeElement.textContent = translated;
      }
    });
  }
}
