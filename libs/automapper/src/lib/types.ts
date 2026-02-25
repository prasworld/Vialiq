// shared basic types used across the library

/**
 * A class constructor type used throughout the mapper API for references
 * to source/destination types.  `new (...args: any[]) => T` allows
 * us to create an instance or inspect `name` at runtime.
 */
export type Constructor<T> = new (...args: any[]) => T;
