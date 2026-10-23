import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { buildChunks } from '../src/lib/kb';
import { loadContent } from '../src/lib/kb-node';
import { buildIndex, search } from '../src/lib/retrieve';

// Retrieval-level check: for each question the top-6 context must contain the expected facts
// and the expected source. (Answer-level checks need a live model.)
const qa: { q: string; expect: string[]; source: string }[] = JSON.parse(readFileSync('tests/qa.json', 'utf8'));
const ix = buildIndex(buildChunks(loadContent()));

describe('QA set: retrieval', () => {
  it.each(qa)('$q', ({ q, expect: facts, source }) => {
    const top = search(ix, q, 6);
    const text = top.map((c) => c.text).join('\n');
    expect(top.map((c) => c.source)).toContain(source);
    for (const f of facts) expect(text).toContain(f);
  });
  it('has 15 questions', () => expect(qa).toHaveLength(15));
});
