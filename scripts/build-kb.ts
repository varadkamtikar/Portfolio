import { writeFileSync, mkdirSync } from 'node:fs';
import { buildChunks, wordCount } from '../src/lib/kb';
import { loadContent } from '../src/lib/kb-node';

const chunks = buildChunks(loadContent());
mkdirSync('public', { recursive: true });
writeFileSync('public/kb.json', JSON.stringify({ generated: new Date().toISOString(), chunks }));
const words = chunks.map((c) => wordCount(c.text));
console.log(`kb.json: ${chunks.length} chunks, ${Math.min(...words)}-${Math.max(...words)} words each`);
