/**
 * Fetch / Query adapter for @vi/automapper.
 *
 * Provides framework-agnostic helpers that wrap `fetch` (or any
 * async data-fetching function) and automatically map the JSON response
 * through a registered `MapperRegistry` profile.
 *
 * The helpers follow the established conventions of the two most popular
 * async data-fetching libraries so that consumers can drop them in with
 * zero friction:
 *
 * - **React Query** (`@tanstack/react-query`): pass the result of
 *   `createMappedQueryFn()` as `queryFn` inside `useQuery()`.
 * - **SWR**: pass the result of `createMappedSWRFetcher()` as the
 *   second argument to `useSWR()`.
 *
 * Neither `@tanstack/react-query` nor `swr` need to be installed for
 * this module to compile and work — the helpers are plain async functions
 * that happen to satisfy those libraries' `queryFn`/`fetcher` contracts.
 *
 * @example — React Query
 * const queryFn = createMappedQueryFn<UserResponse, UserDto>(mapper, 'UserDto');
 * useQuery({ queryKey: ['user', id], queryFn: () => queryFn(`/api/users/${id}`) });
 *
 * @example — SWR
 * const fetcher = createMappedSWRFetcher<UserResponse, UserDto>(mapper, 'UserDto');
 * useSWR('/api/users/1', fetcher);
 *
 * @example — standalone
 * const fetch = createMappedFetcher<UserResponse, UserDto>(mapper, 'UserDto');
 * const dto = await fetch('/api/users/1');
 */

import type { MapperRegistry } from '../core';
import type { Constructor } from '../types';

/**
 * Options accepted by all fetch adapter helpers.
 */
export interface FetchAdapterOptions {
  /**
   * Custom fetch implementation.  Defaults to the global `fetch`.
   * Inject a custom implementation for testing or server-side usage.
   *
   * In environments without a global `fetch` (older Node, some runtimes)
   * this **must** be provided; otherwise the adapter factory will throw.
   */
  fetchImpl?: typeof fetch;

  /**
   * Optional `RequestInit` merged into every request made by this adapter.
   * Per-call `init` overrides take precedence over these defaults.
   */
  requestInit?: RequestInit;
}

/**
 * A mapped fetcher function — fetches a URL, parses the JSON body,
 * and maps the response to `D | null` via the registered profile.
 */
export type MappedFetcher<D> = (url: string, init?: RequestInit) => Promise<D | null>;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Resolve and validate the fetch implementation.
 * Throws a descriptive error if no implementation is available so consumers
 * get actionable guidance rather than a cryptic "is not a function" crash.
 */
function resolveFetch(options?: FetchAdapterOptions): typeof fetch {
  const impl = options?.fetchImpl ?? globalThis.fetch;
  if (!impl) {
    throw new Error(
      '[automapper fetch-adapter] No fetch implementation is available. ' +
      'Pass options.fetchImpl or polyfill globalThis.fetch before creating a mapped fetcher.'
    );
  }
  return impl;
}

/**
 * Merge two `RequestInit` objects, correctly combining their `headers`
 * fields even when either side uses a `Headers` instance.  Fields in
 * `override` take precedence; headers from `override` are set on top of
 * (not replacing) headers from `base`.
 */
function mergeInit(
  base: RequestInit | undefined,
  override: RequestInit | undefined
): RequestInit {
  if (!base && !override) return {};
  if (!base) return { ...override };
  if (!override) return { ...base };

  // Normalise both header bags into a Headers instance so that spreading
  // a plain Headers object (which yields no own enumerable keys) doesn't
  // silently drop the entries.
  const merged = new Headers(base.headers);
  if (override.headers) {
    new Headers(override.headers).forEach((value, key) => {
      merged.set(key, value);
    });
  }

  return { ...base, ...override, headers: merged };
}

// ---------------------------------------------------------------------------

