import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { CanvasNodeOverlayComponent } from './canvas-node-overlay.component';
import { BuilderStateService } from '../services/builder-state.service';
import { FormSchemaService } from '../services/form-schema.service';
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { setCustomNativeDragPreview } from '@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview';

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/adapter', () => ({
  draggable: vi.fn(() => () => {}) // return a cleanup function
}));

vi.mock('@atlaskit/pragmatic-drag-and-drop/element/set-custom-native-drag-preview', () => ({
  setCustomNativeDragPreview: vi.fn()
}));

import { KeyGeneratorService } from '../services/key-generator.service';

describe('CanvasNodeOverlayComponent', () => {
  let component: CanvasNodeOverlayComponent;
  let fixture: ComponentFixture<CanvasNodeOverlayComponent>;
  let componentRef: ComponentRef<CanvasNodeOverlayComponent>;
  let stateService: BuilderStateService;
  let schemaService: FormSchemaService;

  beforeEach(async () => {
    vi.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [CanvasNodeOverlayComponent],
      providers: [BuilderStateService, FormSchemaService, KeyGeneratorService]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasNodeOverlayComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    stateService = TestBed.inject(BuilderStateService);
    schemaService = TestBed.inject(FormSchemaService);
    
    componentRef.setInput('node', { id: 'test-node', type: 'text-input', label: 'Test Node' });
    fixture.detectChanges();
  });

  it('should create and initialize draggable', () => {
    expect(component).toBeTruthy();
    expect(draggable).toHaveBeenCalledOnce();
  });

  it('should provide correct data to draggable', () => {
    const config = vi.mocked(draggable).mock.calls[0][0];
    const data = config.getInitialData!({ input: null, element: document.createElement('div'), source: {} as any });
    
    expect(data).toEqual({
      source: 'canvas',
      nodeId: 'test-node'
    });
  });

  it('should update isDragging state on drag start and drop', () => {
    const config = vi.mocked(draggable).mock.calls[0][0];
    
    expect(component.isDragging).toBe(false);
    
    if (config.onDragStart) {
      config.onDragStart({} as any);
    }
    expect(component.isDragging).toBe(true);
    
    if (config.onDrop) {
      config.onDrop({} as any);
    }
    expect(component.isDragging).toBe(false);
  });

  it('should generate custom drag preview', () => {
    const config = vi.mocked(draggable).mock.calls[0][0];
    
    if (config.onGenerateDragPreview) {
      config.onGenerateDragPreview({ nativeSetDragImage: {} } as any);
    }
    
    expect(setCustomNativeDragPreview).toHaveBeenCalledOnce();
    const previewConfig = vi.mocked(setCustomNativeDragPreview).mock.calls[0][0];
    
    const container = document.createElement('div');
    previewConfig.render({ container } as any);
    
    expect(container.textContent).toContain('Test Node');
  });

  it('should cleanup on destroy', () => {
    const cleanupMock = vi.fn();
    vi.mocked(draggable).mockReturnValueOnce(cleanupMock);
    
    // recreate to get the new mock
    fixture = TestBed.createComponent(CanvasNodeOverlayComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('node', { id: 'test-node', type: 'text-input', label: 'Test Node' });
    fixture.detectChanges();
    
    fixture.componentInstance.ngOnDestroy();
    expect(cleanupMock).toHaveBeenCalledOnce();
  });

  describe('Actions', () => {
    it('should select node', () => {
      const event = new Event('click');
      const stopPropagationSpy = vi.spyOn(event, 'stopPropagation');
      
      component.selectNode(event);
      
      expect(stopPropagationSpy).toHaveBeenCalled();
      expect(stateService.activeNodeId()).toBe('test-node');
    });

    it('should determine isActive correctly', () => {
      expect(component.isActive).toBe(false);
      stateService.setActiveNode('test-node');
      expect(component.isActive).toBe(true);
    });

    it('should duplicate node', () => {
      const duplicateSpy = vi.spyOn(schemaService, 'duplicateComponent');
      component.duplicateNode();
      expect(duplicateSpy).toHaveBeenCalledWith('test-node');
    });

    it('should delete node', () => {
      const removeSpy = vi.spyOn(schemaService, 'removeComponent');
      component.deleteNode();
      expect(removeSpy).toHaveBeenCalledWith('test-node');
    });

    it('should clear selection if deleted node was active', () => {
      stateService.setActiveNode('test-node');
      expect(stateService.activeNodeId()).toBe('test-node');
      
      component.deleteNode();
      expect(stateService.activeNodeId()).toBeNull();
    });
  });
});
