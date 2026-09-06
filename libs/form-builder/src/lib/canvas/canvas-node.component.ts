import { Component, OnInit, OnChanges, SimpleChanges, forwardRef, Directive, ElementRef, Renderer2, inject, input } from '@angular/core';

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
  
  private registry = inject(BuilderRegistryService);
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);
  
  private currentElement: HTMLElement | null = null;

  ngOnChanges(changes: SimpleChanges) {
    if (changes['node']) {
      this.render();
    }
  }

  private render() {
    const node = this.node();
    if (!node) return;
    
    const descriptor = this.registry.getByType(node.type);
    if (!descriptor) return;

    // Create the element if it doesn't exist or if the tag changed
    if (!this.currentElement || this.currentElement.tagName.toLowerCase() !== descriptor.canvasElement.toLowerCase()) {
      if (this.currentElement) {
        this.renderer.removeChild(this.el.nativeElement, this.currentElement);
      }
      this.currentElement = this.renderer.createElement(descriptor.canvasElement);
      this.renderer.appendChild(this.el.nativeElement, this.currentElement);
    }

    // Apply props mapping
    const props = descriptor.canvasProps(node);
    for (const [key, value] of Object.entries(props)) {
      if (key.startsWith('attr.')) {
        const attrName = key.slice(5);
        if (value === null || value === undefined || value === false) {
          this.renderer.removeAttribute(this.currentElement, attrName);
        } else {
          this.renderer.setAttribute(this.currentElement, attrName, value === true ? '' : String(value));
        }
      } else {
        // Property binding — safe cast via Record<string, unknown>
        (this.currentElement as unknown as Record<string, unknown>)[key] = value;
      }
    }
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
  templateUrl: './canvas-node.component.html',
  styleUrl: './canvas-node.component.scss',})
export class CanvasNodeComponent implements OnInit {
  private registry = inject(BuilderRegistryService);

  readonly node = input.required<ComponentSchema>();
  
  hasDescriptor = false;

  ngOnInit() {
    this.hasDescriptor = !!this.registry.getByType(this.node().type);
  }

  get isLayoutNode(): boolean {
    const node = this.node();
    return 'components' in node && Array.isArray((node as LayoutComponentSchema).components);
  }

  getChildren(): ComponentSchema[] {
    const node = this.node();
    return 'components' in node ? (node as LayoutComponentSchema).components : [];
  }
}
