import { Component, OnChanges, SimpleChanges, forwardRef, Directive, ElementRef, Renderer2, inject, input, output, computed, signal, SecurityContext, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ComponentSchema, LayoutComponentSchema } from '../types';
import { CanvasDropZoneComponent } from './canvas-drop-zone.component';
import { CanvasNodeOverlayComponent } from './canvas-node-overlay.component';
import { BuilderRegistryService } from '../registry/builder-registry.service';

@Directive({
  selector: '[viDynamicElement]',
  standalone: true
})
export class DynamicElementDirective implements OnChanges {
  readonly node = input.required<ComponentSchema>({ alias: "viDynamicElement" });
  readonly activeItemId = input<string | null>(null);
  
  private registry = inject(BuilderRegistryService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  private sanitizer = inject(DomSanitizer);
  
  private currentElement: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['node'] || changes['activeItemId']) {
      this.render();
    }
  }

  private render() {
    const node = this.node();
    if (!node) return;
    
    const descriptor = this.registry.getByType(node.type);
    if (!descriptor) return;

    this.ensureElementMatchesTag(descriptor.canvasElement);
    if (!this.currentElement) return;

    const props = descriptor.canvasProps(node);
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('attr.')) {
        this.applyAttribute(key.slice(5), value);
      } else if (key === 'htmlContent') {
        this.setSafeHtmlContent(value as string);
      } else if (key === 'childElements') {
        this.renderChildElements(value as any[]);
      } else if (key === 'class') {
        this.applyClass(value);
      } else {
        (this.currentElement as unknown as Record<string, unknown>)[key] = value;
      }
    }

    if (this.activeItemId()) {
      const isTabs = this.currentElement.tagName.toLowerCase() === 'vi-tabs';
      const propertyName = isTabs ? 'active' : 'value';
      (this.currentElement as unknown as Record<string, unknown>)[propertyName] = this.activeItemId();
    }
  }

  readonly activeItemChange = output<string>();

  private ensureElementMatchesTag(tagName: string): void {
    if (!this.currentElement || this.currentElement.tagName.toLowerCase() !== tagName.toLowerCase()) {
      if (this.currentElement) {
        this.renderer.removeChild(this.el.nativeElement, this.currentElement);
      }
      this.currentElement = this.renderer.createElement(tagName);
      
      // Listen for tab/view changes
      this.renderer.listen(this.currentElement, 'vi-tabs-change', (e: CustomEvent) => {
        this.activeItemChange.emit(e.detail.value);
      });
      this.renderer.listen(this.currentElement, 'vi-content-switcher-change', (e: CustomEvent) => {
        this.activeItemChange.emit(e.detail.value);
      });

      this.renderer.appendChild(this.el.nativeElement, this.currentElement);
    }
  }

  private applyAttribute(attrName: string, value: unknown): void {
    if (!this.currentElement) return;
    if (value === null || value === undefined || value === false) {
      this.renderer.removeAttribute(this.currentElement, attrName);
    } else {
      this.renderer.setAttribute(this.currentElement, attrName, value === true ? '' : String(value));
    }
  }

  private applyClass(value: unknown): void {
    if (!this.currentElement) return;
    if (value === null || value === undefined || value === false) {
      this.renderer.removeAttribute(this.currentElement, 'class');
    } else {
      this.renderer.setAttribute(this.currentElement, 'class', String(value));
    }
  }

  private setSafeHtmlContent(htmlString: string): void {
    if (!this.currentElement) return;
    const safeValue = this.sanitizer.sanitize(SecurityContext.HTML, htmlString) || '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(safeValue, 'text/html');
    this.currentElement.replaceChildren(...Array.from(doc.body.childNodes));
  }

  private renderChildElements(children: any[], parentEl?: any): void {
    const targetParent = parentEl || this.currentElement;
    if (!targetParent) return;
    
    // Clear dynamically rendered child elements first to prevent duplication
    if (!parentEl) {
      targetParent.innerHTML = '';
    }
    
    children.forEach(childDef => {
      const el = this.renderer.createElement(childDef.tag);
      if (childDef.attributes) {
        for (const [attr, val] of Object.entries(childDef.attributes)) {
          this.renderer.setAttribute(el, attr, String(val));
        }
      }
      if (childDef.textContent) {
        const text = this.renderer.createText(childDef.textContent);
        this.renderer.appendChild(el, text);
      }
      if (childDef.children && Array.isArray(childDef.children)) {
        this.renderChildElements(childDef.children, el);
      }
      this.renderer.appendChild(targetParent, el);
    });
  }
}

