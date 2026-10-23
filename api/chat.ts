import kb from '../public/kb.json';
import { buildIndex, search } from '../src/lib/retrieve';
import { SYSTEM_PROMPT, buildContext, createLimiter, fallbackAnswer, validate, type Turn } from '../src/lib/chat';
import type { Chunk } from '../src/lib/kb';

const index = buildIndex((kb as { chunks: Chunk[] }).chunks);
const limiter = createLimiter(20, 60 * 60 * 1000);
const enc = new TextEncoder();

const sse = (event: string, data: unknown) => enc.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
const err = (status: number, error: string) =>
  new Response(JSON.stringify({ error }), { status, headers: { 'content-type': 'application/json' } });

// Provider config. Default: any OpenAI-compatible API (Groq free tier). Set LLM_PROVIDER=anthropic to use Claude.
function config() {
  const provider = process.env.LLM_PROVIDER === 'anthropic' ? 'anthropic' : 'openai';
  const key = provider === 'anthropic' ? process.env.ANTHROPIC_API_KEY : process.env.LLM_API_KEY;
  const model = process.env.CHAT_MODEL || (provider === 'anthropic' ? 'claude-haiku-5-5' : 'openai/gpt-oss-120b');
  const base = process.env.LLM_BASE_URL || 'https://api.groq.com/openai/v1';
  return { provider, key, model, base };
}

async function* lines(res: Response): AsyncGenerator<string> {
  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buf = '';
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const parts = buf.split('\n');
    buf = parts.pop()!;
    for (const l of parts) yield l;
  }
  if (buf) yield buf;
}

async function* generate(system: string, messages: Turn[], signal: AbortSignal): AsyncGenerator<string> {
  const { provider, key, model, base } = config();
  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST', signal,
      headers: { 'content-type': 'application/json', 'x-api-key': key!, 'anthropic-version': '2023-06-01' },
      // the static system prompt is cached; the per-question context travels in the user turn
      body: JSON.stringify({ model, max_tokens: 500, stream: true, system: [{ type: 'text', text: system, cache_control: { type: 'ephemeral' } }], messages }),
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    for await (const l of lines(res)) {
      if (!l.startsWith('data:')) continue;
      try { const j = JSON.parse(l.slice(5)); if (j.type === 'content_block_delta' && j.delta?.text) yield j.delta.text; } catch {}
    }
    return;
  }
  const res = await fetch(`${base.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST', signal,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({ model, stream: true, temperature: 0.2, max_tokens: 500, messages: [{ role: 'system', content: system }, ...messages] }),
  });
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  for await (const l of lines(res)) {
    if (!l.startsWith('data:') || l.includes('[DONE]')) continue;
    try { const t = JSON.parse(l.slice(5)).choices?.[0]?.delta?.content; if (t) yield t; } catch {}
  }
}

export async function POST(request: Request): Promise<Response> {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
  if (!limiter(ip)) return err(429, 'Rate limit reached (20 questions per hour). Please try again later.');

  const raw = await request.text();
  if (raw.length > 6000) return err(413, 'Request too large.');
  let body: unknown;
  try { body = JSON.parse(raw); } catch { return err(400, 'Invalid JSON.'); }
  const input = validate(body);
  if (!input.ok) return err(input.status, input.error);

  // follow-ups: include the previous user question so "tell me more" still retrieves something relevant
  const prevUser = [...input.history].reverse().find((t) => t.role === 'user')?.content ?? '';
  const chunks = search(index, `${input.message} ${prevUser}`, 6);
  console.log('chat', { q: input.message.slice(0, 200), sources: chunks.map((c) => c.id) });

  const seen = new Set<string>();
  const sources = chunks.filter((c) => !seen.has(c.url) && seen.add(c.url)).slice(0, 3).map((c) => ({ title: c.title, url: c.url }));
  const { key } = config();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: string, d: unknown) => controller.enqueue(sse(e, d));
      let sent = 0;
      send('sources', sources);
      try {
        if (!key || !chunks.length) throw new Error(key ? 'no context' : 'no key');
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), 30000);
        const messages: Turn[] = [...input.history, { role: 'user', content: `${buildContext(chunks)}\n\nVisitor question: ${input.message}` }];
        try {
          for await (const t of generate(SYSTEM_PROMPT, messages, ctl.signal)) { sent++; send('token', t); }
        } finally { clearTimeout(timer); }
        if (!sent) throw new Error('empty response');
        send('done', {});
      } catch (e) {
        if (sent) send('error', { message: 'The response was interrupted.' });
        else { send('token', fallbackAnswer(chunks)); send('done', { fallback: true }); }
      }
      controller.close();
    },
  });
  return new Response(stream, { headers: { 'content-type': 'text/event-stream; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' } });
}
