import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter, ComponentRef } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SettingsHostComponent } from './settings-host.component';
import { ExtensionRegistryService } from '../services/extension-registry.service';
import { BuilderStateService } from '../services/builder-state.service';
import { ComponentDescriptor, ComponentSchema } from '../types';
import { SettingsTabComponent } from './settings-tab.component';
import { DynamicComponentDirective } from './dynamic-component.directive';

// Mock child components
@Component({ selector: 'vi-settings-tab', standalone: true, template: '' })
class MockSettingsTab {
  @Input() tab: any;
  @Input() schema: any;
  @Output() schemaChange = new EventEmitter<any>();
}

@Component({ selector: 'test-custom-settings', standalone: true, template: '<div>Custom Settings</div>' })
class TestCustomSettingsComponent {
  @Input() schema: any;
  @Output() schemaChange = new EventEmitter<any>();
}

// Dummy directive to override DynamicComponentDirective
@Component({ selector: '[viDynamicComponent]', standalone: true, template: '' })
class MockDynamicComponentDirective {
  @Input('viDynamicComponent') type!: any;
  @Input() inputs!: Record<string, unknown>;
  @Input() outputs!: Record<string, (event: unknown) => void>;
}


describe('SettingsHostComponent', () => {
  let component: SettingsHostComponent;
  let fixture: ComponentFixture<SettingsHostComponent>;
  let componentRef: ComponentRef<SettingsHostComponent>;
  let extensionRegistryService: ExtensionRegistryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsHostComponent],
      providers: [ExtensionRegistryService, BuilderStateService]
    })
    .overrideComponent(SettingsHostComponent, {
      remove: { imports: [SettingsTabComponent, DynamicComponentDirective] },
      add: { imports: [MockSettingsTab, MockDynamicComponentDirective] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsHostComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    extensionRegistryService = TestBed.inject(ExtensionRegistryService);
    
    // Default inputs
    componentRef.setInput('schema', { id: '1', type: 'test-type', label: 'Test Label' });
    componentRef.setInput('descriptor', { 
      type: 'test-type', 
      label: 'Test', 
      category: 'basic', 
      icon: 'icon', 
      defaultSchema: {}, 
      canvasElement: 'div', 
      canvasProps: () => ({})
    });
  });

  it('should create and load default descriptor', async () => {
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component).toBeTruthy();
    expect(component.isLoaded).toBe(true);
    expect(component.customComponentType).toBeNull();
  });

  it('should load custom settings component if provided', async () => {
    const customComponentPromise = Promise.resolve(TestCustomSettingsComponent);
    
    componentRef.setInput('descriptor', {
      type: 'test-type',
      label: 'Test',
      category: 'basic',
      icon: 'icon',
      defaultSchema: {},
      canvasElement: 'div',
      canvasProps: () => ({}),
      settingsComponent: () => customComponentPromise
    });
    
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(component.isLoaded).toBe(true);
    expect(component.customComponentType).toBe(TestCustomSettingsComponent);
  });

  it('should handle custom settings component load failure gracefully', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    componentRef.setInput('descriptor', {
      type: 'test-type',
      label: 'Test',
      category: 'basic',
      icon: 'icon',
      defaultSchema: {},
      canvasElement: 'div',
      canvasProps: () => ({}),
      settingsComponent: () => Promise.reject(new Error('Failed to load'))
    });
    
    fixture.detectChanges();
    await fixture.whenStable();
    
    expect(errorSpy).toHaveBeenCalled();
    expect(component.isLoaded).toBe(true);
    expect(component.customComponentType).toBeNull();
    errorSpy.mockRestore();
  });

  describe('groupedExtensions', () => {
    it('should filter and group extensions correctly', () => {
      extensionRegistryService.extensions.set([
        { name: 'field1', type: 'text', section: 'Advanced' },
        { name: 'field2', type: 'number', section: 'Basic', appliesTo: ['other-type'] },
        { name: 'field3', type: 'boolean', section: 'Basic', appliesTo: ['test-type'] }
      ]);
      
      fixture.detectChanges();
      
      const groups = component.groupedExtensions();
      expect(groups.length).toBe(2);
      
      const advancedGroup = groups.find(g => g.section === 'Advanced');
      expect(advancedGroup).toBeTruthy();
      expect(advancedGroup?.fields.length).toBe(1);
      expect(advancedGroup?.fields[0].name).toBe('field1'); // applies to all since no appliesTo
      
      const basicGroup = groups.find(g => g.section === 'Basic');
      expect(basicGroup).toBeTruthy();
      expect(basicGroup?.fields.length).toBe(1);
      expect(basicGroup?.fields[0].name).toBe('field3'); // field2 should be filtered out
    });
  });

  describe('onChange', () => {
    it('should emit schemaChange event', () => {
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.schemaChange, 'emit');
      
      component.onChange({ label: 'New Label' });
      expect(emitSpy).toHaveBeenCalledWith({ label: 'New Label' });
    });
  });

  describe('onMetadataChange', () => {
    it('should update metadata from primitive', () => {
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.schemaChange, 'emit');
      
      component.onMetadataChange('testKey', 'testValue');
      expect(emitSpy).toHaveBeenCalledWith({ metadata: { testKey: 'testValue' } });
    });
    
    it('should preserve existing metadata', () => {
      componentRef.setInput('schema', { id: '1', type: 'test-type', label: 'Test', metadata: { existing: 'value' } });
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.schemaChange, 'emit');
      
      component.onMetadataChange('testKey', 'testValue');
      expect(emitSpy).toHaveBeenCalledWith({ metadata: { existing: 'value', testKey: 'testValue' } });
    });

    it('should extract value from custom event', () => {
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.schemaChange, 'emit');
      
      const event = new CustomEvent('change', { detail: { value: 'custom-val' } });
      component.onMetadataChange('testKey', event);
      expect(emitSpy).toHaveBeenCalledWith({ metadata: { testKey: 'custom-val' } });
      
      const eventChecked = new CustomEvent('change', { detail: { checked: true } });
      component.onMetadataChange('testKey2', eventChecked);
      expect(emitSpy).toHaveBeenCalledWith({ metadata: { testKey2: true } });
      
      const eventOtherObj = new CustomEvent('change', { detail: { other: 123 } });
      component.onMetadataChange('testKey3', eventOtherObj);
      expect(emitSpy).toHaveBeenCalledWith({ metadata: { testKey3: { other: 123 } } });
      
      const eventScalar = new CustomEvent('change', { detail: 'scalar-val' });
      component.onMetadataChange('testKey4', eventScalar);
      expect(emitSpy).toHaveBeenCalledWith({ metadata: { testKey4: 'scalar-val' } });
    });
    
    it('should extract value from HTMLInputElement event', () => {
      fixture.detectChanges();
      const emitSpy = vi.spyOn(component.schemaChange, 'emit');
      
      const checkboxInput = document.createElement('input');
      checkboxInput.type = 'checkbox';
      checkboxInput.checked = true;
      const checkboxEvent = { target: checkboxInput } as unknown as Event;
      Object.setPrototypeOf(checkboxEvent, Event.prototype);
      
      component.onMetadataChange('testKeyCheck', checkboxEvent);
      expect(emitSpy).toHaveBeenCalledWith({ metadata: { testKeyCheck: true } });
      
      const textInput = document.createElement('input');
      textInput.type = 'text';
      textInput.value = 'typed-val';
      const textEvent = { target: textInput } as unknown as Event;
      Object.setPrototypeOf(textEvent, Event.prototype);
      
      component.onMetadataChange('testKeyText', textEvent);
      expect(emitSpy).toHaveBeenCalledWith({ metadata: { testKeyText: 'typed-val' } });
    });
  });
});
