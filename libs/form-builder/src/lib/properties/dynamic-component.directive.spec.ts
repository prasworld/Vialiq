import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input, Output, EventEmitter, signal, output } from '@angular/core';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { DynamicComponentDirective } from './dynamic-component.directive';

// Dummy component to instantiate dynamically
@Component({
  selector: 'vi-test-dynamic',
  standalone: true,
  template: `<div class="test-comp">{{ testInput }}</div>`
})
class TestDynamicComponent {
  @Input() testInput = '';
  @Output() testOutput = new EventEmitter<string>();
  @Output('aliasedOutput') actualOutput = new EventEmitter<number>();
  newOutput = output<boolean>();
}

// Host component to use the directive
@Component({
  standalone: true,
  imports: [DynamicComponentDirective],
  template: `
    <ng-container
      [dynamicComponent]="compType()"
      [inputs]="dynamicInputs()"
      [outputs]="dynamicOutputs()"
      [attributes]="dynamicAttributes()">
    </ng-container>
  `
})
class TestHostComponent {
  compType = signal<any>(TestDynamicComponent);
  dynamicInputs = signal<Record<string, unknown>>({});
  dynamicOutputs = signal<Record<string, (event: any) => void>>({});
  dynamicAttributes = signal<Record<string, any>>({});
}

describe('DynamicComponentDirective', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let hostComponent: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent, TestDynamicComponent]
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TestHostComponent);
    hostComponent = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should instantiate the dynamic component', () => {
    const el = fixture.nativeElement.querySelector('.test-comp');
    expect(el).toBeTruthy();
  });

  it('should remove the component if type is set to null', () => {
    hostComponent.compType.set(null);
    fixture.detectChanges();
    
    const el = fixture.nativeElement.querySelector('.test-comp');
    expect(el).toBeFalsy();
  });

  it('should pass inputs to the dynamic component', () => {
    hostComponent.dynamicInputs.set({ testInput: 'Hello World' });
    fixture.detectChanges();
    
    const el = fixture.nativeElement.querySelector('.test-comp');
    expect(el.textContent).toContain('Hello World');
  });

  it('should bind to outputs on the dynamic component', () => {
    const outputSpy = vi.fn();
    hostComponent.dynamicOutputs.set({ testOutput: outputSpy });
    fixture.detectChanges();
    
    // Find the instantiated component via debugElement or ViewContainerRef?
    // Let's just grab the actual component instance if we can, or we can just trigger the output from the template...
    // Actually, we don't have easy access to the instance here. Let's just create a test component instance and emit.
    // We can query the directive instance or the component instance.
    
    // Let's get the component instance from the view
    // Since it's projected as a sibling to ng-container
    const debugEl = fixture.debugElement.childNodes.find(node => node.nativeNode && node.nativeNode.nodeType === 1);
    const dynamicInstance = debugEl?.componentInstance as TestDynamicComponent;
    
    expect(dynamicInstance).toBeTruthy();
    
    dynamicInstance.testOutput.emit('output-value');
    expect(outputSpy).toHaveBeenCalledWith('output-value');
  });

  it('should bind to aliased outputs on the dynamic component', () => {
    const outputSpy = vi.fn();
    hostComponent.dynamicOutputs.set({ aliasedOutput: outputSpy });
    fixture.detectChanges();
    
    const debugEl = fixture.debugElement.childNodes.find(node => node.nativeNode && node.nativeNode.nodeType === 1);
    const dynamicInstance = debugEl?.componentInstance as TestDynamicComponent;
    
    dynamicInstance.actualOutput.emit(42);
    expect(outputSpy).toHaveBeenCalledWith(42);
  });

  it('should set attributes on the host element of the dynamic component', () => {
    hostComponent.dynamicAttributes.set({ 
      'data-testid': 'custom-id',
      'aria-hidden': true,
      'disabled': false, // Should remove disabled
      'class': 'extra-class'
    });
    fixture.detectChanges();
    
    const el = fixture.nativeElement.querySelector('vi-test-dynamic');
    expect(el).toBeTruthy();
    
    expect(el.getAttribute('data-testid')).toBe('custom-id');
    expect(el.getAttribute('aria-hidden')).toBe(''); // true becomes ''
    expect(el.hasAttribute('disabled')).toBe(false);
    expect(el.classList.contains('extra-class')).toBe(true);
  });

  it('should bind to new output() references on the dynamic component', () => {
    const outputSpy = vi.fn();
    hostComponent.dynamicOutputs.set({ newOutput: outputSpy });
    fixture.detectChanges();
    
    const debugEl = fixture.debugElement.childNodes.find(node => node.nativeNode && node.nativeNode.nodeType === 1);
    const dynamicInstance = debugEl?.componentInstance as TestDynamicComponent;
    
    // Using Angular's new output(), we call emit directly
    dynamicInstance.newOutput.emit(true);
    expect(outputSpy).toHaveBeenCalledWith(true);
  });
});
