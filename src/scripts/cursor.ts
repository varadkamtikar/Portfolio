import gsap from 'gsap';

export function initCursor() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  const dot = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;
  document.documentElement.classList.add('has-cursor');
  gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });
  const dx = gsap.quickTo(dot, 'x', { duration: 0.05 }), dy = gsap.quickTo(dot, 'y', { duration: 0.05 });
  const rx = gsap.quickTo(ring, 'x', { duration: 0.3 }), ry = gsap.quickTo(ring, 'y', { duration: 0.3 });
  addEventListener('mousemove', (e) => {
    dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY);
    gsap.to([dot, ring], { opacity: 1, duration: 0.2, overwrite: 'auto' });
  });
  document.addEventListener('mouseleave', () => gsap.to([dot, ring], { opacity: 0, duration: 0.2 }));
  const sel = 'a, button, [role="button"], input, summary';
  document.addEventListener('mouseover', (e) => {
    const on = (e.target as Element).closest(sel) !== null;
    gsap.to(ring, { scale: on ? 1.8 : 1, duration: 0.25 });
    ring.classList.toggle('on', on);
  });
}
