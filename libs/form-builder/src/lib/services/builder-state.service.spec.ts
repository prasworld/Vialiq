import { TestBed } from '@angular/core/testing';
import { BuilderStateService } from './builder-state.service';

describe('BuilderStateService', () => {
  let service: BuilderStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [BuilderStateService]
    });
    service = TestBed.inject(BuilderStateService);
  });

  it('should be created with default values', () => {
    expect(service).toBeTruthy();
    expect(service.activeNodeId()).toBeNull();
    expect(service.isDragging()).toBe(false);
    expect(service.viewMode()).toBe('design');
    expect(service.propertiesPanelOpen()).toBe(true);
    expect(service.contextId()).toBe('default-context');
  });

  it('should set active node and auto-open properties panel', () => {
    // First close the panel to ensure auto-open works
    service.setPropertiesPanelOpen(false);
    expect(service.propertiesPanelOpen()).toBe(false);

    service.setActiveNode('node-1');
    expect(service.activeNodeId()).toBe('node-1');
    expect(service.propertiesPanelOpen()).toBe(true);

    service.setActiveNode(null);
    expect(service.activeNodeId()).toBeNull();
    // Should stay true, it doesn't auto-close on null
    expect(service.propertiesPanelOpen()).toBe(true);
  });

  it('should set dragging state', () => {
    service.setDragging(true);
    expect(service.isDragging()).toBe(true);
    
    service.setDragging(false);
    expect(service.isDragging()).toBe(false);
  });

  it('should set view mode', () => {
    service.setViewMode('json');
    expect(service.viewMode()).toBe('json');
    
    service.setViewMode('preview');
    expect(service.viewMode()).toBe('preview');
  });

  it('should toggle properties panel', () => {
    expect(service.propertiesPanelOpen()).toBe(true);
    
    service.togglePropertiesPanel();
    expect(service.propertiesPanelOpen()).toBe(false);
    
    service.togglePropertiesPanel();
    expect(service.propertiesPanelOpen()).toBe(true);
  });

  it('should set properties panel open state directly', () => {
    service.setPropertiesPanelOpen(false);
    expect(service.propertiesPanelOpen()).toBe(false);
    
    service.setPropertiesPanelOpen(true);
    expect(service.propertiesPanelOpen()).toBe(true);
  });

  it('should set context id', () => {
    service.setContextId('my-context');
    expect(service.contextId()).toBe('my-context');
  });
});
