// @vitest-environment jsdom
import { describe, it, expect, beforeAll, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { initChat } from '../src/scripts/chat';

const built = existsSync('dist/index.html');
const sse = (events: [string, unknown][]) =>
  new Response(events.map(([e, d]) => `event: ${e}\ndata: ${JSON.stringify(d)}\n\n`).join(''), { headers: { 'content-type': 'text/event-stream' } });
const tick = () => new Promise((r) => setTimeout(r, 30));
const $ = <T extends HTMLElement>(s: string) => document.querySelector(s) as T;

// Needs `astro build` first; skipped otherwise.
describe.skipIf(!built)('chat panel against the built page', () => {
  const fetchMock = vi.fn();
  beforeAll(() => {
    const html = readFileSync('dist/index.html', 'utf8');
    document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/)![1].replace(/<script[\s\S]*?<\/script>/g, '');
    // jsdom has no modal dialog support
    HTMLDialogElement.prototype.showModal = function () { this.setAttribute('open', ''); };
    HTMLDialogElement.prototype.close = function () { this.removeAttribute('open'); this.dispatchEvent(new Event('close')); };
    vi.stubGlobal('fetch', fetchMock);
    initChat();
  });

  it('has the accessibility wiring', () => {
    expect($('#chat').getAttribute('aria-labelledby')).toBe('chat-title');
    expect($('#chat-log').getAttribute('role')).toBe('log');
    expect($('#chat-log').getAttribute('aria-live')).toBe('polite');
    expect(document.querySelectorAll('#chat-chips .chip')).toHaveLength(4);
    expect($('#chat-input').getAttribute('maxlength')).toBe('500');
    expect(document.querySelector('label[for="chat-input"]')).not.toBeNull();
  });

  it('opens from a suggestion chip, streams the answer and shows source chips', async () => {
    fetchMock.mockResolvedValueOnce(sse([
      ['sources', [{ title: 'AI-Based EEG Signal Classification', url: '/projects/eeg-signal-classification' }, { title: 'Evil', url: '//evil.com' }]],
      ['token', 'Varad built a **leakage-free** EEG pipeline. '], ['token', '<img src=x onerror=alert(1)>'], ['done', {}],
    ]));
    $<HTMLElement>('#ask [data-suggest]').click();
    await tick();
    expect($('#chat').hasAttribute('open')).toBe(true);
    const bot = document.querySelectorAll('#chat-log .msg.bot')[1] as HTMLElement;
    expect(bot.querySelector('strong')!.textContent).toBe('leakage-free');
    expect(bot.querySelector('img')).toBeNull(); // raw HTML is escaped
    expect(bot.textContent).toContain('<img src=x onerror=alert(1)>');
    const srcs = [...bot.querySelectorAll('.srcs a')].map((a) => a.getAttribute('href'));
    expect(srcs).toEqual(['/projects/eeg-signal-classification']); // protocol-relative URL rejected
    expect($('#chat-log').getAttribute('aria-busy')).toBe('false');
    expect($<HTMLButtonElement>('#chat-send').disabled).toBe(false);
    expect($('#chat-chips').hidden).toBe(true);
    expect(JSON.parse(fetchMock.mock.lastCall![1].body).message).toBe($('#ask [data-suggest]').dataset.suggest);
  });

  it('sends prior turns as history on a follow-up', async () => {
    fetchMock.mockResolvedValueOnce(sse([['sources', []], ['token', 'Yes.'], ['done', {}]]));
    $<HTMLTextAreaElement>('#chat-input').value = 'Tell me more';
    $('#chat-form').dispatchEvent(new Event('submit', { cancelable: true }));
    await tick();
    const body = JSON.parse(fetchMock.mock.lastCall![1].body);
    expect(body.message).toBe('Tell me more');
    expect(body.history.map((t: any) => t.role)).toEqual(['user', 'assistant']);
  });

  it('shows an error state with retry, and retry recovers', async () => {
    fetchMock.mockResolvedValueOnce(new Response('{}', { status: 500 }));
    $<HTMLTextAreaElement>('#chat-input').value = 'What is your stack?';
    $('#chat-form').dispatchEvent(new Event('submit', { cancelable: true }));
    await tick();
    const err = $('#chat-log .msg.err');
    expect(err.textContent).toContain("couldn't get an answer");
    fetchMock.mockResolvedValueOnce(sse([['sources', []], ['token', 'Python and SQL.'], ['done', {}]]));
    err.querySelector<HTMLButtonElement>('.retry')!.click();
    await tick();
    expect(document.querySelector('.msg.err')).toBeNull();
    expect($('#chat-log').lastElementChild!.textContent).toContain('Python and SQL.');
  });

  it('shows the rate-limit message from the server', async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: 'Rate limit reached (20 questions per hour). Please try again later.' }), { status: 429 }));
    $<HTMLTextAreaElement>('#chat-input').value = 'Another one';
    $('#chat-form').dispatchEvent(new Event('submit', { cancelable: true }));
    await tick();
    expect($('#chat-log .msg.err').textContent).toContain('Rate limit reached');
  });

  it('closes with the close button', () => {
    $<HTMLButtonElement>('[data-chat-close]').click();
    expect($('#chat').hasAttribute('open')).toBe(false);
  });
});
