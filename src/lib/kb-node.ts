import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { Content } from './kb';

const json = (dir: string, f: string) => JSON.parse(readFileSync(join(dir, f), 'utf8'));

/** Reads the `content/` folder from disk. */
export function loadContent(dir = 'content'): Content {
  const nowPath = join(dir, 'now.md');
  let now: Content['now'] = null;
  if (existsSync(nowPath)) {
    const m = readFileSync(nowPath, 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (m) now = { updated: String(parse(m[1]).updated ?? ''), body: m[2].trim() };
  }
  const projects = readdirSync(join(dir, 'projects')).filter((f) => f.endsWith('.md')).sort().map((f) => {
    const m = readFileSync(join(dir, 'projects', f), 'utf8').match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)!;
    return { data: parse(m[1]), body: m[2] };
  });
  return {
    profile: json(dir, 'profile.json'), experience: json(dir, 'experience.json'), education: json(dir, 'education.json'),
    certifications: json(dir, 'certifications.json'), skills: json(dir, 'skills.json'), faqs: json(dir, 'faqs.json'), now, projects,
  };
}
