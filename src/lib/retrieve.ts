// BM25 keyword retrieval over KB chunks. No external services or keys.
import type { Chunk } from './kb';

const STOP = new Set(('a an the is are was were be been of to in on for and or do does did you your yours have has had what which who whom how tell me about with his he him she her it its this that these those can could would should i my we our their there at by from as not no so if any some all also please varad varadkrishna kamtikar s').split(' '));

export function tokenize(text: string): string[] {
  return text.toLowerCase().replace(/['’]s\b/g, '').split(/[^a-z0-9]+/).filter((t) => t && !STOP.has(t)).map(stem);
}

function stem(t: string): string {
  if (t.length > 6 && t.endsWith('ing')) return t.slice(0, -3);
  if (t.length > 5 && t.endsWith('ed')) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith('s') && !t.endsWith('ss')) return t.slice(0, -1);
  return t;
}

export interface Index { chunks: Chunk[]; tf: Map<string, number>[]; len: number[]; df: Map<string, number>; avg: number }

export function buildIndex(chunks: Chunk[]): Index {
  const tf: Map<string, number>[] = [], len: number[] = [], df = new Map<string, number>();
  for (const c of chunks) {
    // title and section count twice so a project's own name outranks passing mentions
    const toks = tokenize(`${c.title} ${c.section} ${c.title} ${c.text}`);
    const m = new Map<string, number>();
    toks.forEach((t) => m.set(t, (m.get(t) ?? 0) + 1));
    m.forEach((_, t) => df.set(t, (df.get(t) ?? 0) + 1));
    tf.push(m); len.push(toks.length);
  }
  return { chunks, tf, len, df, avg: len.reduce((a, b) => a + b, 0) / Math.max(len.length, 1) };
}

export function search(ix: Index, query: string, k = 6, k1 = 1.5, b = 0.75): Chunk[] {
  const q = [...new Set(tokenize(query))];
  const N = ix.chunks.length;
  return ix.chunks
    .map((chunk, i) => {
      let score = 0;
      for (const t of q) {
        const f = ix.tf[i].get(t);
        if (!f) continue;
        const n = ix.df.get(t) ?? 0;
        const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
        score += idf * ((f * (k1 + 1)) / (f + k1 * (1 - b + (b * ix.len[i]) / ix.avg)));
      }
      return { chunk, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b2) => b2.score - a.score)
    .slice(0, k)
    .map((r) => r.chunk);
}
