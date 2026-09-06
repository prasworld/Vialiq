import { Component, computed, inject } from '@angular/core';

import { BuilderStateService } from '../services/builder-state.service';
import { FormSchemaService } from '../services/form-schema.service';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { SettingsHostComponent } from './settings-host.component';
import { FormSettingsPanelComponent } from './form-settings-panel.component';
import { ComponentSchema } from '../types';

@Component({
  selector: 'vi-properties-panel',
  standalone: true,
  imports: [SettingsHostComponent, FormSettingsPanelComponent],
  templateUrl: './properties-panel.component.html',
  styleUrl: './properties-panel.component.scss',})
export class PropertiesPanelComponent {
  state = inject(BuilderStateService);
  schemaService = inject(FormSchemaService);
  registry = inject(BuilderRegistryService);

  schema = this.schemaService.schema;
  activeNodeId = this.state.activeNodeId;

  activeNode = computed(() => {
    const id = this.activeNodeId();
    if (!id) return null;
    return this.schemaService.getNode(id);
  });

  activeDescriptor = computed(() => {
    const node = this.activeNode();
    if (!node) return null;
    return this.registry.getByType(node.type);
  });

  closeSettings() {
    this.state.setActiveNode(null);
  }

  onSchemaChange(patch: Partial<ComponentSchema>) {
    const id = this.activeNodeId();
    if (id) {
      this.schemaService.patchComponent(id, patch);
    }
  }
}
