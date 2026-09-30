// Rebuilds the favicons from the FP foil balloon image
// (public/hero-assets/fp-balloon.webp): public/favicon.ico (16 + 32 + 48),
// public/icon.png (192) and public/apple-touch-icon.png (180, on the site's
// paper colour). Run with: node scripts/build-favicons.mjs
import { writeFileSync } from "node:fs";
import sharp from "sharp";

const publicDir = new URL("../public/", import.meta.url);
const source = new URL("hero-assets/fp-balloon.webp", publicDir).pathname;
const transparent = { r: 0, g: 0, b: 0, alpha: 0 };

// Square renders with a little breathing room, on a background colour.
async function square(size, background = transparent, pad = 0.04) {
  const inner = Math.round(size * (1 - pad * 2));
  const art = await sharp(source)
    .resize(inner, inner, { fit: "contain", background: transparent, kernel: "lanczos3" })
    .png()
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background } })
    .composite([{ input: art, gravity: "center" }])
    .png()
    .toBuffer();
}

writeFileSync(new URL("icon.png", publicDir), await square(192));
writeFileSync(
  new URL("apple-touch-icon.png", publicDir),
  await square(180, { r: 241, g: 239, b: 230, alpha: 1 }, 0.12),
);

// ICO with PNG-encoded images (supported by every current browser).
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map((size) => square(size, transparent, 0)));
const header = Buffer.alloc(6 + sizes.length * 16);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, index) => {
  const entry = 6 + index * 16;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[index].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[index].length;
});
writeFileSync(new URL("favicon.ico", publicDir), Buffer.concat([header, ...images]));
console.log("favicons written");
