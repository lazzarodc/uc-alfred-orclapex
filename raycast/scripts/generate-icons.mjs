// Generates one SVG per Font APEX icon into assets/icons/, based on the
// Font APEX CSS + font shipped on the Oracle APEX CDN. Glyph icons are
// rendered from the font; flag icons are downloaded as-is (colored).
//
// Usage: npm run generate-icons [-- --apex=26.1.0 --font-apex=2.5]
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import opentype from "opentype.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const ICONS_JSON = path.resolve(ROOT, "../data/icons.json");
const OUT_DIR = path.join(ROOT, "assets/icons");

const arg = (name, fallback) =>
  process.argv.find((a) => a.startsWith(`--${name}=`))?.split("=")[1] ?? fallback;
const BASE = `https://static.oracle.com/cdn/apex/${arg("apex", "26.1.0")}/libraries/font-apex/${arg("font-apex", "2.5")}`;
const HEADERS = { "User-Agent": "Mozilla/5.0" };

async function fetchOk(url) {
  const res = await fetch(url, { headers: HEADERS });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

/** Map of icon name (e.g. "fa-home") -> codepoint or flag image path. */
function parseCss(css) {
  const glyphs = new Map();
  const images = new Map();
  for (const [, selectors, body] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const content = body.match(/content:\s*"\\([0-9a-f]+)"/i);
    const image = body.match(/background-image:\s*url\(([^)]+\.svg)\)/);
    for (const sel of selectors.split(",")) {
      const name = sel.trim().match(/^\.(fa-[a-z0-9-]+)(?::before)?$/)?.[1];
      if (!name) continue;
      if (content) glyphs.set(name, Number.parseInt(content[1], 16));
      else if (image) images.set(name, image[1].replace(/^\.\.\//, ""));
    }
  }
  return { glyphs, images };
}

function glyphToSvg(font, codepoint) {
  const glyph = font.charToGlyph(String.fromCodePoint(codepoint));
  if (!glyph || glyph.index === 0) return undefined;
  const size = font.unitsPerEm;
  // baseline at the ascender so the em box maps to 0..size
  const d = glyph.getPath(0, font.ascender, size).toPathData(1);
  if (!d) return undefined;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}"><path fill="#000" d="${d}"/></svg>\n`;
}

const { results } = JSON.parse(await readFile(ICONS_JSON, "utf8"));
const names = results[0].items.map((i) => i.name);

const css = await (await fetchOk(`${BASE}/css/font-apex.min.css`)).text();
const { glyphs, images } = parseCss(css);
const fontBuffer = await (await fetchOk(`${BASE}/fonts/Font-APEX-Small.woff`)).arrayBuffer();
const font = opentype.parse(fontBuffer);

await rm(OUT_DIR, { recursive: true, force: true });
await mkdir(OUT_DIR, { recursive: true });

const manifest = {};
const missing = [];
for (const name of names) {
  if (images.has(name)) {
    const svg = await (await fetchOk(`${BASE}/${images.get(name)}`)).text();
    await writeFile(path.join(OUT_DIR, `${name}.svg`), svg);
    manifest[name] = "image";
    continue;
  }
  const svg = glyphs.has(name) ? glyphToSvg(font, glyphs.get(name)) : undefined;
  if (!svg) {
    missing.push(name);
    continue;
  }
  await writeFile(path.join(OUT_DIR, `${name}.svg`), svg);
  manifest[name] = "glyph";
}

// consumed by src/lib/sources.ts to decide tinting / fallback
await writeFile(path.join(ROOT, "src/data/icon-assets.json"), `${JSON.stringify(manifest)}\n`);

const count = (t) => Object.values(manifest).filter((v) => v === t).length;
console.log(`glyphs: ${count("glyph")}, flags: ${count("image")}, missing: ${missing.length}`);
if (missing.length) console.log(missing.join(", "));
