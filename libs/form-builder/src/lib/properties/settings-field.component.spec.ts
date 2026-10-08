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
    
    fixture.componentRef.setInput('field', { name: 'test', label: 'Test', type: 'text' });
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
      fixture.componentRef.setInput('field', { name: 'testNum', label: 'Test Num', type: 'number' });
      
      component.onValueChange('42');
      expect(emitSpy).toHaveBeenCalledWith(42);
    });
    
    it('should not convert invalid string to number', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      fixture.componentRef.setInput('field', { name: 'testNum', label: 'Test Num', type: 'number' });
      
      component.onValueChange('invalid-num');
      expect(emitSpy).toHaveBeenCalledWith('invalid-num'); // Remains as string because isNaN is true
    });
  });

  describe('Item List Behavior', () => {
    it('should return default item list if value is empty or not an array', () => {
      fixture.componentRef.setInput('value', null);
      expect(component.getItemListValue()).toEqual([{ id: 'item1', label: 'Item 1' }]);

      fixture.componentRef.setInput('value', 'not-an-array');
      expect(component.getItemListValue()).toEqual([{ id: 'item1', label: 'Item 1' }]);
    });

    it('should return value if it is an array', () => {
      const list = [{ id: 'tab1', label: 'Tab 1' }];
      fixture.componentRef.setInput('value', list);
      expect(component.getItemListValue()).toEqual(list);
    });

    it('should update item label and emit new list', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const list = [{ id: 'tab1', label: 'Tab 1' }];
      fixture.componentRef.setInput('value', list);

      component.updateItemLabel(0, 'Updated Tab');
      
      expect(emitSpy).toHaveBeenCalledWith([{ id: 'tab1', label: 'Updated Tab' }]);
    });

    it('should add item after specified index and emit new list', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const list = [{ id: 'tab1', label: 'Tab 1' }];
      fixture.componentRef.setInput('value', list);

      component.addItem(0);
      
      expect(emitSpy).toHaveBeenCalled();
      const emittedValue = emitSpy.mock.calls[0][0] as any[];
      expect(emittedValue.length).toBe(2);
      expect(emittedValue[0]).toEqual(list[0]);
      expect(emittedValue[1].id).toMatch(/^item2-\d+$/);
      expect(emittedValue[1].label).toBe('View 2');
    });

    it('should remove item at specified index and emit new list', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const list = [{ id: 'tab1', label: 'Tab 1' }, { id: 'tab2', label: 'Tab 2' }];
      fixture.componentRef.setInput('value', list);

      component.removeItem(0);
      
      expect(emitSpy).toHaveBeenCalledWith([{ id: 'tab2', label: 'Tab 2' }]);
    });

    it('should not remove item if there is only 1 item left', () => {
      const emitSpy = vi.spyOn(component.valueChange, 'emit');
      const list = [{ id: 'tab1', label: 'Tab 1' }];
      fixture.componentRef.setInput('value', list);

      component.removeItem(0);
      
      expect(emitSpy).not.toHaveBeenCalled();
    });
  });
});
