import { Injectable, OnDestroy, inject } from '@angular/core';
import { monitorForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { FormSchemaService } from './form-schema.service';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { KeyGeneratorService } from './key-generator.service';
import { BuilderStateService } from './builder-state.service';
import type { ComponentSchema } from '../types';

// ─── Drop Payload Types ────────────────────────────────────────────────────────

/** Data attached to palette items when dragging from the component palette */
export interface PaletteDropData {
  readonly source: 'palette';
  readonly descriptorType: string;
}

/** Data attached to canvas nodes when dragging to reorder */
export interface CanvasDropData {
  readonly source: 'canvas';
  readonly nodeId: string;
}

/** Drop target data attached to all CanvasDropZone components */
export interface DropTargetData {
  readonly parentId: string | null;
  readonly index: number;
}

export type DragSourceData = PaletteDropData | CanvasDropData;

function isPaletteSource(data: Record<string, unknown>): data is PaletteDropData & Record<string, unknown> {
  return data['source'] === 'palette' && typeof data['descriptorType'] === 'string';
}

function isCanvasSource(data: Record<string, unknown>): data is CanvasDropData & Record<string, unknown> {
  return data['source'] === 'canvas' && typeof data['nodeId'] === 'string';
}

function isDropTarget(data: Record<string, unknown>): data is DropTargetData & Record<string, unknown> {
  return 'index' in data && typeof data['index'] === 'number';
}

@Injectable({ providedIn: null })
export class DndService implements OnDestroy {
  private formSchemaService = inject(FormSchemaService);
  private registry = inject(BuilderRegistryService);
  private keyGen = inject(KeyGeneratorService);
  private state = inject(BuilderStateService);

  private _cleanup: (() => void) | null = null;

  init() {
    if (this._cleanup) return;

    this._cleanup = monitorForElements({
      onDragStart: () => {
        this.state.setDragging(true);
      },
      onDrop: ({ source, location }) => {
        this.state.setDragging(false);

        const dropTarget = location.current.dropTargets[0];
        if (!dropTarget) return; // Dropped outside any drop zone

        const sourceData = source.data as Record<string, unknown>;
        const targetData = dropTarget.data as Record<string, unknown>;

        if (!isDropTarget(targetData)) return;

        const targetParentId = (targetData['parentId'] as string | null) ?? null;
        const targetIndex = targetData['index'];

        if (isPaletteSource(sourceData)) {
          this.handlePaletteDrop(sourceData.descriptorType, targetParentId, targetIndex);
        } else if (isCanvasSource(sourceData)) {
          this.handleCanvasMove(sourceData.nodeId, targetParentId, targetIndex);
        }
      },
    });
  }

  ngOnDestroy() {
    this._cleanup?.();
    this._cleanup = null;
  }

  private handlePaletteDrop(descriptorType: string, parentId: string | null, index: number): void {
    const descriptor = this.registry.getByType(descriptorType);
    if (!descriptor) return;

    const baseKey = this.keyGen.labelToKey(descriptor.label);
    const existingKeys = this.formSchemaService.getAllKeys();
    const uniqueKey = this.keyGen.deduplicateKey(baseKey, existingKeys);

    const component: ComponentSchema = {
      ...descriptor.defaultSchema,
      id: crypto.randomUUID(),
      type: descriptor.type,
      key: uniqueKey,
      label: descriptor.label,
    } as ComponentSchema;

    this.formSchemaService.addComponent(parentId, index, component);
    this.state.setActiveNode(component.id);
  }

  private handleCanvasMove(nodeId: string, parentId: string | null, index: number): void {
    this.formSchemaService.moveComponent(nodeId, parentId, index);
  }
}
