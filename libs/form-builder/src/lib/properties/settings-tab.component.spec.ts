import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, Output, EventEmitter, ComponentRef } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SettingsTabComponent } from './settings-tab.component';
import { SettingsFieldComponent } from './settings-field.component';
import { SettingsField } from '../types';

@Component({ selector: 'vi-settings-field', standalone: true, template: '' })
class MockSettingsField {
  field = input.required<SettingsField>();
  value = input.required<unknown>();
  @Output() valueChange = new EventEmitter<unknown>();
}

describe('SettingsTabComponent', () => {
  let component: SettingsTabComponent;
  let fixture: ComponentFixture<SettingsTabComponent>;
  let componentRef: ComponentRef<SettingsTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsTabComponent]
    })
    .overrideComponent(SettingsTabComponent, {
      remove: { imports: [SettingsFieldComponent] },
      add: { imports: [MockSettingsField] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsTabComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    componentRef.setInput('tab', { id: 'general', label: 'General', fields: [] });
    componentRef.setInput('schema', { id: '1', type: 'text', label: 'Test Label' });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get field value from schema', () => {
    expect(component.getFieldValue('label')).toBe('Test Label');
    expect(component.getFieldValue('type')).toBe('text');
    expect(component.getFieldValue('nonExistent')).toBeUndefined();
  });

  it('should emit schemaChange on value change', () => {
    const emitSpy = vi.spyOn(component.schemaChange, 'emit');
    
    component.onValueChange('label', 'New Label');
    
    expect(emitSpy).toHaveBeenCalledWith({ label: 'New Label' });
  });

  it('should reassign tabAssignments when a tab is deleted', () => {
    const emitSpy = vi.spyOn(component.schemaChange, 'emit');
    
    componentRef.setInput('schema', {
      id: '1',
      type: 'tabs',
      layoutConfig: {
        tabs: [
          { id: 'tab1', label: 'Tab 1' },
          { id: 'tab2', label: 'Tab 2' }
        ],
        tabAssignments: {
          'child1': 'tab1',
          'child2': 'tab2',
          'child3': 'tab2'
        }
      }
    });

    // Simulate deleting 'tab2'
    component.onValueChange('layoutConfig.tabs', [{ id: 'tab1', label: 'Tab 1' }]);

    expect(emitSpy).toHaveBeenCalledWith({
      layoutConfig: {
        tabs: [{ id: 'tab1', label: 'Tab 1' }],
        tabAssignments: {
          'child1': 'tab1',
          'child2': 'tab1', // Reassigned to tab1
          'child3': 'tab1'  // Reassigned to tab1
        }
      }
    });
  });

  it('should clear tabAssignments if the last tab is deleted', () => {
    const emitSpy = vi.spyOn(component.schemaChange, 'emit');
    
    componentRef.setInput('schema', {
      id: '1',
      type: 'tabs',
      layoutConfig: {
        tabs: [
          { id: 'tab1', label: 'Tab 1' }
        ],
        tabAssignments: {
          'child1': 'tab1'
        }
      }
    });

    // Simulate deleting the last tab
    component.onValueChange('layoutConfig.tabs', []);

    expect(emitSpy).toHaveBeenCalledWith({
      layoutConfig: {
        tabs: [],
        tabAssignments: {} // Child assignment deleted
      }
    });
  });
});
