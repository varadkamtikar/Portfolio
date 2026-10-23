import gsap from 'gsap';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;

function remove(el: HTMLElement) {
  el.remove();
  document.documentElement.classList.remove('loading');
}

// Waveform flattens to a line while the name resolves. Resolves when the overlay is gone.
export function runLoader(): Promise<void> {
  const found = document.getElementById('loader');
  if (!found) return Promise.resolve();
  const el: HTMLElement = found;
  let seen = false;
  try { seen = sessionStorage.getItem('loaded') === '1'; sessionStorage.setItem('loaded', '1'); } catch {}
  if (reduced || seen) { remove(el); return Promise.resolve(); }

  const canvas = el.querySelector('canvas')!;
  const nameEl = el.querySelector<HTMLElement>('.loader-name')!;
  nameEl.innerHTML = [...nameEl.textContent!].map((c) => `<span>${c === ' ' ? '&nbsp;' : c}</span>`).join('');
  const letters = nameEl.querySelectorAll('span');
  const ctx = canvas.getContext('2d')!;
  const state = { amp: 1 };
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim();

  const draw = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    const w = canvas.clientWidth, h = canvas.clientHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.strokeStyle = accent; ctx.lineWidth = 1.5;
    const t = performance.now() / 400;
    ctx.beginPath();
    for (let x = 0; x <= w; x += 2) {
      const p = x / 50 + t;
      const y = h / 2 + state.amp * h * 0.3 * (Math.sin(p) * 0.5 + Math.sin(p * 2.3 + 1.7) * 0.3 + Math.sin(p * 5.1) * 0.15);
      x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  };
  gsap.ticker.add(draw);

  return new Promise((resolve) => {
    let done = false;
    const tl = gsap.timeline({ onComplete: finish });
    function finish() {
      if (done) return;
      done = true;
      tl.kill();
      gsap.ticker.remove(draw);
      el.style.transition = 'opacity .5s';
      el.style.opacity = '0';
      setTimeout(() => remove(el), 550);
      resolve();
    }
    tl.to(state, { amp: 0, duration: 1.4, ease: 'power2.inOut' })
      .to(letters, { opacity: 1, duration: 0.4, stagger: 0.04 }, 0.2)
      .to({}, { duration: 0.3 });
    setTimeout(finish, 3500); // hard cap, independent of rAF
    el.addEventListener('click', finish);
    addEventListener('keydown', finish, { once: true });
  });
}
