// @vitest-environment jsdom
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { initExplorer } from '../src/scripts/explorer';

const built = existsSync('dist/index.html');

// Needs `astro build` first; skipped otherwise.
describe.skipIf(!built)('explorer wiring against the built page', () => {
  beforeAll(() => {
    const html = readFileSync('dist/index.html', 'utf8');
    document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/)![1].replace(/<script[\s\S]*?<\/script>/g, '');
    initExplorer();
  });
  const visible = () => [...document.querySelectorAll<HTMLElement>('.bento .card')].filter((c) => !c.hidden).map((c) => c.dataset.id);
  const click = (sel: string) => (document.querySelector(sel) as HTMLElement).click();

  it('defaults to Data Science order with EEG as the lead card', () => {
    expect(visible()[0]).toBe('eeg-signal-classification');
    expect(document.querySelector('.bento .card')!.classList.contains('slot-lead')).toBe(true);
    expect(visible()).toHaveLength(7);
  });
  it('switches to Data Analytics and reorders', () => {
    click('[data-role="da"]');
    expect(visible()[0]).toBe('ireland-housing-intelligence');
    expect(document.querySelector('[data-role="da"]')!.getAttribute('aria-pressed')).toBe('true');
    expect(document.querySelector('[data-skill="Tableau"]')!.classList.contains('rel')).toBe(true);
    expect(document.querySelector('[data-skill="PyTorch"]')!.classList.contains('rel')).toBe(false);
  });
  it('filters by skill, honours aliases, and clears', () => {
    click('[data-skill="RNN/LSTM"]');
    expect(visible()).toEqual(['indian-stock-market-predictor']);
    expect(document.getElementById('filter-status')!.hidden).toBe(false);
    click('#filter-status button');
    expect(visible()).toHaveLength(7);
  });
  it('shows an empty note when no project uses the skill', () => {
    click('[data-skill="Pandas"]');
    expect(visible()).toEqual([]);
    expect(document.getElementById('empty')!.hidden).toBe(false);
    click('[data-skill="Pandas"]');
    expect(document.getElementById('empty')!.hidden).toBe(true);
  });
});
