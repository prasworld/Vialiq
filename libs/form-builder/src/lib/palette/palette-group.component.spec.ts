import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, input, ComponentRef } from '@angular/core';
import { PaletteGroupComponent } from './palette-group.component';
import { PaletteItemComponent } from './palette-item.component';
import { ComponentDescriptor } from '../types';

@Component({ selector: 'vi-palette-item', standalone: true, template: '' })
class MockPaletteItem {
  descriptor = input.required<ComponentDescriptor>();
}

describe('PaletteGroupComponent', () => {
  let component: PaletteGroupComponent;
  let fixture: ComponentFixture<PaletteGroupComponent>;
  let componentRef: ComponentRef<PaletteGroupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteGroupComponent]
    })
    .overrideComponent(PaletteGroupComponent, {
      remove: { imports: [PaletteItemComponent] },
      add: { imports: [MockPaletteItem] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaletteGroupComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    componentRef.setInput('title', 'Group 1');
    componentRef.setInput('items', [
      { type: 'test', label: 'Test', category: 'test', icon: 'test', defaultSchema: {}, canvasElement: 'div', canvasProps: () => ({}) }
    ]);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.title()).toBe('Group 1');
    expect(component.items().length).toBe(1);
  });
});
