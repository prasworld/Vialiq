import { Injectable, effect, signal, untracked, computed, inject } from '@angular/core';
import { BUILDER_CONFIG, type BuilderConfig } from '../tokens';
import { FormSchemaService } from './form-schema.service';
import type { FormSchema } from '../types';
// Use structuredClone for simple state objects
const deepClone = <T>(obj: T): T => structuredClone(obj);

@Injectable({ providedIn: null })
export class HistoryService {
  private config = inject<BuilderConfig>(BUILDER_CONFIG);
  private formSchemaService = inject(FormSchemaService);

  private _past = signal<FormSchema[]>([]);
  private _future = signal<FormSchema[]>([]);
  /** True while undo/redo is restoring state — suppresses history recording for that tick */
  private readonly _isNavigating = signal<boolean>(false);
  private _debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private _lastSavedState: FormSchema | null = null;

  readonly canUndo = computed(() => this._past().length > 0);
  readonly canRedo = computed(() => this._future().length > 0);

  constructor() {
    effect(() => {
      const currentSchema = this.formSchemaService.schema();

      untracked(() => {
        if (this._isNavigating()) {
          this._isNavigating.set(false);
          this._lastSavedState = deepClone(currentSchema);
          return;
        }

        if (!this._lastSavedState) {
          this._lastSavedState = deepClone(currentSchema);
          return; // Initial load
        }

        if (this._debounceTimer) {
          clearTimeout(this._debounceTimer);
        }

        this._debounceTimer = setTimeout(() => {
          this._past.update(past => {
            const newPast = [...past, this._lastSavedState!];
            if (newPast.length > this.config.maxHistorySize) {
              newPast.shift();
            }
            return newPast;
          });
          this._future.set([]);
          this._lastSavedState = deepClone(currentSchema);
        }, this.config.historyDebounceMs);
      });
    });
  }

  undo(): void {
    if (!this.canUndo()) return;

    this._isNavigating.set(true);

    const past = this._past();
    const previousState = past[past.length - 1];
    const currentState = deepClone(this.formSchemaService.schema());

    this._past.set(past.slice(0, -1));
    this._future.update(f => [currentState, ...f]);

    this.formSchemaService.load(deepClone(previousState));
  }

  redo(): void {
    if (!this.canRedo()) return;

    this._isNavigating.set(true);

    const future = this._future();
    const nextState = future[0];
    const currentState = deepClone(this.formSchemaService.schema());

    this._future.set(future.slice(1));
    this._past.update(p => [...p, currentState]);

    this.formSchemaService.load(deepClone(nextState));
  }
}
