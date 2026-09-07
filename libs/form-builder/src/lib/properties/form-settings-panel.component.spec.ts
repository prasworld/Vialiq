import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { FormSettingsPanelComponent } from './form-settings-panel.component';
import { FormSchemaService } from '../services/form-schema.service';
import { KeyGeneratorService } from '../services/key-generator.service';

describe('FormSettingsPanelComponent', () => {
  let component: FormSettingsPanelComponent;
  let fixture: ComponentFixture<FormSettingsPanelComponent>;
  let componentRef: ComponentRef<FormSettingsPanelComponent>;
  let schemaService: FormSchemaService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormSettingsPanelComponent],
      providers: [FormSchemaService, KeyGeneratorService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FormSettingsPanelComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    schemaService = TestBed.inject(FormSchemaService);
    
    componentRef.setInput('schema', {
      title: 'Test Form',
      display: 'form',
      components: [],
      settings: {}
    });
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('updateTitle', () => {
    it('should update title from CustomEvent', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      const event = new CustomEvent('change', { detail: { value: 'New Title' } });
      
      component.updateTitle(event);
      expect(patchSpy).toHaveBeenCalledWith({ title: 'New Title' });
    });

    it('should update title from HTMLInputElement', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      const inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.value = 'New Title from Input';
      
      const event = { target: inputElement } as unknown as Event;
      Object.setPrototypeOf(event, Event.prototype);
      
      component.updateTitle(event);
      expect(patchSpy).toHaveBeenCalledWith({ title: 'New Title from Input' });
    });

    it('should update title from primitive value', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      component.updateTitle('Direct Title');
      expect(patchSpy).toHaveBeenCalledWith({ title: 'Direct Title' });
    });

    it('should not update title if value is not a string', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      component.updateTitle(123);
      expect(patchSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateDisplay', () => {
    it('should update display if valid value', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      component.updateDisplay('wizard');
      expect(patchSpy).toHaveBeenCalledWith({ display: 'wizard' });
    });

    it('should not update display if invalid value', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      component.updateDisplay('invalid-display');
      expect(patchSpy).not.toHaveBeenCalled();
    });
  });

  describe('updateValidateOn', () => {
    it('should update validateOn setting', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      component.updateValidateOn('blur');
      expect(patchSpy).toHaveBeenCalledWith({
        settings: { validateOn: 'blur' }
      });
    });

    it('should preserve other settings when updating validateOn', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      
      componentRef.setInput('schema', {
        title: 'Test Form',
        display: 'form',
        components: [],
        settings: {
          clearOnHide: true,
          submitContext: 'json'
        }
      });
      
      component.updateValidateOn('change');
      expect(patchSpy).toHaveBeenCalledWith({
        settings: {
          clearOnHide: true,
          submitContext: 'json',
          validateOn: 'change'
        }
      });
    });
    
    it('should handle CustomEvent with checked detail', () => {
      const patchSpy = vi.spyOn(schemaService, 'patchFormSchema');
      const event = new CustomEvent('change', { detail: { checked: true } });
      
      // Though validateOn is string, we just want to test extractValue logic
      component.updateValidateOn(event);
      expect(patchSpy).toHaveBeenCalledWith({
        settings: { validateOn: true }
      });
    });
  });
});
