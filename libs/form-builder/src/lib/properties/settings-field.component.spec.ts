import { ComponentFixture, TestBed } from '@angular/core/testing';

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { SettingsFieldComponent } from './settings-field.component';

describe('SettingsFieldComponent', () => {
  let component: SettingsFieldComponent;
  let fixture: ComponentFixture<SettingsFieldComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SettingsFieldComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SettingsFieldComponent);
    component = fixture.componentInstance;
    
    component.field = { name: 'test', label: 'Test', type: 'text' };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onValueChange', () => {
    it('should emit value from CustomEvent detail.value', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const event = new CustomEvent('change', { detail: { value: 'test-val' } });
      
      component.onValueChange(event);
      expect(emitSpy).toHaveBeenCalledWith('test-val');
    });

    it('should emit value from CustomEvent detail.checked', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const event = new CustomEvent('change', { detail: { checked: true } });
      
      component.onValueChange(event);
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should emit value from CustomEvent detail object fallback', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const event = new CustomEvent('change', { detail: { other: 'thing' } });
      
      component.onValueChange(event);
      expect(emitSpy).toHaveBeenCalledWith({ other: 'thing' });
    });

    it('should emit value from CustomEvent detail primitive', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const event = new CustomEvent('change', { detail: 'primitive-val' });
      
      component.onValueChange(event);
      expect(emitSpy).toHaveBeenCalledWith('primitive-val');
    });

    it('should emit value from HTMLInputElement checkbox', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const inputElement = document.createElement('input');
      inputElement.type = 'checkbox';
      inputElement.checked = true;
      
      const event = { target: inputElement } as unknown as Event;
      Object.setPrototypeOf(event, Event.prototype);
      
      component.onValueChange(event);
      expect(emitSpy).toHaveBeenCalledWith(true);
    });

    it('should emit value from HTMLInputElement text', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const inputElement = document.createElement('input');
      inputElement.type = 'text';
      inputElement.value = 'text-val';
      
      const event = { target: inputElement } as unknown as Event;
      Object.setPrototypeOf(event, Event.prototype);
      
      component.onValueChange(event);
      expect(emitSpy).toHaveBeenCalledWith('text-val');
    });

    it('should emit primitive value directly', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      component.onValueChange('direct-val');
      expect(emitSpy).toHaveBeenCalledWith('direct-val');
    });

    it('should convert string to number if field type is number', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      component.field = { name: 'testNum', label: 'Test Num', type: 'number' };
      
      component.onValueChange('42');
      expect(emitSpy).toHaveBeenCalledWith(42);
    });
    
    it('should not convert invalid string to number', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      component.field = { name: 'testNum', label: 'Test Num', type: 'number' };
      
      component.onValueChange('invalid-num');
      expect(emitSpy).toHaveBeenCalledWith('invalid-num'); // Remains as string because isNaN is true
    });
  });
});
