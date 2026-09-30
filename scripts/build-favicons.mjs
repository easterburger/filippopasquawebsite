// Rebuilds the favicons from the FP balloon art in app/components/balloon-art.ts:
// public/favicon.svg, public/favicon.ico (16 + 32 + 48) and
// public/apple-touch-icon.png (180, on the site's paper colour).
// Run with: node scripts/build-favicons.mjs
import { readFileSync, writeFileSync } from "node:fs";
import sharp from "sharp";

const source = readFileSync(new URL("../app/components/balloon-art.ts", import.meta.url), "utf8");
const letters = source.match(/BALLOON_LETTERS =\s*"([^"]+)"/)[1];
const viewBox = source.match(/BALLOON_VIEWBOX = "([^"]+)"/)[1];
const template = source.slice(source.indexOf("return `") + "return `".length, source.lastIndexOf("`;"));
const svg = template
  .replaceAll("${BALLOON_LETTERS}", letters)
  .replaceAll("${BALLOON_VIEWBOX}", viewBox)
  .replace("${dimensions}", "");

const publicDir = new URL("../public/", import.meta.url);
writeFileSync(new URL("favicon.svg", publicDir), `${svg}\n`);

// Square, transparent renders with a little breathing room.
async function square(size, background = { r: 0, g: 0, b: 0, alpha: 0 }, pad = 0.06) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await sharp(Buffer.from(svg), { density: 600 })
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: "center" }])
    .png()
    .toBuffer();
}

await sharp(await square(180, { r: 241, g: 239, b: 230, alpha: 1 }, 0.14)).toFile(
  new URL("apple-touch-icon.png", publicDir).pathname,
);

// ICO with PNG-encoded images (supported by every current browser).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => square(size)));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt8(0, entry + 2);
  header.writeUInt8(0, entry + 3);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[index].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
});
writeFileSync(new URL("favicon.ico", publicDir), Buffer.concat([header, ...images]));
console.log("favicons written");
