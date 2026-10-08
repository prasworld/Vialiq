import {
  Component,
  Type,
  input,
  output,
  computed,
  inject,
  CUSTOM_ELEMENTS_SCHEMA,
  signal,
  effect,
  ElementRef,
  isDevMode,
} from '@angular/core';

import { ComponentSchema, ComponentDescriptor } from '../types';
import { DynamicComponentDirective } from './dynamic-component.directive';
import { SettingsTabComponent } from './settings-tab.component';
import { ExtensionRegistryService } from '../services/extension-registry.service';
import type { ExtensionFieldDefinition } from '../types/extension';

@Component({
  selector: 'vi-settings-host',
  standalone: true,
  imports: [DynamicComponentDirective, SettingsTabComponent],
  templateUrl: './settings-host.component.html',
  styleUrl: './settings-host.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class SettingsHostComponent {
  readonly schema = input.required<ComponentSchema>();
  readonly descriptor = input.required<ComponentDescriptor>();
  readonly schemaChange = output<Partial<ComponentSchema>>();

  customComponentType = signal<Type<unknown> | null>(null);

  extensionRegistry = inject(ExtensionRegistryService);
  private readonly elementRef = inject(ElementRef);

  private _focusTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Tracks the last selection key (`descriptorType::nodeId`) so the effect can
   * distinguish between a genuine selection change (drag/click a different node)
   * and a schema-value edit (user types in a field on the same node).
   *
   * The schema signal changes on every field edit, causing the effect to re-run.
   * Without this guard, autofocus and the custom-component reload would fire on
   * every keystroke, stealing focus and causing the custom settings panel to flicker.
   */
  private _lastSelectionKey: string | null = null;

  constructor() {
    effect(async () => {
      const descriptor = this.descriptor();
      // Read schema().id to track node identity — ensures the effect re-fires
      // when clicking a same-type control (descriptor unchanged, but node changed).
      const _nodeId = this.schema().id;

      if (isDevMode() && !_nodeId) {
        console.error(
          `[vi-settings-host] ComponentSchema for type "${descriptor.type}" is missing an "id" field.\n` +
          'The settings panel uses schema.id to track which node is selected.\n' +
          'Without it, focus will not update when switching between same-type controls.\n' +
          'Ensure every ComponentSchema has a unique "id" before passing it to the builder.'
        );
      }

      // Build a key that uniquely identifies which node is selected.
      // We use descriptor.type (not object identity) because the same descriptor
      // singleton is reused across selections of the same component type.
      const selectionKey = `${descriptor.type ?? ''}::${_nodeId ?? ''}`;
      const isNewSelection = selectionKey !== this._lastSelectionKey;
      this._lastSelectionKey = selectionKey;

      // Only reload the custom settings component when the selected node changes,
      // not on every schema-value edit. Resetting on every edit would cause the
      // custom panel to unmount/remount (flicker) while the user is typing.
      if (isNewSelection) {
        this.customComponentType.set(null);
        if (descriptor.settingsComponent) {
          try {
            const comp = await descriptor.settingsComponent();
            // Verify the selection hasn't changed while we were waiting for the chunk to load
            if (this._lastSelectionKey === selectionKey) {
              this.customComponentType.set(comp);
            }
          } catch (err) {
            if (this._lastSelectionKey === selectionKey) {
              console.error('Failed to load custom settings component', err);
            }
          }
        }
      }

      // Only autofocus when the selected node actually changes (drag or panel
      // selection switch). Skip when the effect re-runs due to schema value edits
      // (same node, same id) so we don't steal focus mid-edit.
      if (!isNewSelection) return;

      // Cancel any previous pending focus (fast descriptor switching).
      if (this._focusTimer !== null) clearTimeout(this._focusTimer);

      // setTimeout(0) fires after ALL microtasks — meaning after:
      //   1. Angular's zoneless scheduler renders the new settings UI
      //   2. Lit's requestUpdate microtask (schedules shadow DOM render)
      // We then await updateComplete to ensure the internal <input> exists.
      this._focusTimer = setTimeout(async () => {
        this._focusTimer = null;
        const host = this.elementRef.nativeElement as HTMLElement;

        // Reset scroll to top.
        const scrollContainer = host.closest(
          '.panel-content',
        ) as HTMLElement | null;
        if (scrollContainer) scrollContainer.scrollTop = 0;

        // Focus the first interactive control.
        const firstControl = host.querySelector(
          'vi-input, vi-textarea, vi-select, vi-switch, vi-masked-input, vi-date-picker-input, vi-combobox, vi-checkbox, vi-radio, vi-upload, input, select, textarea',
        ) as (HTMLElement & { updateComplete?: Promise<boolean> }) | null;
        if (!firstControl) return;

        if (firstControl.updateComplete) {
          await firstControl.updateComplete;
        }
        firstControl.focus({ preventScroll: true });
        firstControl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    });
  }

  readonly groupedExtensions = computed(() => {
    const fields = this.extensionRegistry.extensions.value() || [];
    const schema = this.schema();

    const applicableFields = fields.filter((f: ExtensionFieldDefinition) => {
      // 1. Check explicit type appliesTo
      if (f.appliesTo && f.appliesTo.length > 0) {
        if (!f.appliesTo.includes(schema.type)) return false;
      }
      
      // 2. Check requiredTraits
      if (f.requiredTraits && f.requiredTraits.length > 0) {
        const componentTraits = this.descriptor().traits || {};
        const hasAllTraits = f.requiredTraits.every(t => componentTraits[t]);
        if (!hasAllTraits) return false;
      }
      
      return true;
    });

    const grouped = applicableFields.reduce(
      (
        acc: Record<string, ExtensionFieldDefinition[]>,
        field: ExtensionFieldDefinition,
      ) => {
        const section = field.section || 'Advanced';
        if (!acc[section]) acc[section] = [];
        acc[section].push(field);
        return acc;
      },
      {} as Record<string, ExtensionFieldDefinition[]>,
    );

    return Object.entries(grouped).map(([section, fields]) => ({
      section,
      fields,
    }));
  });

  readonly onChange = (event: unknown): void => {
    this.schemaChange.emit(event as Partial<ComponentSchema>);
  };

  onMetadataChange(key: string, event: unknown): void {
    let val: unknown;
    if (event instanceof CustomEvent) {
      if (event.detail && typeof event.detail === 'object') {
        if ('value' in event.detail) val = event.detail.value;
        else if ('checked' in event.detail) val = event.detail.checked;
        else val = event.detail;
      } else {
        val = event.detail;
      }
    } else if (
      event instanceof Event &&
      event.target instanceof HTMLInputElement
    ) {
      val =
        event.target.type === 'checkbox'
          ? event.target.checked
          : event.target.value;
    } else {
      val = event;
    }

    const currentMetadata = this.schema().metadata || {};
    this.schemaChange.emit({
      metadata: { ...currentMetadata, [key]: val },
    });
  }
}
