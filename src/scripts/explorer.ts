import { arrange, slot, type Role } from '../lib/explorer';

// Role toggle + skill filter drive the project grid. The server renders the default (Data Science, no filter).
export function initExplorer() {
  const grid = document.querySelector<HTMLElement>('.bento');
  if (!grid) return;
  const cards = [...grid.querySelectorAll<HTMLElement>('.card')].map((el) => ({
    el,
    id: el.dataset.id!,
    rank: { ds: Number(el.dataset.ds), da: Number(el.dataset.da) },
    stack: el.dataset.stack!.split('|'),
  }));
  const roleBtns = [...document.querySelectorAll<HTMLButtonElement>('[data-role]')];
  const skillBtns = [...document.querySelectorAll<HTMLButtonElement>('[data-skill]')];
  const status = document.getElementById('filter-status')!;
  const empty = document.getElementById('empty')!;
  let role: Role = 'ds';
  let skill: HTMLButtonElement | null = null;

  const render = () => {
    const names = skill ? skill.dataset.match!.split('|') : null;
    const shown = arrange(cards, role, names);
    const keep = new Set(shown.map((c) => c.id));
    shown.forEach((c, i) => {
      c.el.hidden = false;
      c.el.classList.remove('slot-lead', 'slot-side', 'slot-half');
      c.el.classList.add(`slot-${slot(i)}`);
      grid.append(c.el);
    });
    cards.filter((c) => !keep.has(c.id)).forEach((c) => { c.el.hidden = true; grid.append(c.el); });

    roleBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.role === role)));
    skillBtns.forEach((b) => {
      b.classList.toggle('rel', (b.dataset.roles ?? '').split(' ').includes(role));
      b.setAttribute('aria-pressed', String(b === skill));
    });
    empty.hidden = shown.length > 0;
    status.hidden = !skill;
    if (skill) {
      status.textContent = `${shown.length} project${shown.length === 1 ? '' : 's'} using ${skill.dataset.skill} `;
      const clear = document.createElement('button');
      clear.type = 'button'; clear.textContent = 'Clear filter';
      clear.addEventListener('click', () => { skill = null; render(); });
      status.append(clear);
    }
  };

  roleBtns.forEach((b) => b.addEventListener('click', () => { role = b.dataset.role as Role; render(); }));
  skillBtns.forEach((b) => b.addEventListener('click', () => {
    skill = skill === b ? null : b;
    render();
    if (skill) document.dispatchEvent(new CustomEvent('goto', { detail: 'projects' }));
  }));
  render();
}
