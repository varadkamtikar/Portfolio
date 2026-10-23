import { renderMarkdown } from '../lib/markdown';
import { readSSE } from '../lib/sse';

interface Turn { role: 'user' | 'assistant'; content: string }

export function initChat() {
  const found = document.getElementById('chat') as HTMLDialogElement | null;
  if (!found) return;
  const dlg: HTMLDialogElement = found;
  const log = document.getElementById('chat-log')!;
  const form = document.getElementById('chat-form') as HTMLFormElement;
  const input = document.getElementById('chat-input') as HTMLTextAreaElement;
  const send = document.getElementById('chat-send') as HTMLButtonElement;
  const chips = document.getElementById('chat-chips')!;
  const count = document.getElementById('chat-count')!;
  const history: Turn[] = [];
  let busy = false;

  const open = (question?: string) => {
    if (!dlg.open) { dlg.showModal(); document.dispatchEvent(new Event('overlay:open')); }
    input.focus();
    if (question) ask(question);
  };
  const close = () => dlg.open && dlg.close();
  dlg.addEventListener('close', () => document.dispatchEvent(new Event('overlay:close')));
  dlg.addEventListener('click', (e) => { if (e.target === dlg) close(); });
  dlg.querySelector('[data-chat-close]')!.addEventListener('click', close);
  document.addEventListener('chat:open', () => open());
  document.querySelectorAll<HTMLElement>('[data-chat-open]').forEach((b) => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
  document.querySelectorAll<HTMLElement>('[data-suggest]').forEach((b) => b.addEventListener('click', () => open(b.dataset.suggest)));

  input.addEventListener('input', () => { count.textContent = String(input.value.length); });
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
  form.addEventListener('submit', (e) => { e.preventDefault(); const q = input.value.trim(); if (q) ask(q); });

  const bubble = (cls: string) => {
    const el = document.createElement('div');
    el.className = `msg ${cls}`;
    log.append(el);
    log.scrollTop = log.scrollHeight;
    return el;
  };

  function setBusy(b: boolean) {
    busy = b;
    send.disabled = b;
    log.setAttribute('aria-busy', String(b));
  }

  async function ask(question: string, retryBubble?: HTMLElement) {
    if (busy) return;
    retryBubble?.remove();
    if (!retryBubble) {
      bubble('user').textContent = question;
      input.value = ''; count.textContent = '0';
    }
    chips.hidden = true;
    const bot = bubble('bot');
    bot.innerHTML = '<span class="typing" role="status" aria-label="Typing"><i></i><i></i><i></i></span>';
    setBusy(true);

    let text = '';
    let sources: { title: string; url: string }[] = [];
    let failed = false;
    let paint = 0;
    const render = () => { paint = 0; bot.innerHTML = renderMarkdown(text); log.scrollTop = log.scrollHeight; };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message: question, history: history.slice(-4) }),
      });
      if (!res.ok || !res.body) {
        const j = await res.json().catch(() => ({}));
        throw new Error(res.status === 429 || res.status === 400 ? j.error : '');
      }
      for await (const ev of readSSE(res.body)) {
        if (ev.event === 'sources') sources = (ev.data as typeof sources).filter((s) => typeof s.url === 'string' && s.url.startsWith('/') && !s.url.startsWith('//'));
        else if (ev.event === 'token') { text += String(ev.data); if (!paint) paint = requestAnimationFrame(render); }
        else if (ev.event === 'error') failed = true;
      }
      if (!text) failed = true;
    } catch (e) {
      failed = true;
      text = (e as Error).message || '';
    }

    if (paint) cancelAnimationFrame(paint);
    if (failed) {
      bot.classList.add('err');
      bot.innerHTML = '';
      const p = document.createElement('p');
      p.textContent = text && text.length < 160 ? text : "Sorry, I couldn't get an answer just now.";
      const retry = document.createElement('button');
      retry.type = 'button'; retry.className = 'btn retry'; retry.textContent = 'Try again';
      retry.addEventListener('click', () => ask(question, bot));
      bot.append(p, retry);
    } else {
      render();
      history.push({ role: 'user', content: question }, { role: 'assistant', content: text.slice(0, 1000) });
      if (sources.length) {
        const ul = document.createElement('ul');
        ul.className = 'srcs'; ul.setAttribute('aria-label', 'Sources');
        for (const s of sources) {
          const li = document.createElement('li'), a = document.createElement('a');
          a.href = s.url; a.textContent = s.title;
          a.addEventListener('click', () => close());
          li.append(a); ul.append(li);
        }
        bot.append(ul);
      }
    }
    setBusy(false);
    log.scrollTop = log.scrollHeight;
    if (dlg.open) input.focus();
  }
}
