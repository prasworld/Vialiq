import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, ComponentRef, input } from '@angular/core';
import { CanvasNodeComponent, DynamicElementDirective } from './canvas-node.component';
import { CanvasDropZoneComponent } from './canvas-drop-zone.component';
import { CanvasNodeOverlayComponent } from './canvas-node-overlay.component';
import { BuilderRegistryService } from '../registry/builder-registry.service';
import { BUILDER_CONFIG } from '../tokens';

// Mock child components
@Component({ selector: 'vi-canvas-drop-zone', standalone: true, template: '' })
class MockCanvasDropZone {}

@Component({ selector: 'vi-canvas-node-overlay', standalone: true, template: '<ng-content></ng-content>' })
class MockCanvasNodeOverlay {
  node = input<any>();
}

describe('CanvasNodeComponent & DynamicElementDirective', () => {
  let component: CanvasNodeComponent;
  let fixture: ComponentFixture<CanvasNodeComponent>;
  let componentRef: ComponentRef<CanvasNodeComponent>;
  let registryService: BuilderRegistryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CanvasNodeComponent, DynamicElementDirective],
      providers: [
        BuilderRegistryService,
        {
          provide: BUILDER_CONFIG,
          useValue: { historyDebounceMs: 100, maxHistorySize: 10, allowCustomJs: false, groupOrder: [] }
        }
      ]
    })
    .overrideComponent(CanvasNodeComponent, {
      remove: { imports: [CanvasDropZoneComponent, CanvasNodeOverlayComponent] },
      add: { imports: [MockCanvasDropZone, MockCanvasNodeOverlay] }
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CanvasNodeComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    registryService = TestBed.inject(BuilderRegistryService);
    
    // Mock registry to return a descriptor
    vi.spyOn(registryService, 'getByType').mockReturnValue({
      type: 'test-type',
      label: 'Test',
      category: 'test',
      icon: 'test',
      defaultSchema: { type: 'test-type', label: 'Test' },
      canvasElement: 'div',
      canvasProps: (node) => ({
        'class': 'test-class',
        'attr.data-id': node.id,
        'attr.disabled': true,
        'attr.hidden': false,
        'attr.missing': null
      })
    } as any);

    componentRef.setInput('node', { id: '1', type: 'test-type', label: 'Test Node' });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.hasDescriptor()).toBe(true);
  });

  it('should detect layout node correctly', () => {
    expect(component.isLayoutNode).toBe(false);
    expect(component.getChildren()).toEqual([]);

    componentRef.setInput('node', { 
      id: '2', 
      type: 'layout-type', 
      label: 'Layout',
      components: [{ id: 'child', type: 'test', label: 'child' }],
      layoutConfig: {}
    });
    
    expect(component.isLayoutNode).toBe(true);
    expect(component.getChildren().length).toBe(1);
    expect(component.getChildren()[0].id).toBe('child');
  });

  describe('DynamicElementDirective', () => {
    it('should render the dynamic element and apply props/attrs', () => {
      const el = fixture.nativeElement.querySelector('div[data-id="1"]');
      expect(el).toBeTruthy();
      expect(el.getAttribute('data-id')).toBe('1');
      expect(el.hasAttribute('disabled')).toBe(true);
      expect(el.hasAttribute('hidden')).toBe(false);
      expect(el.hasAttribute('missing')).toBe(false);
    });
    
    it('should handle changing node type and replacing element', () => {
      vi.spyOn(registryService, 'getByType').mockReturnValue({
        type: 'new-type',
        label: 'New',
        category: 'test',
        icon: 'test',
        defaultSchema: { type: 'new-type', label: 'New' },
        canvasElement: 'span',
        canvasProps: () => ({})
      } as any);

      componentRef.setInput('node', { id: '1', type: 'new-type', label: 'New Node' });
      fixture.detectChanges();

      const span = fixture.nativeElement.querySelector('span');
      expect(span).toBeTruthy();
      const div = fixture.nativeElement.querySelector('div.test-class');
      expect(div).toBeFalsy();
    });

    it('should not render anything if descriptor is missing', () => {
      vi.spyOn(registryService, 'getByType').mockReturnValue(undefined);
      componentRef.setInput('node', { id: '1', type: 'unknown-type', label: 'Unknown' });
      fixture.detectChanges();

      expect(component.hasDescriptor()).toBe(false);
    });
  });
});
