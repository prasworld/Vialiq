import { CommonModule } from '@angular/common';
import { TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import {
  BUILDER_COMPONENTS,
  FormBuilderComponent,
  TEXT_INPUT_DESCRIPTOR,
} from '@vialiq/form-builder';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RemoteEntry, STUDY_DESCRIPTORS } from './entry';
import { remoteRoutes } from './entry.routes';

describe('RemoteEntry & STUDY_DESCRIPTORS contract', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('exports STUDY_DESCRIPTORS manifest with TEXT_INPUT_DESCRIPTOR', () => {
    expect(Array.isArray(STUDY_DESCRIPTORS)).toBe(true);
    expect(STUDY_DESCRIPTORS).toHaveLength(1);
    expect(STUDY_DESCRIPTORS).toContain(TEXT_INPUT_DESCRIPTOR);
    expect(STUDY_DESCRIPTORS[0].type).toBe(TEXT_INPUT_DESCRIPTOR.type);
  });

  it('exposes RemoteEntry on the default remote route', () => {
    expect(remoteRoutes).toEqual([{ path: '', component: RemoteEntry }]);
  });

  it('provides STUDY_DESCRIPTORS via BUILDER_COMPONENTS to the hosted FormBuilderComponent', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    await TestBed.configureTestingModule({
      imports: [RemoteEntry],
    })
      .overrideComponent(FormBuilderComponent, {
        set: {
          imports: [CommonModule],
        },
      })
      .compileComponents();

    const fixture = TestBed.createComponent(RemoteEntry);
    fixture.detectChanges();

    const builderEl = fixture.debugElement.query(By.directive(FormBuilderComponent));
    expect(builderEl).not.toBeNull();

    const providedGroups = builderEl.injector.get(BUILDER_COMPONENTS);
    expect(providedGroups).toContain(STUDY_DESCRIPTORS);

    const builder = builderEl.componentInstance as FormBuilderComponent;
    expect(builder.registry.getByType(TEXT_INPUT_DESCRIPTOR.type)).toBe(
      TEXT_INPUT_DESCRIPTOR,
    );

    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});
