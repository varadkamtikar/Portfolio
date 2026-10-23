# Varadkrishna Kamtikar — Portfolio

Personal site for [varadkamtikar.online](https://varadkamtikar.online): an editorial dark/light design with an EEG-waveform motif, case studies, a skills explorer, and an "Ask my portfolio" chat that answers from the site's own content (RAG).

**Stack:** Astro 7 · TypeScript · Tailwind v4 (base layer only; components use custom CSS) · GSAP + ScrollTrigger · Lenis · Vercel serverless function for the chat · Vitest.

## Quick start

```bash
npm install
npm run dev        # site at http://localhost:4321 (the /api routes do NOT run here)
npm run build      # builds public/kb.json, then the static site into dist/
npm run preview    # serve dist/
npm test           # rebuilds kb.json, then runs all tests
```

To exercise `/api/chat` and `/api/banknote` locally, use the Vercel CLI (`npx vercel dev`) with a `.env` copied from `.env.example`.

DOM tests (`tests/*-dom.test.ts`) read the built page, so run `npm run build` once before `npm test`; they skip themselves if `dist/` is missing.

## Editing content

All text lives in `content/`. You never need to touch components to change words.

| File | What it controls |
|---|---|
| `content/profile.json` | Name, tagline, about paragraphs, email/phone/links, availability badge, chat suggestion chips, CV path, "last updated" date |
| `content/experience.json` | Timeline nodes and bullets (including MSc and "open to roles") |
| `content/education.json` | Degrees |
| `content/certifications.json` | Certifications and learning |
| `content/skills.json` | Skill groups. `roles` (`ds`, `da`) drive the role toggle highlight; `aliases` let a skill match project stack names |
| `content/projects/*.md` | One file per project: frontmatter (title, summary, stack, repo, live URL, `roleRank`, `pipeline`, `metrics`) plus a Markdown body of `## Problem` / `## Approach` |
| `content/faqs.json` | Extra Q&A the chat can draw on |
| `content/now.md` | The "Now" block. Edit the text and the `updated` date |

**Adding project metrics:** in a project's frontmatter, replace `metrics: []` with, for example:

```yaml
metrics:
  - { label: "Subjects", value: "32" }
```

They appear on the case-study page and in the chat's knowledge base after the next build.

**CV:** put your PDF at `public/cv.pdf`. The Download CV buttons only render when that file exists.

## The chat (RAG)

1. `npm run build:kb` (`scripts/build-kb.ts`) reads `content/`, splits it into chunks of at most 300 words with metadata (source, section, title, URL), and writes `public/kb.json`. It runs automatically as part of `npm run build`.
2. `/api/chat` (`api/chat.ts`) retrieves the top 6 chunks with BM25 keyword search (no extra service or key), then streams an answer from the configured model over server-sent events. The system prompt restricts it to the retrieved context.
3. If no key is set, the provider errors, or a free quota runs out, the chat shows the most relevant portfolio sections instead of failing.

Guardrails: 500-character input limit, empty/spam/abusive input rejected, 20 requests per IP per hour (in-memory, so it resets per serverless instance; swap in Vercel KV if you need a hard limit), queries logged to the console only (no IPs stored), and model output rendered through an HTML-escaping Markdown renderer.

## Environment variables

Set these in Vercel → Project → Settings → Environment Variables. Never commit real values. See `.env.example`.

| Variable | Purpose |
|---|---|
| `LLM_API_KEY` | Key for the chat model provider (default provider: Groq's free tier) |
| `LLM_BASE_URL` | OpenAI-compatible base URL (default `https://api.groq.com/openai/v1`) |
| `CHAT_MODEL` | Model id (default `openai/gpt-oss-120b`; check your provider's current list) |
| `LLM_PROVIDER` | `openai` (default, any OpenAI-compatible API) or `anthropic` |
| `ANTHROPIC_API_KEY` | Only when `LLM_PROVIDER=anthropic` (model defaults to `claude-haiku-5-5`, with prompt caching) |
| `BANKNOTE_API_URL` | Base URL of the deployed Bank Note FastAPI service. Blank means the demo shows an "unavailable" message |

## Deploy to Vercel (with the custom domain)

GitHub Pages can only serve static files, so the chat backend needs Vercel. **Do the steps in this order so the live site is never down:**

1. **Work on a branch.** Push this code to a branch such as `redesign`, not `main`. If `main` is what GitHub Pages serves, merging early would replace the live site with source files.
2. **Import the repo in Vercel** (vercel.com → Add New → Project). Framework preset: Astro. The defaults work (`npm run build`, output `dist`). Vercel builds `api/*.ts` as serverless functions automatically.
3. **Add the environment variables** above, then redeploy. Open the preview URL and test the site and the chat.
4. **Add the domain.** Project → Settings → Domains → add `varadkamtikar.online` (and `www.varadkamtikar.online`, redirected to the apex). Vercel shows the exact records to create.
5. **Change DNS at your registrar.** Replace the existing GitHub Pages records with Vercel's:
   - Apex (`@`): `A` record → `76.76.21.21`
   - `www`: `CNAME` → `cname.vercel-dns.com`

   Remove the old GitHub Pages `A` records (185.199.108.153 and the other 185.199.x.x addresses) and any old `CNAME`. Use the values Vercel displays if they differ. DNS changes can take minutes to hours. HTTPS is issued automatically.
6. **After the domain works on Vercel:** merge the branch into `main`, delete the `CNAME` file (a GitHub Pages leftover), and turn off Pages in the repo settings (Settings → Pages).

## Project structure

```
content/        all editable text (see above)
api/            Vercel serverless functions: chat.ts, banknote.ts
scripts/        build-kb.ts (knowledge-base build)
src/components/ page sections
src/lib/        pure logic: chunking, BM25, chat helpers, markdown, SSE, explorer
src/scripts/    browser code: motion, loader, waveform, cursor, palette, chat, explorer
src/pages/      index, 404, projects/[slug] (shared case-study template)
public/         og.png (1200x630), favicon, robots.txt, generated kb.json
tests/          unit + DOM tests, qa.json (15-question retrieval set)
```

## Accessibility and motion

Semantic landmarks, skip link, visible focus rings, keyboard-operable chat/palette/toggles. `prefers-reduced-motion` disables the loader, smooth scroll, reveals and animated waveforms (a static waveform is drawn instead); content is never hidden by CSS and is only hidden by JS while an entrance animation is about to play.

## License

MIT — see `LICENSE`.
