import { TestBed } from '@angular/core/testing';
import { BuilderRegistryService } from './builder-registry.service';
import { BUILDER_CONFIG } from '../tokens/builder-config.token';
import { BUILDER_COMPONENTS } from '../tokens/builder-components.token';
import type { ComponentDescriptor } from '../types/component-descriptor';
import { vi, describe, it, expect } from 'vitest';

describe('BuilderRegistryService', () => {
  const mockDescriptor1: ComponentDescriptor = {
    type: 'test-1',
    label: 'Test 1',
    category: 'basic',
    group: 'Basic Info',
    weight: 20,
    canvasElement: 'div',
    canvasProps: () => ({}),
    defaultSchema: { type: 'test-1', label: 'Test 1' },
    settingsSchema: { tabs: [] }
  };

  const mockDescriptor2: ComponentDescriptor = {
    type: 'test-2',
    label: 'Test 2',
    category: 'advanced',
    group: 'Other',
    weight: 10,
    canvasElement: 'div',
    canvasProps: () => ({}),
    defaultSchema: { type: 'test-2', label: 'Test 2' },
    settingsSchema: { tabs: [] }
  };

  it('initializes with empty descriptors if none provided', () => {
    TestBed.configureTestingModule({
      providers: [
        BuilderRegistryService,
        { provide: BUILDER_CONFIG, useValue: {} }
      ]
    });
    const service = TestBed.inject(BuilderRegistryService);
    expect(service.getAllTypes()).toEqual([]);
    expect(service.getAll()).toEqual([]);
  });

  it('registers descriptors and sorts them by group and weight', () => {
    TestBed.configureTestingModule({
      providers: [
        BuilderRegistryService,
        { provide: BUILDER_CONFIG, useValue: { groupOrder: ['Basic Info', 'Other'] } },
        { provide: BUILDER_COMPONENTS, useValue: [mockDescriptor1, mockDescriptor2], multi: true }
      ]
    });
    
    const service = TestBed.inject(BuilderRegistryService);
    
    expect(service.getAllTypes()).toEqual(['test-1', 'test-2']);
    expect(service.getByType('test-1')).toBe(mockDescriptor1);
    expect(service.getByType('test-2')).toBe(mockDescriptor2);
    expect(service.getByType('unknown')).toBeUndefined();

    const grouped = service.getGrouped();
    expect(grouped.get('Basic Info')![0]).toBe(mockDescriptor1);
    expect(grouped.get('Other')![0]).toBe(mockDescriptor2);

    const all = service.getAll();
    // Because of groupOrder: Basic Info first, then Other
    expect(all[0]).toBe(mockDescriptor1); 
    expect(all[1]).toBe(mockDescriptor2);
  });

  it('handles duplicate descriptors by keeping first and warning', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    TestBed.configureTestingModule({
      providers: [
        BuilderRegistryService,
        { provide: BUILDER_CONFIG, useValue: {} },
        { provide: BUILDER_COMPONENTS, useValue: [mockDescriptor1, mockDescriptor1], multi: true }
      ]
    });
    
    const service = TestBed.inject(BuilderRegistryService);
    expect(service.getAllTypes().length).toBe(1);
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });

  it('places unconfigured groups at the end', () => {
    const customDescriptor: ComponentDescriptor = {
      ...mockDescriptor1,
      type: 'custom',
      group: 'Custom Group'
    };
    
    TestBed.configureTestingModule({
      providers: [
        BuilderRegistryService,
        { provide: BUILDER_CONFIG, useValue: { groupOrder: ['Basic Info'] } },
        { provide: BUILDER_COMPONENTS, useValue: [customDescriptor, mockDescriptor1], multi: true }
      ]
    });

    const service = TestBed.inject(BuilderRegistryService);
    const keys = Array.from(service.getGrouped().keys());
    expect(keys).toEqual(['Basic Info', 'Custom Group']);
  });

  it('falls back to "Other" group if group is empty', () => {
    const noGroupDescriptor: ComponentDescriptor = {
      ...mockDescriptor1,
      type: 'no-group',
      group: ''
    };
    
    TestBed.configureTestingModule({
      providers: [
        BuilderRegistryService,
        { provide: BUILDER_CONFIG, useValue: {} },
        { provide: BUILDER_COMPONENTS, useValue: [noGroupDescriptor], multi: true }
      ]
    });

    const service = TestBed.inject(BuilderRegistryService);
    const grouped = service.getGrouped();
    expect(grouped.has('Other')).toBe(true);
  });
});
