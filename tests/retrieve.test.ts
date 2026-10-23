import { describe, it, expect } from 'vitest';
import { buildIndex, search, tokenize } from '../src/lib/retrieve';
import type { Chunk } from '../src/lib/kb';

const mk = (id: string, title: string, text: string): Chunk => ({ id, source: id, section: 'S', title, url: `/${id}`, text });
const ix = buildIndex([
  mk('a', 'Weather Hub', 'Forecasts rainfall with XGBoost and PostgreSQL.'),
  mk('b', 'Stock Predictor', 'LSTM forecasting of NSE prices.'),
  mk('c', 'About', 'Varad likes data. Python and SQL.'),
]);

describe('tokenize', () => {
  it('lowercases, drops stopwords and applies light stemming', () => {
    expect(tokenize("What are Varad's forecasting projects?")).toEqual(['forecast', 'project']);
  });
});

describe('search', () => {
  it('ranks the matching chunk first', () => {
    expect(search(ix, 'rainfall forecast')[0].id).toBe('a');
    expect(search(ix, 'LSTM')[0].id).toBe('b');
  });
  it('matches stemmed variants', () => {
    expect(search(ix, 'forecasts')[0].id).toBeDefined();
    expect(search(ix, 'forecasting').map((c) => c.id)).toContain('a');
  });
  it('boosts title matches', () => {
    expect(search(ix, 'weather hub')[0].id).toBe('a');
  });
  it('returns nothing for unmatched or stopword-only queries', () => {
    expect(search(ix, 'quantum entanglement')).toEqual([]);
    expect(search(ix, 'what is the')).toEqual([]);
  });
  it('respects k', () => {
    expect(search(ix, 'python forecasting data', 1)).toHaveLength(1);
  });
});
