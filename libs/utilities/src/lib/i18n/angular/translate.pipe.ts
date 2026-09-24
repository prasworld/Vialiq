import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationService } from './translation.service';
import { MFE_NAMESPACE } from './tokens';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform {
  private readonly ts = inject(TranslationService);
  private readonly mfeNamespace = inject(MFE_NAMESPACE, { optional: true });

  transform(key: string, params?: Record<string, unknown>, namespace?: string): string {
    // Read translations() — only updates when load fully completes.
    // This creates a signal dependency so the pipe re-evaluates when translations arrive.
    this.ts.translations();
    return this.ts.instant(key, params, namespace ?? this.mfeNamespace ?? undefined);
  }
}
