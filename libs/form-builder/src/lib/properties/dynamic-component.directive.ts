import {
  Directive,
  Injector,
  EnvironmentInjector,
  Type,
  ViewContainerRef,
  ComponentRef,
  Renderer2,
  effect,
  inject,
  input,
  output,
  signal,
  DestroyRef,
  reflectComponentType,
} from '@angular/core';
import { isObservable, Subscription } from 'rxjs';

export type DynamicInputs = Record<string, unknown>;
export type DynamicOutputs = Record<string, (event: unknown) => void>;
export type DynamicAttributes = Record<string, string | number | boolean | null | undefined>;

@Directive({
  selector: '[dynamicComponent]',
  standalone: true,
})
export class DynamicComponentDirective<T = unknown> {
  private readonly vcr = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
  private readonly defaultInjector = inject(Injector);
  private readonly defaultEnvInjector = inject(EnvironmentInjector);
  private readonly destroyRef = inject(DestroyRef);

  // 1. Signal Inputs
  readonly component = input<Type<T> | null | undefined>(null, {
    alias: 'dynamicComponent',
  });
  readonly inputs = input<DynamicInputs>({});
  readonly outputs = input<DynamicOutputs>({});
  readonly attributes = input<DynamicAttributes>({});
  readonly projectableNodes = input<Node[][] | undefined>(undefined, {
    alias: 'dynamicComponentNodes',
  });

  // Injector Overrides
  readonly injector = input<Injector | undefined>(undefined, {
    alias: 'dynamicComponentInjector',
  });
  readonly environmentInjector = input<EnvironmentInjector | undefined>(undefined, {
    alias: 'dynamicComponentEnvInjector',
  });

  // 2. Signal Outputs
  readonly componentCreated = output<ComponentRef<T>>();
  readonly componentDestroyed = output<void>();

  // Internal Reactive State
  private readonly activeComponentRef = signal<ComponentRef<T> | null>(null);
  private outputSubscriptions = new Subscription();

  constructor() {
    // Effect 1: Lifecycle & Instantiation (Tracks component, injectors, projectableNodes)
    effect((onCleanup) => {
      const compType = this.component();
      const customInj = this.injector();
      const customEnvInj = this.environmentInjector();
      const nodes = this.projectableNodes();

      this.vcr.clear();

      if (!compType) {
        this.activeComponentRef.set(null);
        return;
      }

      const ref = this.vcr.createComponent(compType, {
        injector: customInj ?? this.defaultInjector,
        environmentInjector: customEnvInj ?? this.defaultEnvInjector,
        projectableNodes: nodes,
      });

      this.activeComponentRef.set(ref);
      this.componentCreated.emit(ref);

      onCleanup(() => {
        this.componentDestroyed.emit();
        ref.destroy();
      });
    });

    // Effect 2: Dynamic Inputs Sync
    effect(() => {
      const ref = this.activeComponentRef();
      const currentInputs = this.inputs();

      if (!ref) return;

      for (const [key, value] of Object.entries(currentInputs)) {
        ref.setInput(key, value);
      }
    });

    // Effect 3: Dynamic Outputs Sync with Alias Resolution
    effect((onCleanup) => {
      const ref = this.activeComponentRef();
      const currentOutputs = this.outputs();
      const compType = this.component();

      this.outputSubscriptions.unsubscribe();
      this.outputSubscriptions = new Subscription();

      if (ref && compType && currentOutputs) {
        this.bindOutputs(ref.instance, compType, currentOutputs);
      }

      onCleanup(() => {
        this.outputSubscriptions.unsubscribe();
      });
    });

    // Effect 4: Dynamic Attributes & Safe Class/Style Sync
    effect((onCleanup) => {
      const ref = this.activeComponentRef();
      const currentAttrs = this.attributes();

      if (!ref || !currentAttrs) return;

      const hostElement = ref.location.nativeElement;
      const appliedAttrs: string[] = [];
      const appliedClasses: string[] = [];

      for (const [attrName, val] of Object.entries(currentAttrs)) {
        if (val === null || val === undefined || val === false) {
          if (attrName === 'class') {
            // Handled separately
          } else {
            this.renderer.removeAttribute(hostElement, attrName);
          }
          continue;
        }

        if (attrName === 'class') {
          const classNames = String(val).split(' ').filter(Boolean);
          classNames.forEach((cls) => {
            this.renderer.addClass(hostElement, cls);
            appliedClasses.push(cls);
          });
        } else {
          const formattedVal = val === true ? '' : String(val);
          this.renderer.setAttribute(hostElement, attrName, formattedVal);
          appliedAttrs.push(attrName);
        }
      }

      onCleanup(() => {
        appliedAttrs.forEach((attr) => this.renderer.removeAttribute(hostElement, attr));
        appliedClasses.forEach((cls) => this.renderer.removeClass(hostElement, cls));
      });
    });

    this.destroyRef.onDestroy(() => {
      this.outputSubscriptions.unsubscribe();
      this.vcr.clear();
    });
  }

  private bindOutputs(
    instance: unknown,
    componentType: Type<unknown>,
    outputs: DynamicOutputs
  ): void {
    const recordInstance = instance as Record<string, unknown>;
    const mirror = reflectComponentType(componentType);
    
    // Map alias -> propertyName (e.g. { 'customClick': 'clickEvent' })
    const outputMap = new Map<string, string>();
    if (mirror) {
      for (const out of mirror.outputs) {
        outputMap.set(out.templateName, out.propName);
      }
    }

    for (const [outputKey, handler] of Object.entries(outputs)) {
      if (typeof handler !== 'function') continue;

      // Check alias first, fallback to direct prop name
      const actualPropName = outputMap.get(outputKey) ?? outputKey;
      const emitter = recordInstance[actualPropName];

      if (!emitter) continue;

      if (isObservable(emitter)) {
        this.outputSubscriptions.add(
          emitter.subscribe((event: unknown) => handler(event))
        );
      } else if (
        typeof emitter === 'object' &&
        'subscribe' in emitter &&
        typeof (emitter as { subscribe: Function }).subscribe === 'function'
      ) {
        const sub = (
          emitter as {
            subscribe: (fn: (e: unknown) => void) => { unsubscribe: () => void };
          }
        ).subscribe((event: unknown) => handler(event));

        this.outputSubscriptions.add(() => sub.unsubscribe());
      }
    }
  }
}
