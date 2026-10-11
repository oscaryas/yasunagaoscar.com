# yasunagaoscar.com

Academic personal site in the style of andreimuresanu.com. The About page opens in a simple version with a
"Turn on ads" button that switches to a parody early-2000s spam-ad page. The site is built as static files
and hosted on GitHub Pages. See **DEPLOY.md** to put it live.

## Build
```bash
npm install          # optional: installs the Markdown library
npm run build        # writes the site into dist/
```
Every push to `main` on GitHub rebuilds and publishes automatically (`.github/workflows/deploy.yml`).

## What works on the static site
The ads, popup, × buttons, "You've got mail" sound, countdown, light/dark mode, Library, blog posts, and all pages.
Claim Form.exe opens the visitor's email app with their message filled in. The visitor counter is a fake
number starting at 999,999.

## Optional server (not used for GitHub Pages)
`server.js` is the earlier Express version with a real form backend, visitor counter and click tracking. It is kept for later and is not part of the static build.

## Pages
| Path | What it is | Edit in |
|---|---|---|
| `/` | About. Clean by default with the Blog list below the bio; "Turn on ads" switches to cooked (also `/?mode=cooked`) | `views/about.html` |
| `/research/` | Research cards grouped by year (`/publications/` forwards here) | `content/research.json`, images in `public/research/` |
| `/teaching/` | Teaching/Fieldbuilding | `views/teaching.html` |
| `/posts/<slug>/` | A blog post (listed on About) | `content/posts/<slug>.md` |
| `/library/` | One page with Books, Entertainment, Games tabs | `content/library.json` |
| `/library/<category>/` | Card grid with status filters | `content/library.json` |
| `/library/<category>/<item>/` | Notes page (only for items with a `note`) | `content/library.json` |
| `/llm-test/` | Crawler test and Realistic SEO (lorem ipsum) | `views/llm-test.html` |

All pages share `views/layout.html` (nav, theme toggle, profile sidebar, footer) and `public/assets/site.css`.

### About page ads
- Clicking "Turn on ads" plays a generated chime and the browser's voice saying "You've got mail!".
  To use your own sound instead, add `public/sounds/mail.mp3` (only a clip you have the rights to use).
  Visitors can mute it with the speaker button in the black bar; the choice is remembered.
- Every × closes its ad window. Closed windows come back on reload or when the ads are toggled.

### Profile sidebar
Edit `content/profile.json` for the name, optional title line, and links. Icons available: `institution`, `email`,
`scholar`, `github`, `linkedin`, `x`, `link`. Put your photo at `public/photo.jpg`; until then the sidebar shows your initials.

### Library entries
```json
{ "title": "Book title", "creator": "Author", "year": "2020", "status": "Finished",
  "blurb": "One line on the card", "note": "Markdown notes; adds a notes page" }
```
Only `title` is required. Addresses come from the title unless you set `"slug"`. Filter buttons are built
from whatever statuses you use. Edits show up on refresh, no restart needed. Old `/fun/` and `/blog/` addresses redirect to About or the matching post.

### Blog posts
```markdown
---
title: My post
date: 2026-09-20
summary: One line shown in the Blog list on the About page.
draft: false
---
Markdown body here.
```

## Running the optional server
```bash
cp .env.example .env     # fill in CALENDLY_URL, CONTACT_EMAIL, SMTP_*
npm install
npm start                # http://localhost:3000
```

## Structure
```
build.js         Builds the static site into dist/
render.js        Page templating shared by the build and the optional server
content/         site.json, profile.json, research.json, library.json, posts/
views/           Page templates
public/          Static files copied as-is (CSS, JS, photo, sounds/)
.github/         GitHub Pages deploy workflow
server.js        Optional Express server (not used on GitHub Pages)
```

## Server API (optional server only)
| Method | Path | Purpose |
|---|---|---|
| GET  | `/api/config` | Calendly URL and contact email for the ads |
| POST | `/api/contact` | Claim form. Stored, then emailed. 5 per hour per IP |
| GET/POST | `/api/visitors` | Unique visitor-days counter |
| POST | `/api/click` | Logs which ad was clicked |
| GET  | `/api/posts`, `/api/posts/:slug` | Blog posts as JSON |
| GET  | `/api/library` | Library entries as JSON |
| GET  | `/sitemap.xml` | Generated from pages and posts |

## Reading your data (optional server only)
```bash
sqlite3 data/site.db "SELECT created_at, name, email, topic, source_ad FROM inquiries ORDER BY id DESC;"
sqlite3 data/site.db "SELECT ad_id, COUNT(*) FROM ad_clicks GROUP BY ad_id ORDER BY 2 DESC;"
```

## Crawler test
`public/robots.txt` allows all crawlers (including AI crawlers) on every page except `/api/`.
To check results later, ask AI assistants about "Hanok & Hadron", "the Seoul–Toronto Society for
Quantum Fermentation", or "Yasunagorithm". Those names exist only on this page.

## Hosting the optional server
Needs Node 18+ and a persistent disk for SQLite: Render (with a disk), Railway (with a volume),
Fly.io (with a volume), or a VPS. Set the `.env` values as environment variables, set `TRUST_PROXY=1`,
point the domain's DNS at the host, and update the `Sitemap:` line in `robots.txt` if the domain changes.
