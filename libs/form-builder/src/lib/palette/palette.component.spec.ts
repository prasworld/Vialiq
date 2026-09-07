import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter, ComponentRef } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { PaletteComponent } from './palette.component';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { BUILDER_CONFIG } from '../tokens';
import { PaletteSearchComponent } from './palette-search.component';
import { PaletteGroupComponent } from './palette-group.component';
import { ComponentDescriptor } from '../types';

// Mock components
@Component({ selector: 'vi-palette-search', standalone: true, template: '' })
class MockPaletteSearch {
  @Output() search = new EventEmitter<string>();
}

@Component({ selector: 'vi-palette-group', standalone: true, template: '' })
class MockPaletteGroup {
  @Input() title!: string;
  @Input() items!: ComponentDescriptor[];
}

describe('PaletteComponent', () => {
  let component: PaletteComponent;
  let fixture: ComponentFixture<PaletteComponent>;
  let registryService: BuilderRegistryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaletteComponent],
      providers: [
        BuilderRegistryService,
        {
          provide: BUILDER_CONFIG,
          useValue: { historyDebounceMs: 100, maxHistorySize: 10, allowCustomJs: false, groupOrder: [] }
        }
      ]
    })
    .overrideComponent(PaletteComponent, {
      remove: { imports: [PaletteSearchComponent, PaletteGroupComponent] },
      add: { imports: [MockPaletteSearch, MockPaletteGroup] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PaletteComponent);
    component = fixture.componentInstance;
    registryService = TestBed.inject(BuilderRegistryService);

    // Mock registry grouped items
    const groupedItems = new Map<string, ComponentDescriptor[]>();
    groupedItems.set('Basic', [
      { type: 'text', label: 'Text Box', category: 'basic', icon: 'type', defaultSchema: {}, canvasElement: 'div', canvasProps: () => ({}) },
      { type: 'number', label: 'Number', category: 'basic', icon: 'hash', defaultSchema: {}, canvasElement: 'div', canvasProps: () => ({}) }
    ] as any[]);
    groupedItems.set('Advanced', [
      { type: 'date', label: 'Date Picker', category: 'advanced', icon: 'calendar', defaultSchema: {}, canvasElement: 'div', canvasProps: () => ({}) }
    ] as any[]);
    
    vi.spyOn(registryService, 'getGrouped').mockReturnValue(groupedItems);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return all grouped items when search query is empty', () => {
    const groups = component.groupedItems();
    expect(groups.length).toBe(2);
    expect(groups[0].group).toBe('Basic');
    expect(groups[0].items.length).toBe(2);
    expect(groups[1].group).toBe('Advanced');
    expect(groups[1].items.length).toBe(1);
  });

  it('should filter items based on search query', () => {
    component.onSearch('number');
    
    const groups = component.groupedItems();
    expect(groups.length).toBe(1);
    expect(groups[0].group).toBe('Basic');
    expect(groups[0].items.length).toBe(1);
    expect(groups[0].items[0].type).toBe('number');
  });

  it('should filter out groups if all items are filtered out', () => {
    component.onSearch('xyz');
    
    const groups = component.groupedItems();
    expect(groups.length).toBe(0);
  });

  describe('with enabledCategories config', () => {
    beforeEach(async () => {
      TestBed.resetTestingModule();
      await TestBed.configureTestingModule({
        imports: [PaletteComponent],
        providers: [
          BuilderRegistryService,
          {
            provide: BUILDER_CONFIG,
            useValue: { enabledCategories: ['advanced'], historyDebounceMs: 100, maxHistorySize: 10, allowCustomJs: false, groupOrder: [] }
          }
        ]
      })
      .overrideComponent(PaletteComponent, {
        remove: { imports: [PaletteSearchComponent, PaletteGroupComponent] },
        add: { imports: [MockPaletteSearch, MockPaletteGroup] }
      })
      .compileComponents();
      
      fixture = TestBed.createComponent(PaletteComponent);
      component = fixture.componentInstance;
      registryService = TestBed.inject(BuilderRegistryService);

      const groupedItems = new Map<string, ComponentDescriptor[]>();
      groupedItems.set('Basic', [
        { type: 'text', label: 'Text Box', category: 'basic', icon: 'type', defaultSchema: {}, canvasElement: 'div', canvasProps: () => ({}) },
      ] as any[]);
      groupedItems.set('Advanced', [
        { type: 'date', label: 'Date Picker', category: 'advanced', icon: 'calendar', defaultSchema: {}, canvasElement: 'div', canvasProps: () => ({}) }
      ] as any[]);
      
      vi.spyOn(registryService, 'getGrouped').mockReturnValue(groupedItems);
      
      fixture.detectChanges();
    });

    it('should filter items based on enabledCategories', () => {
      const groups = component.groupedItems();
      expect(groups.length).toBe(1);
      expect(groups[0].group).toBe('Advanced');
      expect(groups[0].items.length).toBe(1);
    });
  });
});
