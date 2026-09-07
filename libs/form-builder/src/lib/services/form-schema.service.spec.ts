import { TestBed } from '@angular/core/testing';
import { FormSchemaService } from './form-schema.service';
import { KeyGeneratorService } from './key-generator.service';
import { ComponentSchema } from '../types';

describe('FormSchemaService', () => {
  let service: FormSchemaService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        FormSchemaService,
        KeyGeneratorService
      ]
    });
    service = TestBed.inject(FormSchemaService);
  });

  it('should initialize with an empty schema', () => {
    const schema = service.schema();
    expect(schema).toBeTruthy();
    expect(schema.components.length).toBe(0);
    expect(schema.id).toBeDefined();
  });

  describe('Root level schema operations', () => {
    it('should load a full schema', () => {
      const newSchema = {
        id: 'new-id',
        schemaVersion: '1',
        title: 'New Title',
        components: [{ id: 'c1', type: 'text-input', label: 'C1' }]
      };
      service.load(newSchema);
      expect(service.schema().id).toBe('new-id');
      expect(service.schema().title).toBe('New Title');
      expect(service.schema().components.length).toBe(1);
    });

    it('should patch the form schema properties', () => {
      service.patchFormSchema({ title: 'Patched Title', description: 'Desc' });
      expect(service.schema().title).toBe('Patched Title');
      expect(service.schema().description).toBe('Desc');
    });
  });

  describe('addComponent', () => {
    it('should add a component to the root', () => {
      const comp: ComponentSchema = { id: '1', type: 'text-input', label: 'Test' };
      service.addComponent(null, 0, comp);
      expect(service.schema().components.length).toBe(1);
      expect(service.schema().components[0].id).toBe('1');
    });

    it('should add a component to a layout node', () => {
      const layout: ComponentSchema = { id: 'parent', type: 'panel', label: 'Panel', components: [], layoutConfig: {} };
      service.addComponent(null, 0, layout);
      
      const child: ComponentSchema = { id: 'child', type: 'text-input', label: 'Child' };
      service.addComponent('parent', 0, child);
      
      const parent = service.getNode('parent') as any;
      expect(parent.components.length).toBe(1);
      expect(parent.components[0].id).toBe('child');
    });

    it('should gracefully handle adding to a non-existent parent', () => {
      const child: ComponentSchema = { id: 'child', type: 'text-input', label: 'Child' };
      service.addComponent('non-existent', 0, child);
      expect(service.schema().components.length).toBe(0);
    });
  });

  describe('removeComponent', () => {
    it('should remove a component by ID from root', () => {
      service.addComponent(null, 0, { id: '1', type: 'text-input', label: 'Test' });
      service.removeComponent('1');
      expect(service.schema().components.length).toBe(0);
    });

    it('should remove a component by ID from a nested layout', () => {
      service.addComponent(null, 0, { id: 'parent', type: 'panel', label: 'Panel', components: [{ id: 'child', type: 'text-input', label: 'C' }], layoutConfig: {} });
      service.removeComponent('child');
      
      const parent = service.getNode('parent') as any;
      expect(parent.components.length).toBe(0);
    });

    it('should gracefully handle removing non-existent component', () => {
      service.addComponent(null, 0, { id: '1', type: 'text-input', label: 'Test' });
      service.removeComponent('2');
      expect(service.schema().components.length).toBe(1);
    });
  });

  describe('moveComponent', () => {
    it('should move a component within the root', () => {
      service.addComponent(null, 0, { id: '1', type: 'text-input', label: 'Test 1' });
      service.addComponent(null, 1, { id: '2', type: 'text-input', label: 'Test 2' });
      
      service.moveComponent('1', null, 1);
      
      expect(service.schema().components[0].id).toBe('2');
      expect(service.schema().components[1].id).toBe('1');
    });

    it('should move a component into a layout node', () => {
      service.addComponent(null, 0, { id: 'parent', type: 'panel', label: 'Panel', components: [], layoutConfig: {} });
      service.addComponent(null, 1, { id: 'child', type: 'text-input', label: 'Child' });
      
      service.moveComponent('child', 'parent', 0);
      
      expect(service.schema().components.length).toBe(1);
      const parent = service.getNode('parent') as any;
      expect(parent.components.length).toBe(1);
      expect(parent.components[0].id).toBe('child');
    });

    it('should gracefully move to root if target parent is not a layout or not found', () => {
      service.addComponent(null, 0, { id: 'child', type: 'text-input', label: 'Child' });
      service.moveComponent('child', 'non-existent', 0);
      
      expect(service.schema().components.length).toBe(1);
      expect(service.schema().components[0].id).toBe('child');
    });

    it('should do nothing if node to move is not found', () => {
      service.moveComponent('non-existent', null, 0);
      expect(service.schema().components.length).toBe(0);
    });

    it('should not allow moving a node into itself or its descendant', () => {
      service.addComponent(null, 0, { id: 'parent', type: 'panel', label: 'Panel', components: [], layoutConfig: {} });
      service.addComponent('parent', 0, { id: 'child', type: 'panel', label: 'Child', components: [], layoutConfig: {} });
      
      service.moveComponent('parent', 'child', 0);
      
      // Should not have moved
      expect(service.schema().components[0].id).toBe('parent');
      const parent = service.getNode('parent') as any;
      expect(parent.components[0].id).toBe('child');
    });
  });

  describe('patchComponent', () => {
    it('should patch a component in root', () => {
      service.addComponent(null, 0, { id: '1', type: 'text-input', label: 'Test 1' });
      service.patchComponent('1', { label: 'Updated' });
      expect(service.getNode('1')?.label).toBe('Updated');
    });

    it('should gracefully handle patching non-existent component', () => {
      service.addComponent(null, 0, { id: '1', type: 'text-input', label: 'Test 1' });
      service.patchComponent('2', { label: 'Updated' });
      expect(service.getNode('1')?.label).toBe('Test 1');
    });
  });

  describe('duplicateComponent', () => {
    it('should duplicate a node and generate a new ID and key', () => {
      service.addComponent(null, 0, { id: '1', type: 'text-input', label: 'Test', key: 'test' });
      
      service.duplicateComponent('1');
      
      expect(service.schema().components.length).toBe(2);
      expect(service.schema().components[1].id).not.toBe('1');
      expect(service.schema().components[1].key).not.toBe('test');
    });

    it('should duplicate nested layout components', () => {
      const layout: ComponentSchema = {
        id: 'parent', type: 'panel', label: 'Panel', components: [
          { id: 'child', type: 'text-input', label: 'Child', key: 'child_key' }
        ], layoutConfig: {}
      };
      service.addComponent(null, 0, layout);
      
      service.duplicateComponent('parent');
      
      expect(service.schema().components.length).toBe(2);
      const duplicate = service.schema().components[1] as any;
      expect(duplicate.id).not.toBe('parent');
      expect(duplicate.components.length).toBe(1);
      expect(duplicate.components[0].id).not.toBe('child');
      expect(duplicate.components[0].key).not.toBe('child_key');
    });

    it('should do nothing if component not found', () => {
      service.duplicateComponent('non-existent');
      expect(service.schema().components.length).toBe(0);
    });
  });

  describe('Keys uniqueness & extraction', () => {
    beforeEach(() => {
      service.addComponent(null, 0, { id: 'c1', type: 'text-input', label: '1', key: 'key1' });
      service.addComponent(null, 1, {
        id: 'l1', type: 'panel', label: 'L', layoutConfig: {}, components: [
          { id: 'c2', type: 'text-input', label: '2', key: 'key2' }
        ]
      });
    });

    it('should get all keys', () => {
      const keys = service.getAllKeys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
    });

    it('should validate unique keys', () => {
      expect(service.isKeyUnique('key3')).toBe(true);
      expect(service.isKeyUnique('key1')).toBe(false);
      expect(service.isKeyUnique('key2')).toBe(false);
    });

    it('should validate unique keys ignoring the specified node', () => {
      expect(service.isKeyUnique('key1', 'c1')).toBe(true);
      expect(service.isKeyUnique('key2', 'c2')).toBe(true);
      expect(service.isKeyUnique('key2', 'c1')).toBe(false);
    });

    it('should return true if key is empty', () => {
      expect(service.isKeyUnique('')).toBe(true);
    });
  });

  describe('isDescendant', () => {
    it('should return false if node is not a layout', () => {
      service.addComponent(null, 0, { id: 'c1', type: 'text-input', label: '1' });
      expect(service.isDescendant('c1', 'other')).toBe(false);
    });

    it('should return false if node not found', () => {
      expect(service.isDescendant('non-existent', 'other')).toBe(false);
    });

    it('should return true if target is descendant of node', () => {
      service.addComponent(null, 0, {
        id: 'l1', type: 'panel', label: 'L', layoutConfig: {}, components: [
          { id: 'c2', type: 'text-input', label: '2' }
        ]
      });
      expect(service.isDescendant('l1', 'c2')).toBe(true);
    });
  });
});
