// Builds the whole site as static files in dist/ for GitHub Pages.
// Usage: npm run build   (or: node build.js)
const fs = require("fs");
const path = require("path");
const r = require("./render");

const ROOT = __dirname;
const OUT = path.join(ROOT, "dist");
const site = r.siteConfig();
const DESC =
  "Oscar Yasunaga: physics at the University of Toronto, AI safety research on interpretability, sycophancy and generalization, and AI safety teaching.";

// Markdown: use the "marked" package when installed, otherwise a small built-in converter
let md;
try {
  const { marked } = require("marked");
  md = (s) => marked.parse(s);
} catch {
  md = miniMarkdown;
  console.log('Note: "marked" is not installed; using the built-in Markdown converter. Run `npm install` for full Markdown.');
}

function miniMarkdown(src) {
  const inline = (t) =>
    r.esc(t)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<em>$2</em>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>');
  return String(src)
    .replace(/\r\n/g, "\n")
    .trim()
    .split(/\n{2,}/)
    .map((block) => {
      const lines = block.split("\n");
      const h = block.match(/^(#{1,4})\s+(.*)$/);
      if (h && lines.length === 1) return `<h${h[1].length + 1}>${inline(h[2])}</h${h[1].length + 1}>`;
      if (lines.every((l) => /^\s*[-*]\s+/.test(l)))
        return `<ul>${lines.map((l) => `<li>${inline(l.replace(/^\s*[-*]\s+/, ""))}</li>`).join("")}</ul>`;
      if (lines.every((l) => /^\s*\d+\.\s+/.test(l)))
        return `<ol>${lines.map((l) => `<li>${inline(l.replace(/^\s*\d+\.\s+/, ""))}</li>`).join("")}</ol>`;
      return `<p>${inline(lines.join(" "))}</p>`;
    })
    .join("\n");
}

const urls = [];
function write(urlPath, html) {
  const file = urlPath.endsWith("/") ? path.join(OUT, urlPath, "index.html") : path.join(OUT, urlPath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, html);
  if (urlPath.endsWith("/")) urls.push(urlPath);
}
const page = (view, opts) => r.renderPage(view, { description: DESC, ...opts });

// Fresh output folder, with public/ copied in (CSS, JS, photo, sounds...)
fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(path.join(ROOT, "public"), OUT, { recursive: true });

// About
const posts = r.listPosts();
write("/", page("about", {
  title: "Oscar Yasunaga", active: "about", bodyClass: "clean",
  vars: {
    posts: r.postListHtml(posts), adPosts: r.adPostsHtml(posts),
    calendlyUrl: r.esc(site.calendlyUrl), contactEmail: r.esc(site.contactEmail),
  },
}));

// Simple pages
write("/research/", page("research", { title: "Research - Oscar Yasunaga", active: "research", vars: r.researchHtml() }));
// Old address forwards to Research
write("/publications/", page("redirect", { title: "Research - Oscar Yasunaga", active: "research", vars: { to: "/research/" } }).replace("<head>", '<head>\n<meta http-equiv="refresh" content="0; url=/research/">\n<link rel="canonical" href="/research/">'));
urls.splice(urls.indexOf("/publications/"), 1);
write("/teaching/", page("teaching", { title: "Teaching/Fieldbuilding - Oscar Yasunaga", active: "teaching" }));
write("/llm-test/", page("llm-test", { title: "LLM Test - Oscar Yasunaga", active: "llm-test" }));

// Blog posts
for (const p of posts) {
  write(`/posts/${p.slug}/`, page("post", {
    title: `${p.title} - Oscar Yasunaga`, description: p.summary || DESC, active: "about",
    vars: { title: r.esc(p.title), date: r.esc(p.date), body: md(p.body) },
  }));
}

// Library
const lib = r.loadLibrary();
write("/library/", page("library", {
  title: "Library - Oscar Yasunaga", active: "library",
  vars: { intro: r.esc(lib.intro || ""), tiles: r.libraryIndexHtml(lib) },
}));
for (const cat of lib.categories) {
  write(`/library/${cat.slug}/`, page("library-category", {
    title: `${cat.name} - Library - Oscar Yasunaga`, active: "library",
    vars: { name: r.esc(cat.name), intro: cat.intro ? `<p>${r.esc(cat.intro)}</p>` : "", grid: r.libraryCategoryHtml(cat) },
  }));
  for (const it of cat.items.filter((i) => i.hasNote)) {
    write(`/library/${cat.slug}/${it.slug}/`, page("library-item", {
      title: `${it.title} - Library - Oscar Yasunaga`, description: it.blurb || DESC, active: "library",
      vars: {
        catSlug: r.esc(cat.slug), catName: r.esc(cat.name), title: r.esc(it.title),
        meta: [it.creator, it.year, it.status].filter(Boolean).map(r.esc).join("&ensp;·&ensp;"),
        blurb: it.blurb ? `<p class="lede">${r.esc(it.blurb)}</p>` : "",
        note: md(String(it.note)),
      },
    }));
  }
}

// 404 page (GitHub Pages serves 404.html for unknown addresses)
write("/404.html", page("404", { title: "Page not found - Oscar Yasunaga", active: "" }));

// Sitemap, robots.txt, custom domain
const base = `https://${site.domain}`;
write("/sitemap.xml",
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
  urls.map((u) => `  <url><loc>${base}${u}</loc></url>`).join("\n") + `\n</urlset>\n`);
write("/robots.txt", `# All crawlers, including AI crawlers, are welcome.\nUser-agent: *\nAllow: /\n\nSitemap: ${base}/sitemap.xml\n`);
write("/CNAME", `${site.domain}\n`);
fs.writeFileSync(path.join(OUT, ".nojekyll"), "");

// Fail loudly if any template placeholder was left unfilled
const leftovers = [];
(function scan(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) scan(p);
    else if (p.endsWith(".html") && /\{\{\w+\}\}/.test(fs.readFileSync(p, "utf8"))) leftovers.push(path.relative(OUT, p));
  }
})(OUT);
if (leftovers.length) {
  console.error("Unfilled placeholders in:", leftovers.join(", "));
  process.exit(1);
}
console.log(`Built ${urls.length} pages into dist/ for ${site.domain}`);