@Component({
  selector: 'vi-canvas-node',
  standalone: true,
  imports: [
    CanvasDropZoneComponent,
    CanvasNodeOverlayComponent,
    DynamicElementDirective,
    forwardRef(() => CanvasNodeComponent)
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './canvas-node.component.html',
  styleUrl: './canvas-node.component.scss',
})
export class CanvasNodeComponent {
  private registry = inject(BuilderRegistryService);

  readonly node = input.required<ComponentSchema>();
  
  readonly hasDescriptor = computed(() => !!this.registry.getByType(this.node().type));

  get isLayoutNode(): boolean {
    const node = this.node();
    return 'components' in node && Array.isArray((node as LayoutComponentSchema).components);
  }

  getChildren(): ComponentSchema[] {
    const node = this.node();
    return 'components' in node ? (node as LayoutComponentSchema).components : [];
  }

  get columnsCount(): number {
    const node = this.node();
    if (node.type === 'columns' && 'layoutConfig' in node) {
      return Math.max(1, Number((node.layoutConfig as Record<string, unknown>)?.['columns'] ?? 2));
    }
    return 0;
  }

  getColumnsArray(): number[] {
    return Array.from({ length: Math.max(1, this.columnsCount) }, (_, i) => i);
  }

  getChildrenForColumn(colIndex: number): { child: ComponentSchema; globalIndex: number }[] {
    const node = this.node();
    if (!('components' in node)) return [];
    
    const components = (node as LayoutComponentSchema).components;
    const assignments = ((node.layoutConfig as Record<string, unknown>)?.['columnAssignments'] as Record<string, number>) || {};
    
    return components
      .map((child, index) => ({ child, globalIndex: index }))
      .filter(({ child }) => {
        // Unassigned children default to column 0
        const assignedCol = assignments[child.id] ?? 0;
        return assignedCol === colIndex;
      });
  }

  getFirstInsertIndexForColumn(colIndex: number): number {
    const childrenInCol = this.getChildrenForColumn(colIndex);
    if (childrenInCol.length > 0) {
      return childrenInCol[0].globalIndex;
    }
    return this.getChildren().length;
  }

  activeTabId = signal<string | null>(null);

  currentActiveTabId = computed(() => {
    const active = this.activeTabId();
    const node = this.node() as LayoutComponentSchema;
    const config = node.layoutConfig as Record<string, unknown> | undefined;

    if (node.type === 'tabs' && config?.['tabs']) {
      const tabs = config['tabs'] as { id: string }[];
      if (active && tabs.some(t => t.id === active)) return active;
      if (tabs.length > 0) return tabs[0].id;
      return '';
    }
    if (node.type === 'content-switcher' && config?.['views']) {
      const views = config['views'] as { id: string }[];
      if (active && views.some(v => v.id === active)) return active;
      if (views.length > 0) return views[0].id;
      return '';
    }
    return active || '';
  });

  onActiveItemChange(id: string) {
    this.activeTabId.set(id);
  }

  getChildrenForTab(tabId: string): { child: ComponentSchema; globalIndex: number }[] {
    const node = this.node();
    if (!('components' in node)) return [];
    
    const components = (node as LayoutComponentSchema).components;
    
    let assignments: Record<string, string> = {};
    if (node.type === 'tabs') {
      assignments = ((node.layoutConfig as Record<string, unknown>)?.['tabAssignments'] as Record<string, string>) || {};
    } else if (node.type === 'content-switcher') {
      assignments = ((node.layoutConfig as Record<string, unknown>)?.['viewAssignments'] as Record<string, string>) || {};
    }
    
    let firstTabId: string | undefined;
    const layoutConfig = (node.layoutConfig as Record<string, unknown> | undefined);
    if (node.type === 'tabs') {
      firstTabId = layoutConfig?.['tabs'] ? (layoutConfig['tabs'] as { id: string }[])[0]?.id : undefined;
    } else if (node.type === 'content-switcher') {
      firstTabId = layoutConfig?.['views'] ? (layoutConfig['views'] as { id: string }[])[0]?.id : undefined;
    }

    return components
      .map((child, index) => ({ child, globalIndex: index }))
      .filter(({ child }) => {
        const assignedTab = assignments[child.id];
        if (assignedTab) return assignedTab === tabId;
        // Unassigned children go to the first tab by default
        return tabId === firstTabId;
      });
  }

  getFirstInsertIndexForTab(tabId: string): number {
    const childrenInTab = this.getChildrenForTab(tabId);
    if (childrenInTab.length > 0) {
      return childrenInTab[0].globalIndex;
    }
    return this.getChildren().length;
  }
}
