import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, Output, EventEmitter } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PropertiesPanelComponent } from './properties-panel.component';
import { BuilderStateService } from '../services/builder-state.service';
import { FormSchemaService } from '../services/form-schema.service';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { KeyGeneratorService } from '../services/key-generator.service';
import { ComponentSchema, ComponentDescriptor } from '../types';
import { SettingsHostComponent } from './settings-host.component';
import { FormSettingsPanelComponent } from './form-settings-panel.component';
import { BUILDER_CONFIG } from '../tokens';

// Mock components
@Component({ selector: 'vi-settings-host', standalone: true, template: '' })
class MockSettingsHost {
  descriptor = input.required<ComponentDescriptor>();
  schema = input.required<ComponentSchema>();
  @Output() schemaChange = new EventEmitter<Partial<ComponentSchema>>();
}

@Component({ selector: 'vi-form-settings-panel', standalone: true, template: '' })
class MockFormSettingsPanel {
  schema = input<any>();
}

describe('PropertiesPanelComponent', () => {
  let component: PropertiesPanelComponent;
  let fixture: ComponentFixture<PropertiesPanelComponent>;
  let stateService: BuilderStateService;
  let schemaService: FormSchemaService;
  let registryService: BuilderRegistryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PropertiesPanelComponent],
      providers: [
        BuilderStateService,
        FormSchemaService,
        BuilderRegistryService,
        KeyGeneratorService,
        {
          provide: BUILDER_CONFIG,
          useValue: { historyDebounceMs: 100, maxHistorySize: 10, allowCustomJs: false, groupOrder: [] }
        }
      ]
    })
    .overrideComponent(PropertiesPanelComponent, {
      remove: { imports: [SettingsHostComponent, FormSettingsPanelComponent] },
      add: { imports: [MockSettingsHost, MockFormSettingsPanel] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PropertiesPanelComponent);
    component = fixture.componentInstance;
    stateService = TestBed.inject(BuilderStateService);
    schemaService = TestBed.inject(FormSchemaService);
    registryService = TestBed.inject(BuilderRegistryService);
    
    // Register a mock descriptor
    vi.spyOn(registryService, 'getByType').mockImplementation((type) => {
      if (type === 'test-type') {
        return {
          type: 'test-type',
          label: 'Test',
          category: 'test',
          icon: 'test',
          defaultSchema: { type: 'test-type', label: 'Test' },
          canvasElement: 'div',
          canvasProps: () => ({})
        } as any;
      }
      return undefined;
    });

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return null for activeNode and activeDescriptor when no activeNodeId', () => {
    expect(component.activeNode()).toBeNull();
    expect(component.activeDescriptor()).toBeNull();
  });

  it('should return activeNode and activeDescriptor when node is selected', () => {
    // Add component to schema
    schemaService.addComponent(null, 0, { id: 'node-1', type: 'test-type', label: 'Test Node' });
    
    // Select it
    stateService.setActiveNode('node-1');
    
    const node = component.activeNode();
    expect(node).toBeTruthy();
    expect(node?.id).toBe('node-1');
    
    const descriptor = component.activeDescriptor();
    expect(descriptor).toBeTruthy();
    expect(descriptor?.type).toBe('test-type');
  });

  it('should clear selection when closeSettings is called', () => {
    stateService.setActiveNode('node-1');
    expect(stateService.activeNodeId()).toBe('node-1');
    
    component.closeSettings();
    expect(stateService.activeNodeId()).toBeNull();
  });

  it('should patch schema when onSchemaChange is called', () => {
    schemaService.addComponent(null, 0, { id: 'node-1', type: 'test-type', label: 'Test Node' });
    stateService.setActiveNode('node-1');
    
    const patchSpy = vi.spyOn(schemaService, 'patchComponent');
    
    component.onSchemaChange({ label: 'Updated Label' });
    
    expect(patchSpy).toHaveBeenCalledWith('node-1', { label: 'Updated Label' });
  });

  it('should not patch schema if activeNodeId is null', () => {
    const patchSpy = vi.spyOn(schemaService, 'patchComponent');
    
    component.onSchemaChange({ label: 'Updated Label' });
    
    expect(patchSpy).not.toHaveBeenCalled();
  });
});
