import { FormSchemaService } from './form-schema.service';
import { ComponentSchema } from '../types';

describe('FormSchemaService', () => {
  let service: FormSchemaService;

  beforeEach(() => {
    service = new FormSchemaService();
  });

  it('should initialize with an empty schema', () => {
    const schema = service.schema();
    expect(schema).toBeTruthy();
    expect(schema.components.length).toBe(0);
    expect(schema.id).toBeDefined();
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
  });

  describe('removeComponent', () => {
    it('should remove a component by ID', () => {
      service.addComponent(null, 0, { id: '1', type: 'text-input', label: 'Test' });
      service.removeComponent('1');
      expect(service.schema().components.length).toBe(0);
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

  describe('duplicateComponent', () => {
    it('should duplicate a node and generate a new ID and key', () => {
      service.addComponent(null, 0, { id: '1', type: 'text-input', label: 'Test', key: 'test' });
      
      const deduplicator = (key: string, existing: string[]) => key + '2';
      service.duplicateComponent('1', deduplicator);
      
      expect(service.schema().components.length).toBe(2);
      expect(service.schema().components[1].id).not.toBe('1');
      expect(service.schema().components[1].key).toBe('test2');
    });
  });
});
