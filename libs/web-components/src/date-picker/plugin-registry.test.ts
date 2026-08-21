import { describe, it, expect } from 'vitest';
import { loadModePlugin } from './plugin-registry.js';

describe('plugin-registry', () => {
  it('returns null for "date" mode', async () => {
    expect(await loadModePlugin('date')).toBeNull();
  });

  it('returns null for "range" mode', async () => {
    expect(await loadModePlugin('range')).toBeNull();
  });

  it('returns a wrapper for "month" mode', async () => {
    const plugin = await loadModePlugin('month');
    expect(plugin).not.toBeNull();
    expect(plugin?.id).toBe('vi-month-select');
    expect(typeof plugin?.factory).toBe('function');
  });

  it('returns a wrapper for "week" mode', async () => {
    const plugin = await loadModePlugin('week');
    expect(plugin).not.toBeNull();
    expect(plugin?.id).toBe('vi-week-select');
    expect(typeof plugin?.factory).toBe('function');
  });
  
  it('returns a wrapper for "year" mode', async () => {
    const plugin = await loadModePlugin('year');
    expect(plugin).not.toBeNull();
    expect(plugin?.id).toBe('vi-year-select');
    expect(typeof plugin?.factory).toBe('function');
  });
});
