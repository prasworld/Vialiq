import { TestBed } from '@angular/core/testing';
import {
  EXTENSION_PROVIDERS,
  type ExtensionFieldDefinition,
  type ExtensionProvider,
} from '@vialiq/form-builder';
import { firstValueFrom, isObservable, type Observable } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { appConfig } from './app.config';

async function resolveProviderExtensions(
  result:
    | ExtensionFieldDefinition[]
    | Promise<ExtensionFieldDefinition[]>
    | Observable<ExtensionFieldDefinition[]>,
): Promise<ExtensionFieldDefinition[]> {
  if (isObservable(result)) {
    return firstValueFrom(result);
  }
  return result;
}

function getRegisteredProvider(): ExtensionProvider {
  TestBed.configureTestingModule({
    providers: [...appConfig.providers],
  });
  const providers = TestBed.inject(EXTENSION_PROVIDERS);
  expect(providers).toHaveLength(1);
  return providers[0];
}

describe('remote1 appConfig EXTENSION_PROVIDERS', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('registers the asynchronous extension provider via EXTENSION_PROVIDERS', () => {
    const provider = getRegisteredProvider();
    expect(typeof provider.getExtensions).toBe('function');
  });

  it('resolves CDISC and patient metadata extensions asynchronously for default-context', async () => {
    vi.useFakeTimers();
    const provider = getRegisteredProvider();

    let settled = false;
    const pending = resolveProviderExtensions(
      provider.getExtensions('default-context'),
    ).then((items) => {
      settled = true;
      return items;
    });

    await vi.advanceTimersByTimeAsync(499);
    expect(settled).toBe(false);

    await vi.advanceTimersByTimeAsync(1);
    expect(settled).toBe(true);

    const extensions = await pending;
    expect(extensions.map((ext) => ext.key)).toEqual([
      'cdiscOid',
      'sdtmDomain',
      'isEpro',
    ]);
    expect(extensions).toEqual([
      {
        key: 'cdiscOid',
        label: 'CDISC OID',
        type: 'text',
        section: 'CDISC Metadata',
        weight: 10,
        description: 'Unique identifier for CDISC ODM exports.',
        requiredTraits: ['isInput'],
      },
      {
        key: 'sdtmDomain',
        label: 'SDTM Domain',
        type: 'select',
        section: 'CDISC Metadata',
        weight: 20,
        options: [
          { label: 'Demographics (DM)', value: 'DM' },
          { label: 'Vital Signs (VS)', value: 'VS' },
          { label: 'Adverse Events (AE)', value: 'AE' },
        ],
        requiredTraits: ['isInput'],
      },
      {
        key: 'isEpro',
        label: 'ePRO Field',
        type: 'boolean',
        section: 'Patient Settings',
        weight: 5,
        requiredTraits: ['isInput'],
      },
    ]);
  });

  it('returns an empty list for non-matching contextIds', async () => {
    vi.useFakeTimers();
    const provider = getRegisteredProvider();

    const pending = resolveProviderExtensions(
      provider.getExtensions('other-study-context'),
    );

    await vi.advanceTimersByTimeAsync(500);
    await expect(pending).resolves.toEqual([]);
  });
});
