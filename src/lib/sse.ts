export interface SSEEvent { event: string; data: unknown }

/** Parses a server-sent-events body into events. Data payloads are JSON. */
export async function* readSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<SSEEvent> {
  const reader = body.getReader();
  const dec = new TextDecoder();
  let buf = '';
  const parse = (block: string): SSEEvent | null => {
    let event = 'message', data = '';
    for (const l of block.split('\n')) {
      if (l.startsWith('event:')) event = l.slice(6).trim();
      else if (l.startsWith('data:')) data += l.slice(5).trimStart();
    }
    if (!data) return null;
    try { return { event, data: JSON.parse(data) }; } catch { return null; }
  };
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += dec.decode(value, { stream: true });
    const blocks = buf.split('\n\n');
    buf = blocks.pop()!;
    for (const b of blocks) { const e = parse(b); if (e) yield e; }
  }
  const last = parse(buf);
  if (last) yield last;
}
