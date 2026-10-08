import { describe, it, expect } from 'vitest';
import { escapeHtmlAttr } from './html.util';

describe('HTML Utility - XSS Prevention', () => {
  it('should escape malicious script tags', () => {
    const input = '<script>alert("XSS")</script>';
    const output = escapeHtmlAttr(input);
    expect(output).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;/script&gt;');
  });

  it('should escape quote characters to prevent attribute injection', () => {
    const input = 'value" onload="alert(1)';
    const output = escapeHtmlAttr(input);
    expect(output).toBe('value&quot; onload=&quot;alert(1)');
  });

  it('should escape ampersands to prevent entity injection', () => {
    const input = 'foo & bar';
    const output = escapeHtmlAttr(input);
    expect(output).toBe('foo &amp; bar');
  });

  it('should handle null or undefined safely if passed', () => {
    expect(escapeHtmlAttr(null as unknown as string)).toBe('');
    expect(escapeHtmlAttr(undefined as unknown as string)).toBe('');
  });

  it('should leave safe text unchanged', () => {
    const input = 'Safe Text 123';
    expect(escapeHtmlAttr(input)).toBe('Safe Text 123');
  });
});
