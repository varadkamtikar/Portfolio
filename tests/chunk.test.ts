import { describe, it, expect } from 'vitest';
import { packUnits, wordCount, buildChunks } from '../src/lib/kb';
import { loadContent } from '../src/lib/kb-node';

const words = (n: number, w = 'word') => Array.from({ length: n }, () => w).join(' ');

describe('packUnits', () => {
  it('packs short units together up to the max', () => {
    const out = packUnits([words(100), words(100), words(100), words(100)], 150, 300);
    expect(out.map(wordCount)).toEqual([300, 100]);
  });
  it('merges a short tail back when it fits', () => {
    const out = packUnits([words(200), words(50)], 150, 300);
    expect(out).toHaveLength(1);
  });
  it('splits an oversized unit at sentence boundaries', () => {
    const long = Array.from({ length: 12 }, (_, i) => `${words(40)} end${i}.`).join(' ');
    const out = packUnits([long], 150, 300);
    expect(out.length).toBeGreaterThan(1);
    out.forEach((c) => expect(wordCount(c)).toBeLessThanOrEqual(300));
  });
  it('hard-splits a single sentence longer than the max', () => {
    const out = packUnits([words(700)], 150, 300);
    out.forEach((c) => expect(wordCount(c)).toBeLessThanOrEqual(300));
    expect(out.reduce((n, c) => n + wordCount(c), 0)).toBe(700);
  });
  it('ignores empty units', () => {
    expect(packUnits(['', '  '])).toEqual([]);
  });
});

describe('buildChunks on the real content', () => {
  const chunks = buildChunks(loadContent());
  it('produces chunks within the word limit, with metadata and unique ids', () => {
    expect(chunks.length).toBeGreaterThan(10);
    expect(new Set(chunks.map((c) => c.id)).size).toBe(chunks.length);
    for (const c of chunks) {
      expect(wordCount(c.text)).toBeLessThanOrEqual(300);
      expect(c.source && c.section && c.title && c.url).toBeTruthy();
    }
  });
  it('covers every project and never ingests placeholders', () => {
    expect(chunks.filter((c) => c.source.startsWith('project-'))).toHaveLength(7);
    expect(chunks.some((c) => /\[(PLACEHOLDER|METRICS TBD)/i.test(c.text))).toBe(false);
  });
});
