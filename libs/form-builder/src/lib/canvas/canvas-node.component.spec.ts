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

  it('should clamp columnsCount to a minimum of 1', () => {
    componentRef.setInput('node', { 
      id: '2', 
      type: 'columns', 
      label: 'Columns',
      components: [],
      layoutConfig: { columns: 0 }
    });
    expect(component.columnsCount).toBe(1);

    componentRef.setInput('node', { 
      id: '3', 
      type: 'columns', 
      label: 'Columns',
      components: [],
      layoutConfig: { columns: -5 }
    });
    expect(component.columnsCount).toBe(1);

    componentRef.setInput('node', { 
      id: '4', 
      type: 'columns', 
      label: 'Columns',
      components: [],
      layoutConfig: { columns: 3 }
    });
    expect(component.columnsCount).toBe(3);
  });

  it('should validate currentActiveTabId against layoutConfig tabs/views and fallback correctly', () => {
    // 1. Valid tab
    componentRef.setInput('node', { 
      id: 'tab-node', 
      type: 'tabs', 
      label: 'Tabs Node',
      components: [],
      layoutConfig: { tabs: [{ id: 'tab1', label: 'Tab 1' }, { id: 'tab2', label: 'Tab 2' }] }
    });
    component.activeTabId.set('tab2');
    expect(component.currentActiveTabId()).toBe('tab2');

    // 2. Invalid/deleted tab -> fallback to first item
    component.activeTabId.set('tab3-deleted');
    expect(component.currentActiveTabId()).toBe('tab1');

    // 3. No tabs -> fallback to empty string
    componentRef.setInput('node', { 
      id: 'tab-node', 
      type: 'tabs', 
      label: 'Tabs Node',
      components: [],
      layoutConfig: { tabs: [] }
    });
    expect(component.currentActiveTabId()).toBe('');

    // 4. Content Switcher valid view
    componentRef.setInput('node', { 
      id: 'switcher-node', 
      type: 'content-switcher', 
      label: 'Switcher Node',
      components: [],
      layoutConfig: { views: [{ id: 'view1', label: 'View 1' }, { id: 'view2', label: 'View 2' }] }
    });
    component.activeTabId.set('view2');
    expect(component.currentActiveTabId()).toBe('view2');

    // 5. Content Switcher invalid/deleted view -> fallback to first item
    component.activeTabId.set('view-deleted');
    expect(component.currentActiveTabId()).toBe('view1');
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

    it('should assign active property for vi-tabs and value property for other elements', () => {
      // Test vi-tabs
      vi.spyOn(registryService, 'getByType').mockReturnValue({
        type: 'tabs-type',
        label: 'Tabs',
        category: 'layout',
        icon: 'test',
        defaultSchema: { type: 'tabs-type', label: 'Tabs' },
        canvasElement: 'vi-tabs',
        canvasProps: () => ({})
      } as any);

      componentRef.setInput('node', { id: '1', type: 'tabs-type', label: 'Tabs Node' });
      component.activeTabId.set('tab-2');
      fixture.detectChanges();

      const tabsEl = fixture.nativeElement.querySelector('vi-tabs');
      expect((tabsEl as any).active).toBe('tab-2');

      // Test vi-content-switcher
      vi.spyOn(registryService, 'getByType').mockReturnValue({
        type: 'switcher-type',
        label: 'Switcher',
        category: 'layout',
        icon: 'test',
        defaultSchema: { type: 'switcher-type', label: 'Switcher' },
        canvasElement: 'vi-content-switcher',
        canvasProps: () => ({})
      } as any);

      componentRef.setInput('node', { id: '2', type: 'switcher-type', label: 'Switcher Node' });
      component.activeTabId.set('view-2');
      fixture.detectChanges();

      const switcherEl = fixture.nativeElement.querySelector('vi-content-switcher');
      expect((switcherEl as any).value).toBe('view-2');
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

    it('should recursively render childElements securely', () => {
      vi.spyOn(registryService, 'getByType').mockReturnValue({
        type: 'test-type',
        label: 'Test',
        category: 'test',
        icon: 'test',
        defaultSchema: { type: 'test-type', label: 'Test' },
        canvasElement: 'div',
        canvasProps: () => ({
          childElements: [
            {
              tag: 'span',
              attributes: { class: 'outer-span' },
              textContent: 'Outer Text',
              children: [
                {
                  tag: 'i',
                  attributes: { class: 'inner-icon' },
                  textContent: 'Icon Text'
                }
              ]
            }
          ]
        })
      } as any);

      componentRef.setInput('node', { id: '1', type: 'test-type', label: 'Test Node' });
      fixture.detectChanges();

      const outerSpan = fixture.nativeElement.querySelector('span.outer-span');
      expect(outerSpan).toBeTruthy();
      expect(outerSpan.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
      expect(outerSpan.childNodes[0].textContent).toBe('Outer Text');

      const innerIcon = outerSpan.querySelector('i.inner-icon');
      expect(innerIcon).toBeTruthy();
      expect(innerIcon.textContent).toBe('Icon Text');
    });

    it('should securely render malicious textContent as text nodes to prevent XSS', () => {
      vi.spyOn(registryService, 'getByType').mockReturnValue({
        type: 'test-type',
        label: 'Test',
        category: 'test',
        icon: 'test',
        defaultSchema: { type: 'test-type', label: 'Test' },
        canvasElement: 'div',
        canvasProps: () => ({
          childElements: [
            {
              tag: 'span',
              textContent: '<script>alert("XSS")</script><img src="x" onerror="alert(1)">'
            }
          ]
        })
      } as any);

      componentRef.setInput('node', { id: '1', type: 'test-type', label: 'Test Node' });
      fixture.detectChanges();

      const span = fixture.nativeElement.querySelector('span');
      expect(span).toBeTruthy();
      
      // The child node should be a pure text node (nodeType 3), NOT an element
      expect(span.childNodes.length).toBe(1);
      expect(span.childNodes[0].nodeType).toBe(Node.TEXT_NODE);
      
      // The content remains as literal text, it does not become a script element
      expect(span.childNodes[0].textContent).toBe('<script>alert("XSS")</script><img src="x" onerror="alert(1)">');
      
      // Searching for a script tag inside the span should yield null
      const scriptTag = span.querySelector('script');
      expect(scriptTag).toBeNull();
    });
  });
});
