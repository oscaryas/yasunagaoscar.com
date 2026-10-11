// Page rendering with no dependencies: views/layout.html wraps views/<page>.html.
const fs = require("fs");
const path = require("path");

const VIEWS = path.join(__dirname, "views");
const CONTENT = path.join(__dirname, "content");

const NAV = [
  { href: "/", label: "About", key: "about" },
  { href: "/cv/", label: "CV", key: "cv" },
  { href: "/research/", label: "Research", key: "research" },
  { href: "/teaching/", label: "Teaching + Fieldbuilding", key: "teaching" },
  { href: "/library/", label: "Library", key: "library" },
  { href: "/llm-test/", label: "LLM Test", key: "llm-test" },
];

const siteConfig = () => JSON.parse(fs.readFileSync(path.join(CONTENT, "site.json"), "utf8"));

const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const read = (f) => fs.readFileSync(path.join(VIEWS, f), "utf8");

// Replace {{key}} with values; function replacer avoids "$" pattern surprises.
const fill = (tpl, vars) => tpl.replace(/\{\{(\w+)\}\}/g, (m, k) => (k in vars ? vars[k] : m));

// ---------- Profile sidebar (content/profile.json) ----------
const ICONS = {
  institution: '<path d="M12 3 3 8v2h18V8l-9-5Zm-7 9v6H4v2h16v-2h-1v-6h-2v6h-3v-6h-2v6H9v-6H7v6H6v-6H5Z" fill="currentColor"/>',
  email: '<path d="M3 5h18v14H3V5Zm2 2v.5l7 4.5 7-4.5V7H5Zm14 2.9-7 4.5-7-4.5V17h14V9.9Z" fill="currentColor"/>',
  scholar: '<path d="M12 3 1 9.5l4 2.35V16c0 2.2 3.1 4 7 4s7-1.8 7-4v-4.15l4-2.35L12 3Zm0 7.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7Z" fill="currentColor"/>',
  github: '<path d="M12 2a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.61.07-.61 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.64 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.39.1 2.64.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 12 2Z" fill="currentColor"/>',
  linkedin: '<path d="M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm3 7v8h2.5v-8H7Zm1.25-4a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8ZM11 10v8h2.5v-4.2c0-1.1.4-1.9 1.5-1.9s1.5.8 1.5 2V18H19v-4.8c0-2.4-1.2-3.4-3-3.4a2.8 2.8 0 0 0-2.5 1.3V10H11Z" fill="currentColor"/>',
  x: '<path d="M17.8 3h3.1l-6.8 7.8 8 10.2h-6.3l-4.9-6.4L5.3 21H2.2l7.3-8.3L1.8 3h6.4l4.4 5.9L17.8 3Zm-1.1 16.2h1.7L7.4 4.7H5.6l11.1 14.5Z" fill="currentColor"/>',
  link: '<path d="M10.6 13.4a1 1 0 0 1 0-1.4l3.5-3.5a1 1 0 1 1 1.4 1.4L12 13.4a1 1 0 0 1-1.4 0Zm-3.5 6.4a4 4 0 0 1-2.9-6.8l2.5-2.5a1 1 0 1 1 1.4 1.4l-2.5 2.5a2 2 0 0 0 2.9 2.9l2.5-2.5a1 1 0 1 1 1.4 1.4L9.9 18.6a4 4 0 0 1-2.8 1.2Zm9.3-5.8a1 1 0 0 1-.7-1.7l2.5-2.5a2 2 0 0 0-2.9-2.9l-2.5 2.5a1 1 0 1 1-1.4-1.4l2.5-2.5a4 4 0 0 1 5.7 5.7l-2.5 2.5a1 1 0 0 1-.7.3Z" fill="currentColor"/>',
};

