// EEG-style waveform: summed sines drawn on <canvas data-waveform>. Only visible canvases animate.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const root = document.documentElement;

interface Wave { c: HTMLCanvasElement; ctx: CanvasRenderingContext2D; w: number; h: number; amp: number }

// size and colour are cached and refreshed by observers, so the frame loop never reads layout or styles
let accent = '#3dffa2';
const readAccent = () => { accent = getComputedStyle(root).getPropertyValue('--accent').trim() || accent; };

function draw(v: Wave, t: number) {
  const { ctx, w, h } = v;
  ctx.clearRect(0, 0, w, h);
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  const amp = h * v.amp;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 2) {
    const p = x / 60 + t;
    const y = h / 2 + amp * (Math.sin(p) * 0.5 + Math.sin(p * 2.3 + 1.7) * 0.3 + Math.sin(p * 5.1 + t * 2) * 0.15 + Math.sin(p * 11 + 3) * 0.08);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function initWaveforms() {
  readAccent();
  const waves = new Map<Element, Wave>();
  const dpr = Math.min(devicePixelRatio || 1, 2);

  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const v = waves.get(e.target);
      if (!v) continue;
      v.w = e.contentRect.width; v.h = e.contentRect.height;
      v.c.width = v.w * dpr; v.c.height = v.h * dpr;
      v.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) draw(v, 0);
    }
  });
  document.querySelectorAll<HTMLCanvasElement>('canvas[data-waveform]').forEach((c) => {
    const ctx = c.getContext('2d');
    if (!ctx) return;
    waves.set(c, { c, ctx, w: 0, h: 0, amp: Number(c.dataset.amp ?? 0.3) });
    ro.observe(c);
  });

  new MutationObserver(() => { readAccent(); if (reduced) waves.forEach((v) => draw(v, 0)); }).observe(root, { attributes: true, attributeFilter: ['data-theme'] });
  if (reduced) return;

  const visible = new Set<Wave>();
  const io = new IntersectionObserver((es) => es.forEach((e) => { const v = waves.get(e.target)!; e.isIntersecting ? visible.add(v) : visible.delete(v); }));
  waves.forEach((_, c) => io.observe(c));
  const loop = (ms: number) => { visible.forEach((v) => draw(v, ms / 1000)); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
