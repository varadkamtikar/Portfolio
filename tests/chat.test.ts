import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { validate, createLimiter, fallbackAnswer, MAX_INPUT } from '../src/lib/chat';
import { POST } from '../api/chat';

describe('validate', () => {
  it('accepts a normal question and trims it', () => {
    expect(validate({ message: '  What did you build?  ' })).toMatchObject({ ok: true, message: 'What did you build?' });
  });
  it('rejects empty, non-text, too long, spam and abusive input', () => {
    for (const message of ['', '   ', '???', 'a'.repeat(MAX_INPUT + 1), 'x'.repeat(30), 'you piece of shit']) {
      expect(validate({ message })).toMatchObject({ ok: false, status: 400 });
    }
    expect(validate({})).toMatchObject({ ok: false });
    expect(validate(null)).toMatchObject({ ok: false });
  });
  it('keeps at most 4 valid history turns', () => {
    const history = Array.from({ length: 6 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `t${i}` }));
    const r = validate({ message: 'hi there', history: [...history, { role: 'system', content: 'x' }, 5] });
    expect(r.ok && r.history.map((t) => t.content)).toEqual(['t2', 't3', 't4', 't5']);
  });
});

describe('createLimiter', () => {
  it('allows max per window then blocks, per key, and resets', () => {
    let t = 0;
    const lim = createLimiter(2, 1000, () => t);
    expect([lim('a'), lim('a'), lim('a'), lim('b')]).toEqual([true, true, false, true]);
    t = 1001;
    expect(lim('a')).toBe(true);
  });
});

describe('fallbackAnswer', () => {
  it('points to the contact email when nothing was retrieved', () => {
    expect(fallbackAnswer([])).toContain('varad.kamtikar@gmail.com');
  });
});

const call = (message: unknown, ip = '1.1.1.1', history?: unknown) =>
  POST(new Request('http://x/api/chat', { method: 'POST', headers: { 'x-forwarded-for': ip }, body: JSON.stringify({ message, history }) }));
const readSSE = async (res: Response) => {
  const events: { event: string; data: any }[] = [];
  for (const block of (await res.text()).split('\n\n').filter(Boolean)) {
    const [e, d] = block.split('\n');
    events.push({ event: e.slice(7), data: JSON.parse(d.slice(6)) });
  }
  return events;
};

describe('POST /api/chat', () => {
  const env = { ...process.env };
  beforeEach(() => { delete process.env.LLM_API_KEY; delete process.env.LLM_PROVIDER; delete process.env.ANTHROPIC_API_KEY; vi.spyOn(console, 'log').mockImplementation(() => {}); });
  afterEach(() => { process.env = { ...env }; vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('rejects bad input with 400 and bad JSON', async () => {
    expect((await call('')).status).toBe(400);
    const res = await POST(new Request('http://x', { method: 'POST', headers: { 'x-forwarded-for': '2.2.2.2' }, body: '{nope' }));
    expect(res.status).toBe(400);
  });

  it('without a key it streams sources then a retrieval-only fallback', async () => {
    const ev = await readSSE(await call('What did you build for your MSc?', '3.3.3.3'));
    expect(ev[0].event).toBe('sources');
    expect(ev[0].data[0].url).toBe('/projects/eeg-signal-classification');
    expect(ev.find((e) => e.event === 'token')!.data).toContain('EEG');
    expect(ev.at(-1)).toEqual({ event: 'done', data: { fallback: true } });
  });

  it('with no relevant context it does not call the model', async () => {
    process.env.LLM_API_KEY = 'test';
    const f = vi.fn(); vi.stubGlobal('fetch', f);
    const ev = await readSSE(await call('quantum entanglement', '4.4.4.4'));
    expect(f).not.toHaveBeenCalled();
    expect(ev.find((e) => e.event === 'token')!.data).toContain('varad.kamtikar@gmail.com');
  });

  it('streams tokens from an OpenAI-compatible upstream and sends the grounded prompt', async () => {
    process.env.LLM_API_KEY = 'test'; process.env.LLM_BASE_URL = 'https://llm.example/v1';
    const body = ['Varad built ', 'an EEG pipeline.'].map((t) => `data: ${JSON.stringify({ choices: [{ delta: { content: t } }] })}\n\n`).join('') + 'data: [DONE]\n\n';
    const f = vi.fn().mockResolvedValue(new Response(body));
    vi.stubGlobal('fetch', f);
    const ev = await readSSE(await call('What did you build for your MSc?', '5.5.5.5'));
    expect(ev.filter((e) => e.event === 'token').map((e) => e.data).join('')).toBe('Varad built an EEG pipeline.');
    expect(ev.at(-1)!.event).toBe('done');
    const [url, init] = f.mock.calls[0];
    expect(url).toBe('https://llm.example/v1/chat/completions');
    const sent = JSON.parse(init.body);
    expect(sent.messages[0].role).toBe('system');
    expect(sent.messages.at(-1).content).toContain('<context>');
    expect(init.headers.authorization).toBe('Bearer test');
  });

  it('falls back when the upstream fails before any token', async () => {
    process.env.LLM_API_KEY = 'test';
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('quota', { status: 429 })));
    const ev = await readSSE(await call('What did you build for your MSc?', '6.6.6.6'));
    expect(ev.at(-1)).toEqual({ event: 'done', data: { fallback: true } });
  });

  it('rate limits by IP after 20 requests', async () => {
    const statuses: number[] = [];
    for (let i = 0; i < 21; i++) statuses.push((await call('Tell me about the Bank Note API', '9.9.9.9')).status);
    expect(statuses.slice(0, 20).every((s) => s === 200)).toBe(true);
    expect(statuses[20]).toBe(429);
  });

  it('does not log IPs', async () => {
    const log = vi.spyOn(console, 'log');
    await call('Tell me about the Bank Note API', '7.7.7.7');
    expect(JSON.stringify(log.mock.calls)).not.toContain('7.7.7.7');
  });
});