/**
 * Create a `MappedFetcher<D>` that fetches a URL and maps the response
 * JSON through the registered mapper profile for `destType`.
 *
 * The generic `S` is the raw JSON shape returned by the API.
 * The generic `D` is the destination DTO type.
 *
 * @param mapper    The `MapperRegistry` instance (from `createMapper()`).
 * @param destType  Constructor or string token registered as the destination.
 * @param options   Optional custom fetch implementation or default headers.
 *
 * @example
 * const fetcher = createMappedFetcher<UserApiResponse, UserDto>(mapper, 'UserDto');
 * const dto = await fetcher('/api/users/1');
 */
export function createMappedFetcher<S extends object, D>(
  mapper: MapperRegistry,
  destType: Constructor<D> | string,
  options?: FetchAdapterOptions
): MappedFetcher<D> {
  const fetchFn = resolveFetch(options);
  return async (url: string, init?: RequestInit): Promise<D | null> => {
    const response = await fetchFn(url, mergeInit(options?.requestInit, init));
    if (!response.ok) {
      throw new Error(`[automapper fetch-adapter] HTTP ${response.status} ${response.statusText} for ${url}`);
    }
    const json: S = await response.json() as S;
    const result = mapper.map<S, D>(json, destType);
    return result instanceof Promise ? result : result;
  };
}

/**
 * Create an array `MappedFetcher<D[]>` that fetches a URL, expects a
 * JSON array response, and maps each element through the mapper profile.
 *
 * @example
 * const fetcher = createMappedArrayFetcher<UserApiResponse, UserDto>(mapper, 'UserDto');
 * const dtos = await fetcher('/api/users');
 */
export function createMappedArrayFetcher<S extends object, D>(
  mapper: MapperRegistry,
  destType: Constructor<D> | string,
  options?: FetchAdapterOptions
): (url: string, init?: RequestInit) => Promise<Array<D | null>> {
  const fetchFn = resolveFetch(options);
  return async (url: string, init?: RequestInit): Promise<Array<D | null>> => {
    const response = await fetchFn(url, mergeInit(options?.requestInit, init));
    if (!response.ok) {
      throw new Error(`[automapper fetch-adapter] HTTP ${response.status} ${response.statusText} for ${url}`);
    }
    const json: S[] = await response.json() as S[];
    const result = mapper.mapArray<S, D>(json, destType);
    return result instanceof Promise ? result : result;
  };
}

/**
 * A **React Query**-compatible `queryFn` factory.
 *
 * Returns a function that:
 * 1. Accepts a URL string.
 * 2. Fetches the URL.
 * 3. Maps the response JSON to `D` via the mapper profile.
 *
 * Pass the returned function directly as `queryFn` in `useQuery()`.
 *
 * @example
 * const qFn = createMappedQueryFn<UserApiResponse, UserDto>(mapper, 'UserDto');
 *
 * // Inside a component:
 * const { data } = useQuery({ queryKey: ['user', id], queryFn: () => qFn(`/api/users/${id}`) });
 */
export function createMappedQueryFn<S extends object, D>(
  mapper: MapperRegistry,
  destType: Constructor<D> | string,
  options?: FetchAdapterOptions
): MappedFetcher<D> {
  // Intentionally identical to createMappedFetcher — React Query's queryFn is
  // just an async function that returns data.  Named separately for clarity
  // in consumer code.
  return createMappedFetcher<S, D>(mapper, destType, options);
}

/**
 * An **SWR**-compatible fetcher factory.
 *
 * SWR expects a fetcher that receives the key (URL string) and returns
 * a promise of the mapped data.  Pass the result to `useSWR()` as the
 * second argument.
 *
 * @example
 * const swrFetcher = createMappedSWRFetcher<UserApiResponse, UserDto>(mapper, 'UserDto');
 *
 * // Inside a component:
 * const { data } = useSWR('/api/users/1', swrFetcher);
 */
export function createMappedSWRFetcher<S extends object, D>(
  mapper: MapperRegistry,
  destType: Constructor<D> | string,
  options?: FetchAdapterOptions
): (key: string) => Promise<D | null> {
  const fetcher = createMappedFetcher<S, D>(mapper, destType, options);
  return (key: string) => fetcher(key);
}
