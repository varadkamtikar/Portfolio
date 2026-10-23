import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let lenis: Lenis | null = null;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;

// Content is only hidden by JS here, so with no JS or reduced motion everything stays visible.
export function initMotion(): { playHero: () => void } {
  document.addEventListener('goto', (e) => {
    const el = document.getElementById((e as CustomEvent<string>).detail);
    if (el) lenis ? lenis.scrollTo(el, { offset: -80 }) : el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth' });
  });
  if (reduced) return { playHero: () => {} };

  lenis = new Lenis({ anchors: { offset: -80 } });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis?.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener('palette:open', () => lenis?.stop());
  document.addEventListener('palette:close', () => lenis?.start());

  // hero intro, paused until the loader finishes
  const hero = gsap.timeline({ paused: true, defaults: { ease: 'power3.out' } });
  hero
    .from('.hero .badge', { opacity: 0, y: 16, duration: 0.6 })
    .from('.hero h1', { opacity: 0, y: 40, duration: 0.9 }, '-=0.3')
    .from('.hero .tagline', { opacity: 0, y: 20, duration: 0.7 }, '-=0.5')
    .from('.hero .wave', { opacity: 0, duration: 0.8 }, '-=0.4')
    .from('.hero .ctas .btn', { opacity: 0, y: 16, duration: 0.5, stagger: 0.08 }, '-=0.5')
    .from('.hero .photo', { opacity: 0, duration: 0.9 }, '-=0.8');

  const reveal = (targets: string, opts: { stagger?: number; y?: number; trigger?: string } = {}) => {
    const groups = new Map<Element, Element[]>();
    document.querySelectorAll(targets).forEach((el) => {
      const key = el.parentElement!;
      groups.set(key, [...(groups.get(key) ?? []), el]);
    });
    groups.forEach((els, parent) => {
      gsap.from(els, {
        opacity: 0, y: opts.y ?? 28, duration: 0.8, ease: 'power3.out', stagger: opts.stagger ?? 0.1,
        scrollTrigger: { trigger: parent, start: 'top 85%', once: true },
      });
    });
  };

  reveal('.sec-head');
  reveal('.about .lead, .about .side', { stagger: 0.15 });
  reveal('.tl > li', { stagger: 0.15 });
  reveal('.bento > .card', { stagger: 0.08 });
  reveal('.groups > div', { stagger: 0.08 });
  reveal('.certs li', { stagger: 0.08, y: 16 });
  reveal('.cards > article, .now', { stagger: 0.1 });
  reveal('.big, .rows li', { stagger: 0.08 });

  // timeline: progress line follows scroll
  const bar = document.querySelector('.tl-progress');
  if (bar) {
    gsap.fromTo(bar, { scaleY: 0 }, {
      scaleY: 1, ease: 'none', transformOrigin: 'top',
      scrollTrigger: { trigger: '.tl', start: 'top 70%', end: 'bottom 70%', scrub: true },
    });
  }

  // magnetic primary buttons
  if (finePointer) {
    document.querySelectorAll<HTMLElement>('.btn-primary').forEach((b) => {
      const x = gsap.quickTo(b, 'x', { duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      const y = gsap.quickTo(b, 'y', { duration: 0.5, ease: 'elastic.out(1, 0.5)' });
      b.addEventListener('mousemove', (e) => {
        const r = b.getBoundingClientRect();
        x((e.clientX - (r.left + r.width / 2)) * 0.3);
        y((e.clientY - (r.top + r.height / 2)) * 0.3);
      });
      b.addEventListener('mouseleave', () => { x(0); y(0); });
    });
  }

  return { playHero: () => hero.play() };
}
