type Item = { label: string; hint: string; run: () => void };

export function initPalette() {
  const dlg = document.getElementById('palette') as HTMLDialogElement | null;
  if (!dlg) return;
  const input = dlg.querySelector('input')!;
  const list = dlg.querySelector('ul')!;
  const q = (sel: string) => document.querySelector<HTMLElement>(sel);

  const go = (id: string) => () => { document.dispatchEvent(new CustomEvent('goto', { detail: id })); };
  const items: Item[] = [
    ...[['About', 'about'], ['Experience', 'experience'], ['Projects', 'projects'], ['Skills', 'skills'], ['Certifications', 'learning'], ['Notes & now', 'notes'], ['Contact', 'contact']]
      .map(([l, id]) => ({ label: l, hint: 'Go to', run: go(id) })),
    { label: 'Ask my portfolio', hint: 'Action', run: () => document.dispatchEvent(new Event('chat:open')) },
    { label: 'Toggle theme', hint: 'Action', run: () => q('[data-theme-toggle]')?.click() },
    { label: 'Copy email', hint: 'Action', run: () => q('[data-copy]')?.click() },
    { label: 'GitHub', hint: 'Open', run: () => open(q('#contact a[href*="github.com"]')?.getAttribute('href') ?? '', '_blank', 'noopener') },
    { label: 'LinkedIn', hint: 'Open', run: () => open(q('#contact a[href*="linkedin.com"]')?.getAttribute('href') ?? '', '_blank', 'noopener') },
  ];

  if (q('a[download]')) items.splice(items.findIndex((i) => i.label === 'Toggle theme') + 1, 0, { label: 'Download CV', hint: 'Action', run: () => q('a[download]')?.click() });

  let shown: Item[] = items, active = 0;
  const render = () => {
    list.innerHTML = '';
    shown.forEach((it, i) => {
      const li = document.createElement('li');
      li.setAttribute('role', 'option');
      li.id = 'pal-' + i;
      li.setAttribute('aria-selected', String(i === active));
      li.innerHTML = `<span></span><span class="mono"></span>`;
      li.children[0].textContent = it.label;
      li.children[1].textContent = it.hint;
      li.addEventListener('click', () => choose(i));
      list.append(li);
    });
    input.setAttribute('aria-activedescendant', shown.length ? 'pal-' + active : '');
    list.children[active]?.scrollIntoView({ block: 'nearest' });
  };
  const choose = (i: number) => { const it = shown[i]; if (!it) return; close(); setTimeout(it.run, 50); };
  const openIt = () => { input.value = ''; shown = items; active = 0; render(); dlg.showModal(); document.dispatchEvent(new Event('overlay:open')); input.focus(); };
  const close = () => dlg.open && dlg.close();

  dlg.addEventListener('close', () => document.dispatchEvent(new Event('overlay:close')));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  input.addEventListener('input', () => {
    const s = input.value.trim().toLowerCase();
    shown = items.filter((i) => i.label.toLowerCase().includes(s));
    active = 0; render();
  });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') { active = Math.min(active + 1, shown.length - 1); e.preventDefault(); render(); }
    else if (e.key === 'ArrowUp') { active = Math.max(active - 1, 0); e.preventDefault(); render(); }
    else if (e.key === 'Enter') { e.preventDefault(); choose(active); }
  });
  addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); dlg.open ? close() : openIt(); }
  });
  document.querySelectorAll('[data-palette-open]').forEach((b) => b.addEventListener('click', openIt));
}
