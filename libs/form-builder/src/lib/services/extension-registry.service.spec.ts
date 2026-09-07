import { TestBed, fakeAsync, tick, flush } from '@angular/core/testing';
import { ExtensionRegistryService } from './extension-registry.service';
import { BuilderStateService } from './builder-state.service';
import { EXTENSION_PROVIDERS } from '../tokens/extension.token';
import { of, throwError } from 'rxjs';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { signal, Injector, runInInjectionContext } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { firstValueFrom, filter } from 'rxjs';

describe('ExtensionRegistryService', () => {
  const waitForResource = async (service: ExtensionRegistryService) => {
    // Because we are not in a component, we need to trigger effects manually
    TestBed.flushEffects();
    // Wait for the resource to finish loading
    await new Promise(resolve => setTimeout(resolve, 0));
    TestBed.flushEffects();
  };

  it('returns empty array if no contextId', async () => {
    const mockState = { contextId: signal(null) };
    TestBed.configureTestingModule({
      providers: [
        ExtensionRegistryService,
        { provide: BuilderStateService, useValue: mockState }
      ]
    });
    
    const service = TestBed.inject(ExtensionRegistryService);
    await waitForResource(service);
    expect(service.extensions.value()).toEqual([]);
  });

  it('returns empty array if no providers', async () => {
    const mockState = { contextId: signal('ctx-1') };
    TestBed.configureTestingModule({
      providers: [
        ExtensionRegistryService,
        { provide: BuilderStateService, useValue: mockState }
      ]
    });
    
    const service = TestBed.inject(ExtensionRegistryService);
    await waitForResource(service);
    expect(service.extensions.value()).toEqual([]);
  });

  it('collects extensions from array, promise, and observable providers and sorts by weight', async () => {
    const mockState = { contextId: signal('ctx-1') };
    
    const provider1 = { getExtensions: () => [{ id: 'ext1', name: 'Ext 1', type: 'text', weight: 20 }] };
    const provider2 = { getExtensions: () => Promise.resolve([{ id: 'ext2', name: 'Ext 2', type: 'text', weight: 10 }]) };
    const provider3 = { getExtensions: () => of([{ id: 'ext3', name: 'Ext 3', type: 'text', weight: undefined }]) }; // undefined weight -> 0
    
    TestBed.configureTestingModule({
      providers: [
        ExtensionRegistryService,
        { provide: BuilderStateService, useValue: mockState },
        { provide: EXTENSION_PROVIDERS, useValue: provider1, multi: true },
        { provide: EXTENSION_PROVIDERS, useValue: provider2, multi: true },
        { provide: EXTENSION_PROVIDERS, useValue: provider3, multi: true }
      ]
    });
    
    const service = TestBed.inject(ExtensionRegistryService);
    await waitForResource(service);
    
    const value = service.extensions.value();
    // Ordered by weight: undefined(0) -> 10 -> 20
    expect(value).toHaveLength(3);
    expect(value![0].id).toBe('ext3');
    expect(value![1].id).toBe('ext2');
    expect(value![2].id).toBe('ext1');
  });

  it('handles provider errors gracefully', async () => {
    const mockState = { contextId: signal('ctx-1') };
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    const provider1 = { getExtensions: () => [{ id: 'ext1', name: 'Ext 1', type: 'text' }] };
    const providerErr = { getExtensions: () => { throw new Error('Sync error'); } };
    const providerErrAsync = { getExtensions: () => Promise.reject(new Error('Async error')) };
    const providerErrObs = { getExtensions: () => throwError(() => new Error('Obs error')) };
    
    TestBed.configureTestingModule({
      providers: [
        ExtensionRegistryService,
        { provide: BuilderStateService, useValue: mockState },
        { provide: EXTENSION_PROVIDERS, useValue: provider1, multi: true },
        { provide: EXTENSION_PROVIDERS, useValue: providerErr, multi: true },
        { provide: EXTENSION_PROVIDERS, useValue: providerErrAsync, multi: true },
        { provide: EXTENSION_PROVIDERS, useValue: providerErrObs, multi: true }
      ]
    });
    
    const service = TestBed.inject(ExtensionRegistryService);
    await waitForResource(service);
    
    const value = service.extensions.value();
    
    // Only provider1 succeeds
    expect(value).toHaveLength(1);
    expect(value![0].id).toBe('ext1');
    expect(errSpy).toHaveBeenCalledTimes(3);
    
    errSpy.mockRestore();
  });
});
