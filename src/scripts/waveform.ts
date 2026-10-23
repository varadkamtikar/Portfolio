// EEG-style waveform: summed sines + band-limited noise, drawn on <canvas data-waveform>.
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function draw(c: HTMLCanvasElement, t: number) {
  const ctx = c.getContext('2d');
  if (!ctx) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = c.clientWidth, h = c.clientHeight;
  if (c.width !== w * dpr || c.height !== h * dpr) { c.width = w * dpr; c.height = h * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
  const css = getComputedStyle(c);
  ctx.strokeStyle = css.getPropertyValue('--accent').trim() || '#3dffa2';
  ctx.lineWidth = 1.5;
  const amp = h * Number(c.dataset.amp ?? 0.3);
  ctx.beginPath();
  for (let x = 0; x <= w; x += 2) {
    const p = x / 60 + t;
    const y = h / 2 + amp * (Math.sin(p) * 0.5 + Math.sin(p * 2.3 + 1.7) * 0.3 + Math.sin(p * 5.1 + t * 2) * 0.15 + Math.sin(p * 11 + 3) * 0.08);
    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();
}

export function initWaveforms() {
  const canvases = [...document.querySelectorAll<HTMLCanvasElement>('canvas[data-waveform]')];
  if (reduced) { canvases.forEach((c) => draw(c, 0)); return; }
  const visible = new Set<HTMLCanvasElement>();
  const io = new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? visible.add(e.target as HTMLCanvasElement) : visible.delete(e.target as HTMLCanvasElement))));
  canvases.forEach((c) => io.observe(c));
  const loop = (ms: number) => { visible.forEach((c) => draw(c, ms / 1000)); requestAnimationFrame(loop); };
  requestAnimationFrame(loop);
}
