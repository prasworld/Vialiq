export function deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): void {
  for (const key of Object.keys(source)) {
    const sourceValue = source[key];
    if (sourceValue && typeof sourceValue === 'object' && !Array.isArray(sourceValue)) {
      if (!target[key] || typeof target[key] !== 'object') {
        target[key] = {};
      }
      deepMerge(target[key] as Record<string, unknown>, sourceValue as Record<string, unknown>);
    } else {
      target[key] = sourceValue;
    }
  }
}
