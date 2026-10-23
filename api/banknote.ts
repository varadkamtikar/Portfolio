// Proxy for the Bank Note demo. Keeps the upstream URL server-side and avoids CORS.
// Set BANKNOTE_API_URL to the base URL of the deployed FastAPI service (e.g. https://example.onrender.com).
const FIELDS = ['variance', 'skewness', 'curtosis', 'entropy'] as const;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

export async function POST(request: Request): Promise<Response> {
  const base = process.env.BANKNOTE_API_URL;
  if (!base) return json({ error: 'Demo endpoint is not configured.' }, 503);

  let input: Record<string, unknown>;
  try { input = await request.json(); } catch { return json({ error: 'Invalid JSON.' }, 400); }

  const body: Record<string, number> = {};
  for (const f of FIELDS) {
    const v = input[f];
    if (typeof v !== 'number' || !Number.isFinite(v) || Math.abs(v) > 100) return json({ error: `Invalid ${f}.` }, 400);
    body[f] = v;
  }

  try {
    const r = await fetch(new URL('/predict', base), {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15000),
    });
    if (!r.ok) return json({ error: 'Upstream error.' }, 502);
    const data = (await r.json()) as { prediction?: unknown };
    if (typeof data.prediction !== 'string') return json({ error: 'Unexpected upstream response.' }, 502);
    return json({ prediction: data.prediction });
  } catch {
    return json({ error: 'Upstream unreachable.' }, 502);
  }
}
