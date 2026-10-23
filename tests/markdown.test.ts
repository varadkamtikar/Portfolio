// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { renderMarkdown } from '../src/lib/markdown';
import { readSSE } from '../src/lib/sse';

describe('renderMarkdown', () => {
  it('renders paragraphs, bold, italics, code and lists', () => {
    expect(renderMarkdown('Hello **world** and *you* with `x`.')).toBe('<p>Hello <strong>world</strong> and <em>you</em> with <code>x</code>.</p>');
    expect(renderMarkdown('- a\n- b')).toBe('<ul><li>a</li><li>b</li></ul>');
    expect(renderMarkdown('one\n\ntwo')).toBe('<p>one</p><p>two</p>');
  });
  it('escapes raw HTML', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)> <script>alert(1)</script>');
    expect(html).not.toContain('<img');
    expect(html).not.toContain('<script');
    expect(html).toContain('&lt;img');
  });
  it('keeps safe links and strips dangerous ones', () => {
    expect(renderMarkdown('[repo](https://github.com/varadkamtikar)')).toContain('href="https://github.com/varadkamtikar" target="_blank" rel="noopener noreferrer"');
    expect(renderMarkdown('[p](/projects/eeg-signal-classification)')).toContain('<a href="/projects/eeg-signal-classification">p</a>');
    for (const bad of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', 'data:text/html,x', '//evil.com', 'vbscript:x']) {
      expect(renderMarkdown(`[x](${bad})`)).not.toContain('<a ');
    }
  });
  it('cannot break out of an attribute', () => {
    const div = document.createElement('div');
    div.innerHTML = renderMarkdown('[x](https://a.com/"onmouseover="alert(1))');
    const a = div.querySelector('a')!;
    expect([...a.attributes].map((x) => x.name).sort()).toEqual(['href', 'rel', 'target']);
    expect(div.querySelectorAll('*')).toHaveLength(2); // <p> and <a> only
  });
  it('autolinks bare URLs', () => {
    expect(renderMarkdown('See https://example.com/a.')).toContain('<a href="https://example.com/a"');
  });
  it('does not interpret markdown inside code spans', () => {
    expect(renderMarkdown('`**x**`')).toBe('<p><code>**x**</code></p>');
  });
});

describe('readSSE', () => {
  const stream = (chunks: string[]) => new ReadableStream<Uint8Array>({ start(c) { chunks.forEach((x) => c.enqueue(new TextEncoder().encode(x))); c.close(); } });
  it('parses events split across chunk boundaries', async () => {
    const out = [];
    for await (const e of readSSE(stream(['event: token\ndata: "Hel', 'lo"\n\nevent: done\ndata: {}\n\n']))) out.push(e);
    expect(out).toEqual([{ event: 'token', data: 'Hello' }, { event: 'done', data: {} }]);
  });
  it('skips malformed events', async () => {
    const out = [];
    for await (const e of readSSE(stream(['event: token\ndata: {nope\n\nevent: done\ndata: {}\n\n']))) out.push(e);
    expect(out).toEqual([{ event: 'done', data: {} }]);
  });
});
