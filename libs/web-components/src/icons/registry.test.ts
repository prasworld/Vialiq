import { expect } from '@wdio/globals';
import { registerIcons, getIcon } from './registry.js';

describe('Icon Registry', () => {
  it('registers and retrieves a valid SVG', () => {
    registerIcons({ name: 'valid-icon', data: '<svg>Content</svg>' });
    expect(getIcon('valid-icon')?.name).toBe('valid-icon');
  });

  it('throws an error if SVG does not start with <svg', () => {
    expect(() => {
      registerIcons({ name: 'invalid-start', data: '<div><svg></svg></div>' });
    }).toThrow(/must begin with an <svg> element/);
  });

  it('throws an error if SVG contains a <script> tag', () => {
    expect(() => {
      registerIcons({ name: 'xss-script', data: '<svg><script>alert("xss")</script></svg>' });
    }).toThrow(/must not contain <script> elements/);
  });

  it('throws an error if SVG contains inline event handlers', () => {
    expect(() => {
      registerIcons({ name: 'xss-event', data: '<svg onload="alert(1)"></svg>' });
    }).toThrow(/must not contain inline event handlers/);
  });
});
