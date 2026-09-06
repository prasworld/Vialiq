import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: null })
export class BuilderStateService {
  private readonly _activeNodeId = signal<string | null>(null);
  private readonly _isDragging = signal<boolean>(false);
  private readonly _viewMode = signal<'design' | 'json' | 'preview'>('design');
  private readonly _propertiesPanelOpen = signal<boolean>(true);
  private readonly _contextId = signal<string>('default-context');

  /** Currently selected component ID on the canvas */
  readonly activeNodeId = this._activeNodeId.asReadonly();

  /** Whether a drag operation is currently in progress */
  readonly isDragging = this._isDragging.asReadonly();

  /** Current view mode of the builder (canvas design, JSON view, or rendered preview) */
  readonly viewMode = this._viewMode.asReadonly();

  /**
   * Whether the properties panel is open.
   * Required for vi-drawer integration (Phase 6) and responsive layout.
   */
  readonly propertiesPanelOpen = this._propertiesPanelOpen.asReadonly();

  setActiveNode(id: string | null): void {
    this._activeNodeId.set(id);
    // Auto-open panel when a node is selected
    if (id !== null) {
      this._propertiesPanelOpen.set(true);
    }
  }

  setDragging(isDragging: boolean): void {
    this._isDragging.set(isDragging);
  }

  setViewMode(mode: 'design' | 'json' | 'preview'): void {
    this._viewMode.set(mode);
  }

  togglePropertiesPanel(): void {
    this._propertiesPanelOpen.update(open => !open);
  }

  setPropertiesPanelOpen(open: boolean): void {
    this._propertiesPanelOpen.set(open);
  }

  setContextId(id: string): void {
    this._contextId.set(id);
  }

  readonly contextId = this._contextId.asReadonly();
}
