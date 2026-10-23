import { describe, it, expect } from 'vitest';
import { arrange, matchesSkill, slot, type CardMeta } from '../src/lib/explorer';

const cards: CardMeta[] = [
  { id: 'eeg', rank: { ds: 1, da: 4 }, stack: ['Python', 'XGBoost', 'SMOTE'] },
  { id: 'housing', rank: { ds: 4, da: 1 }, stack: ['Python', 'PostgreSQL', 'Plotly'] },
  { id: 'netflix', rank: { ds: 6, da: 2 }, stack: ['Tableau'] },
  { id: 'stock', rank: { ds: 3, da: 5 }, stack: ['Python', 'LSTM', 'TensorFlow'] },
];

describe('matchesSkill', () => {
  it('is case-insensitive and supports aliases', () => {
    expect(matchesSkill(['LSTM'], ['RNN/LSTM', 'LSTM'])).toBe(true);
    expect(matchesSkill(['python'], ['Python'])).toBe(true);
    expect(matchesSkill(['Tableau'], ['Python'])).toBe(false);
  });
});

describe('arrange', () => {
  it('orders by data science rank', () => {
    expect(arrange(cards, 'ds', null).map((c) => c.id)).toEqual(['eeg', 'stock', 'housing', 'netflix']);
  });
  it('orders by data analytics rank', () => {
    expect(arrange(cards, 'da', null).map((c) => c.id)).toEqual(['housing', 'netflix', 'eeg', 'stock']);
  });
  it('filters by skill and keeps role order', () => {
    expect(arrange(cards, 'da', ['Python']).map((c) => c.id)).toEqual(['housing', 'eeg', 'stock']);
  });
  it('returns nothing when no project uses the skill', () => {
    expect(arrange(cards, 'ds', ['Pandas'])).toEqual([]);
  });
  it('does not mutate its input', () => {
    const before = cards.map((c) => c.id);
    arrange(cards, 'da', null);
    expect(cards.map((c) => c.id)).toEqual(before);
  });
});

describe('slot', () => {
  it('maps position to bento slot', () => {
    expect([0, 1, 2, 3, 4].map(slot)).toEqual(['lead', 'side', 'side', 'half', 'half']);
  });
});
