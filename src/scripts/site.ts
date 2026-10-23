import { initWaveforms } from './waveform';

initWaveforms();

// theme toggle
document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]').forEach((b) =>
  b.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem('theme', next); } catch {}
    b.setAttribute('aria-pressed', String(next === 'light'));
  }),
);

// active nav link
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-nav] a[href^="#"]')];
const io = new IntersectionObserver(
  (es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    links.forEach((l) => l.toggleAttribute('aria-current', l.hash === '#' + e.target.id));
  }),
  { rootMargin: '-45% 0px -50% 0px' },
);
links.forEach((l) => { const s = document.querySelector(l.hash); if (s) io.observe(s); });

// copy email + toast
const toast = document.getElementById('toast');
document.querySelectorAll<HTMLButtonElement>('[data-copy]').forEach((b) =>
  b.addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(b.dataset.copy!); } catch { return; }
    if (!toast) return;
    toast.textContent = 'Email copied';
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
  }),
);