function sidebarHtml() {
  const p = JSON.parse(fs.readFileSync(path.join(CONTENT, "profile.json"), "utf8"));
  const photoFile = p.photo ? path.join(__dirname, "public", p.photo.replace(/^\//, "")) : "";
  const initials = p.name.split(/\s+/).map((w) => w[0]).join("").slice(0, 2).toUpperCase();
  const photo = photoFile && fs.existsSync(photoFile)
    ? `<img class="profile-photo" src="${esc(p.photo)}" alt="${esc(p.name)}" width="200" height="200">`
    : `<div class="profile-photo profile-initials" aria-hidden="true">${esc(initials)}</div>`;
  const links = (p.links || [])
    .map((l) => {
      const external = /^https?:/.test(l.url) ? ' rel="noopener"' : "";
      return `<li><a href="${esc(l.url)}"${external}><svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[l.icon] || ICONS.link}</svg><span>${esc(l.label)}</span></a></li>`;
    })
    .join("");
  return `<aside class="profile" aria-label="About Oscar">
    ${photo}
    <p class="profile-name">${esc(p.name)}</p>
    ${p.title ? `<p class="profile-title">${esc(p.title)}</p>` : ""}
    <ul class="profile-links">${links}</ul>
  </aside>`;
}

function renderPage(view, { title, description, active, bodyClass = "", vars = {} }) {
  const navLinks = NAV.map(
    (n) => `<li><a href="${n.href}"${n.key === active ? ' aria-current="page"' : ""}${n.external ? ' target="_blank" rel="noopener"' : ""}>${n.label}</a></li>`
  ).join("");
  const content = fill(read(`${view}.html`), vars);
  return fill(read("layout.html"), {
    title: esc(title),
    description: esc(description),
    bodyClass: esc(bodyClass),
    navLinks,
    sidebar: sidebarHtml(),
    repoUrl: esc(siteConfig().repoUrl),
    content,
  });
}

// ---------- Publications ----------
const ME = "Oscar Yasunaga";
function renderAuthors(list) {
  return list.map((a) => (a.replace(/\*$/, "") === ME ? `<b>${esc(a)}</b>` : esc(a))).join(", ");
}
// ---------- Blog posts (Markdown with simple frontmatter) ----------
const POSTS = path.join(CONTENT, "posts");
const SLUG = /^[a-z0-9-]{1,80}$/;

function parsePost(file) {
  const raw = fs.readFileSync(path.join(POSTS, file), "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  const meta = {};
  if (m) {
    m[1].split(/\r?\n/).forEach((line) => {
      const i = line.indexOf(":");
      if (i > 0) meta[line.slice(0, i).trim()] = line.slice(i + 1).trim().replace(/^["']|["']$/g, "");
    });
  }
  return {
    slug: file.replace(/\.md$/, ""),
    title: meta.title || file,
    date: meta.date || "",
    summary: meta.summary || "",
    draft: meta.draft === "true",
    body: m ? m[2] : raw,
  };
}

function listPosts() {
  if (!fs.existsSync(POSTS)) return [];
  return fs
    .readdirSync(POSTS)
    .filter((f) => f.endsWith(".md") && SLUG.test(f.slice(0, -3)))
    .map(parsePost)
    .filter((p) => !p.draft)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

function getPost(slug) {
  if (!SLUG.test(slug)) return null;
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(POSTS, file))) return null;
  const p = parsePost(file);
  return p.draft ? null : p;
}

function postListHtml(posts) {
  if (!posts.length) return "<p>No posts yet.</p>";
  return `<ul class="post-list">${posts
    .map(
      (p) => `<li><a href="/posts/${p.slug}/">${esc(p.title)}</a><div class="meta">${esc(p.date)}</div>${
        p.summary ? `<div>${esc(p.summary)}</div>` : ""
      }</li>`
    )
    .join("")}</ul>`;
}

// ---------- Library (content/library.json) ----------
const LIBRARY_FILE = path.join(CONTENT, "library.json");

const slugify = (s) =>
  String(s).toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "")
    .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80) || "item";

// Stable colour per title so a card keeps its colour between visits
const SPINES = ["#7a2e2e", "#2f4f6f", "#3d5a3d", "#6b4f2a", "#4a3a6b", "#2e5e5e", "#7a4a1f", "#5a2e4f", "#1f3f5a", "#5c5c2e"];
const spineColour = (s) => {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return SPINES[h % SPINES.length];
};

// Reads fresh on every request so edits show up without a restart
function loadLibrary() {
  const data = JSON.parse(fs.readFileSync(LIBRARY_FILE, "utf8"));
  for (const cat of data.categories) {
    if (!SLUG.test(cat.slug)) throw new Error(`Bad category slug: ${cat.slug}`);
    const seen = new Set();
    cat.items = (cat.items || []).map((it) => {
      let slug = it.slug || slugify(it.title);
      while (seen.has(slug)) slug += "-2";
      seen.add(slug);
      return { ...it, slug, hasNote: Boolean(it.note && String(it.note).trim()) };
    });
  }
  return data;
}

const getCategory = (lib, slug) => lib.categories.find((c) => c.slug === slug) || null;

function libraryIndexHtml(lib) {
  return `<div class="tiles">${lib.categories
    .map(
      (c) => `<a class="tile" href="/library/${c.slug}/">
  <span class="tile-icon" aria-hidden="true">${esc(c.icon || "")}</span>
  <span class="tile-name">${esc(c.name)}</span>
  <span class="tile-count">${c.items.length} ${c.items.length === 1 ? "entry" : "entries"}</span>
</a>`
    )
    .join("")}</div>`;
}

function cardHtml(cat, it) {
  const inner = `<span class="spine" style="--spine:${spineColour(it.title)}"><span class="spine-title">${esc(it.title)}</span></span>
  <span class="card-body">
    <span class="card-title">${esc(it.title)}</span>
    ${it.creator ? `<span class="card-creator">${esc(it.creator)}</span>` : ""}
    <span class="card-meta">${[it.year, it.status].filter(Boolean).map(esc).join("&ensp;")}</span>
    ${it.blurb ? `<span class="card-blurb">${esc(it.blurb)}</span>` : ""}
  </span>`;
  const attrs = `data-status="${esc(it.status || "")}" data-read="${esc(it.read || "")}"`;
  return it.hasNote
    ? `<a class="card has-note" href="/library/${cat.slug}/${it.slug}/" ${attrs}>${inner}<span class="card-note-flag">Notes</span></a>`
    : `<div class="card" ${attrs}>${inner}</div>`;
}

function listItemHtml(cat, it) {
  const attrs = `data-status="${esc(it.status || "")}" data-read="${esc(it.read || "")}"`;
  const title = it.hasNote
    ? `<a class="li-title" href="/library/${cat.slug}/${it.slug}/">${esc(it.title)}</a>`
    : `<span class="li-title">${esc(it.title)}</span>`;
  const meta = [it.creator, it.status].filter(Boolean).map(esc).join(" · ");
  return `<li class="lib-item" ${attrs}>${title}${meta ? `<span class="li-meta">${meta}</span>` : ""}${it.blurb ? `<span class="li-blurb">${esc(it.blurb)}</span>` : ""}</li>`;
}

function libraryCategoryHtml(cat) {
  const list = cat.layout === "list";
  const group = (items) => list
    ? `<ul class="lib-list">${items.map((it) => listItemHtml(cat, it)).join("")}</ul>`
    : `<div class="cards">${items.map((it) => cardHtml(cat, it)).join("")}</div>`;
  const byYear = cat.items.some((i) => i.read);
  const key = byYear ? "read" : "status";
  const values = [...new Set(cat.items.map((i) => i[key]).filter(Boolean))];
  if (byYear) values.sort((a, b) => String(b).localeCompare(String(a)));
  const filters = values.length > 1
    ? `<div class="filters" role="group" aria-label="Filter by ${byYear ? "year" : "status"}" data-key="${key}">
  <button type="button" class="filter" aria-pressed="true" data-filter="">All</button>
  ${values.map((s) => `<button type="button" class="filter" aria-pressed="false" data-filter="${esc(s)}">${esc(s)}</button>`).join("")}
</div>`
    : "";
  if (!cat.items.length) return `<p>Nothing here yet. Add entries to <code>content/library.json</code>.</p>`;
  if (!byYear) return filters + group(cat.items);
  const groups = new Map();
  for (const it of cat.items) {
    const y = it.read || "Undated";
    if (!groups.has(y)) groups.set(y, []);
    groups.get(y).push(it);
  }
  const years = [...groups.keys()].sort((a, b) => String(b).localeCompare(String(a)));
  const sections = years
    .map((y) => `<section class="rs-year lib-year" data-read="${esc(y)}" aria-labelledby="y${esc(y)}">
  <h2 id="y${esc(y)}" class="rs-year-h">${esc(y)}</h2>
  ${group(groups.get(y))}
</section>`)
    .join("\n");
  return filters + sections;
}

// Blog posts rendered as cooked ad windows on the About page
function adPostsHtml(posts) {
  return posts
    .map((p) => `      <article class="win ad ad-post span-6" aria-labelledby="post-${esc(p.slug)}">
        <div class="win-title"><span>📢 ${esc(p.date)}</span><span class="btns"><button type="button" class="xbtn win-close" aria-label="Close this ad">×</button></span></div>
        <div class="win-body">
          <h2 id="post-${esc(p.slug)}"><a href="/posts/${p.slug}/">${esc(p.title)}</a></h2>
          ${p.summary ? `<p>${esc(p.summary)}</p>` : ""}
          <a class="btn go" data-ad="post-${esc(p.slug)}" href="/posts/${p.slug}/">Read more!!!</a>
        </div>
      </article>`)
    .join("\n");
}

// ---------- Research (content/research.json) ----------
function researchHtml() {
  const data = JSON.parse(fs.readFileSync(path.join(CONTENT, "research.json"), "utf8"));
  let anyStar = false;
  const card = (p) => {
    if ((p.authors || []).some((a) => a.endsWith("*"))) anyStar = true;
    const authors = p.authors && p.authors.length ? `<p class="rs-authors">${renderAuthors(p.authors)}</p>` : "";
    const pills = (p.pills || [])
      .map((x) => `<span class="pill pill-${esc(x.tone || "muted")}">${esc(x.label)}</span>`)
      .join("");
    const links = Object.entries(p.links || {})
      .map(([k, v]) => `<a href="${esc(v)}">${esc(k)}</a>`)
      .join('<span aria-hidden="true"> / </span>');
    const media = p.image
      ? `<div class="rs-media"><img src="${esc(p.image)}" alt="${esc(p.imageAlt || "")}" loading="lazy"></div>`
      : "";
    return `<article class="rs-card${p.image ? "" : " no-media"}">
  ${media}
  <div class="rs-body">
    <h3 class="rs-title">${esc(p.title)}</h3>
    ${authors}
    ${pills ? `<div class="rs-pills">${pills}</div>` : ""}
    ${links ? `<p class="rs-links">${links}</p>` : ""}
  </div>
</article>`;
  };
  const html = data.years
    .map((y) => `<section class="rs-year" aria-labelledby="y${esc(y.year)}">
  <h2 id="y${esc(y.year)}" class="rs-year-h">${esc(y.year)}</h2>
  ${y.items.map(card).join("\n")}
</section>`)
    .join("\n");
  return { research: html + (anyStar ? '\n<p class="pub-note">* Equal contribution</p>' : "") };
}

module.exports = {
  researchHtml,
  adPostsHtml, sidebarHtml, siteConfig,
  renderPage, listPosts, getPost, postListHtml, esc, NAV,
  loadLibrary, getCategory, libraryIndexHtml, libraryCategoryHtml,
};
