// Minimal, safe Markdown -> HTML. All input is HTML-escaped first, so no raw HTML can survive.
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const safeUrl = (u: string): string | null => {
  const url = u.replace(/&amp;/g, '&');
  return /^(https?:\/\/|\/(?!\/)|mailto:)/i.test(url) ? u : null;
};

const link = (href: string, text: string) => {
  const ok = safeUrl(href);
  if (!ok) return text;
  const external = /^https?:/i.test(href);
  return `<a href="${ok}"${external ? ' target="_blank" rel="noopener noreferrer"' : ''}>${text}</a>`;
};

function inline(raw: string): string {
  let s = esc(raw);
  const codes: string[] = [];
  s = s.replace(/`([^`]+)`/g, (_, c) => `\u0000${codes.push(`<code>${c}</code>`) - 1}\u0000`);
  s = s.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, h) => link(h, t));
  s = s.replace(/(^|[\s(])(https?:\/\/[^\s<)]+[^\s<).,;:!?])/g, (_, pre, u) => `${pre}${link(u, u)}`);
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>').replace(/(^|[^*])\*([^*\s][^*]*)\*/g, '$1<em>$2</em>');
  return s.replace(/\u0000(\d+)\u0000/g, (_, i) => codes[Number(i)]);
}

export function renderMarkdown(src: string): string {
  const out: string[] = [];
  let list: string[] | null = null;
  let para: string[] = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${para.map(inline).join('<br>')}</p>`); para = []; } };
  const flushList = () => { if (list) { out.push(`<ul>${list.map((i) => `<li>${inline(i)}</li>`).join('')}</ul>`); list = null; } };
  for (const line of src.replace(/\r/g, '').split('\n')) {
    const li = line.match(/^\s*[-*]\s+(.*)$/);
    if (li) { flushPara(); (list ??= []).push(li[1]); }
    else if (!line.trim()) { flushPara(); flushList(); }
    else { flushList(); para.push(line.trim()); }
  }
  flushPara(); flushList();
  return out.join('');
}
