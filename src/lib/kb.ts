// Pure knowledge-base logic: turns content objects into retrievable chunks of ~150-300 words.
export interface Chunk { id: string; source: string; section: string; title: string; url: string; text: string }

export interface Content {
  profile: any;
  experience: any[];
  education: any[];
  certifications: any[];
  skills: any[];
  faqs: any[];
  now: { updated: string; body: string } | null;
  projects: { data: any; body: string }[];
}

export const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;

function splitLong(unit: string, max: number): string[] {
  if (wordCount(unit) <= max) return [unit];
  const out: string[] = [];
  let cur: string[] = [];
  for (const sentence of unit.match(/[^.!?]+[.!?]*\s*/g) ?? [unit]) {
    const words = sentence.split(/\s+/).filter(Boolean);
    if (words.length > max) {
      if (cur.length) { out.push(cur.join(' ')); cur = []; }
      for (let i = 0; i < words.length; i += max) out.push(words.slice(i, i + max).join(' '));
      continue;
    }
    if (cur.length + words.length > max) { out.push(cur.join(' ')); cur = []; }
    cur.push(...words);
  }
  if (cur.length) out.push(cur.join(' '));
  return out;
}

/** Greedily packs units into chunks of at most `max` words; a short tail is merged back when it fits. */
export function packUnits(units: string[], min = 150, max = 300): string[] {
  const pieces = units.flatMap((u) => splitLong(u.trim(), max)).filter(Boolean);
  const chunks: string[] = [];
  let cur = '';
  for (const p of pieces) {
    if (cur && wordCount(cur) + wordCount(p) > max) { chunks.push(cur); cur = p; }
    else cur = cur ? `${cur}\n\n${p}` : p;
  }
  if (cur) {
    const prev = chunks[chunks.length - 1];
    if (prev && wordCount(cur) < min && wordCount(prev) + wordCount(cur) <= max) chunks[chunks.length - 1] = `${prev}\n\n${cur}`;
    else chunks.push(cur);
  }
  return chunks;
}

const group = (source: string, section: string, title: string, url: string, units: string[]): Chunk[] =>
  packUnits(units).map((text, i) => ({ id: `${source}-${i + 1}`, source, section, title, url, text }));

export function buildChunks(c: Content): Chunk[] {
  const out: Chunk[] = [];
  const p = c.profile, k = p.contact;

  out.push(...group('profile', 'About', 'About Varad', '/#about', [
    `${p.name} is a ${p.title}. ${p.tagline}`, ...p.about,
    p.available ? `Availability: ${p.availableLabel}. Varad is open to Data Science and Analytics roles.` : '',
  ].filter(Boolean)));

  out.push(...group('contact', 'Contact', 'Contact details', '/#contact', [
    `Contact Varad by email at ${k.email} or by phone on ${k.phone}. GitHub: ${k.github}. LinkedIn: ${k.linkedin}.`,
  ]));

  out.push(...group('experience', 'Experience', 'Experience timeline', '/#experience',
    c.experience.map((e) => `${e.role}${e.org ? ` at ${e.org}` : ''}${e.place ? ` (${e.place})` : ''}, ${e.start} to ${e.end}${e.badge ? ` [${e.badge}]` : ''}. ${e.highlights.join(' ')}`)));

  out.push(...group('education', 'Education', 'Education', '/#about',
    c.education.map((e) => `${e.degree} (${e.level} degree) at ${e.school}, ${e.place}, ${e.years}.${e.grade ? ` Grade: ${e.grade}.` : ''}`)));

  out.push(...group('certifications', 'Certifications', 'Certifications and learning', '/#learning',
    [c.certifications.map((x) => `${x.title} (${x.status})`).join('. ') + '.']));

  out.push(...group('skills', 'Skills', 'Skills', '/#skills',
    c.skills.map((g) => `${g.category}: ${g.skills.map((s: any) => s.name).join(', ')}.`)));

  out.push(...group('faq', 'FAQ', 'Frequently asked questions', '/', c.faqs.map((f) => `Q: ${f.q} A: ${f.a}`)));

  if (c.now && !c.now.body.includes('[PLACEHOLDER]')) {
    out.push(...group('now', 'Now', 'What Varad is working on now', '/#notes', [`Updated ${c.now.updated}. ${c.now.body}`]));
  }

  for (const { data: d, body } of c.projects) {
    const metrics = d.metrics.length ? `Key metrics: ${d.metrics.map((m: any) => `${m.label} ${m.value}`).join(', ')}.` : '';
    const sections = body.split(/^## /m).map((s) => s.trim()).filter(Boolean).map((s) => {
      const [head, ...rest] = s.split('\n');
      return { head, text: rest.join(' ').trim() };
    }).filter((s) => s.text && s.text !== d.summary);
    out.push(...group(`project-${d.slug}`, 'Project', d.title, `/projects/${d.slug}`, [
      `Project: ${d.title}. ${d.summary} Tech stack: ${d.stack.join(', ')}. GitHub repository: ${d.repo}.${d.live ? ` Live app: ${d.live}.` : ''} Pipeline: ${d.pipeline.join(' -> ')}.${d.featured ? ' This is the featured project.' : ''}`,
      ...sections.map((s) => `${s.head}: ${s.text}`),
      metrics,
    ].filter(Boolean)));
  }
  return out;
}
