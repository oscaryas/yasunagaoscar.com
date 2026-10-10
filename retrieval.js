// Lightweight BM25 retrieval over knowledge/*.md, split on "## " headings.
const fs = require("fs");
const path = require("path");

const STOP = new Set(("the and for are but not you your with this that from have has was were what when where who why how " +
  "does did his her him its about into than then them they their there which will would could should can oscar").split(" "));

// Crude suffix stripping so "teaches", "teaching" and "teach" match.
const stem = (w) => {
  if (w.length > 4 && w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (w.length > 5 && w.endsWith("ing")) return w.slice(0, -3);
  if (w.length > 4 && w.endsWith("ed")) return w.slice(0, -2);
  if (w.length > 4 && /(ch|sh|x|ss)es$/.test(w)) return w.slice(0, -2);
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
};

const tokens = (s) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9\s-]/g, " ").split(/[\s-]+/)
    .filter((w) => w.length > 2 && !STOP.has(w)).map(stem);

function buildIndex(dir) {
  const chunks = [];
  for (const f of fs.readdirSync(dir).filter((f) => f.endsWith(".md")).sort()) {
    const raw = fs.readFileSync(path.join(dir, f), "utf8").replace(/<!--[\s\S]*?-->/g, "");
    const titleMatch = raw.match(/^#\s+(.+)$/m);
    const docTitle = titleMatch ? titleMatch[1].trim() : f;
    const parts = raw.split(/^##\s+/m);
    parts.forEach((part, i) => {
      const text = (i === 0 ? part.replace(/^#\s+.+$/m, "") : part).trim();
      if (!text) return;
      const heading = i === 0 ? "Overview" : text.split("\n")[0].trim();
      const body = i === 0 ? text : text.split("\n").slice(1).join("\n").trim();
      chunks.push({ file: f, pinned: f.startsWith("00-") && i === 0, label: `${docTitle} > ${heading}`, text: body, toks: tokens(`${heading} ${body}`) });
    });
  }
  const df = new Map();
  for (const c of chunks) for (const t of new Set(c.toks)) df.set(t, (df.get(t) || 0) + 1);
  const avgLen = chunks.reduce((a, c) => a + c.toks.length, 0) / Math.max(chunks.length, 1);
  return { chunks, df, avgLen };
}

function retrieve(index, query, { k = 4, maxChars = 6000 } = {}) {
  const { chunks, df, avgLen } = index;
  const N = chunks.length;
  const qt = [...new Set(tokens(query))];
  const k1 = 1.4, b = 0.75;
  const scored = chunks.map((c) => {
    let s = 0;
    for (const t of qt) {
      const tf = c.toks.filter((x) => x === t).length;
      if (!tf) continue;
      const idf = Math.log(1 + (N - df.get(t) + 0.5) / (df.get(t) + 0.5));
      s += idf * ((tf * (k1 + 1)) / (tf + k1 * (1 - b + (b * c.toks.length) / avgLen)));
    }
    return { c, s };
  });
  // Always include pinned overview chunks so basic questions work.
  const picked = scored.filter((x) => x.c.pinned);
  scored.filter((x) => !x.c.pinned && x.s > 0).sort((a, b) => b.s - a.s).slice(0, k).forEach((x) => picked.push(x));
  let out = "";
  for (const { c } of picked) {
    const block = `[${c.label}]\n${c.text}\n\n`;
    if (out.length + block.length > maxChars) break;
    out += block;
  }
  return out.trim() || "(no information available)";
}

module.exports = { buildIndex, retrieve, tokens };
