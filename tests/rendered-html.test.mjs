import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the hero-only portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Filippo Pasqua \| Student &amp; Software Developer<\/title>/i,
  );
  assert.doesNotMatch(html, /FILIPPO/);
  assert.match(html, /IB student and software developer from Italy/);
  assert.match(html, /introduction/i);
  assert.match(html, /explore/i);
  // The intro gate server-renders its first greeting; the rest cycle client-side.
  assert.match(html, /class="intro-gate"/);
  assert.match(html, /<span lang="en">Hello<\/span>/);
  assert.match(html, /data-intro-seen|dataset\.introSeen/);
  assert.doesNotMatch(html, /id="contact"/i);
  assert.doesNotMatch(html, /CONTACT ME/);
  assert.doesNotMatch(html, /\/stickers\//);
  assert.doesNotMatch(html, /I(?:&#x27;|')m a bit older now/);
  assert.doesNotMatch(html, /filippo-childhood\.webp/);
  assert.doesNotMatch(html, /FP\s*\/\s*26/);
  assert.doesNotMatch(html, /id="work"|id="about"|id="experience"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("server-renders contact as a dedicated page", async () => {
  const response = await render("/contact");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Contact Filippo Pasqua<\/title>/i);
  assert.match(html, /id="contact"/i);
  assert.match(html, /CONTACT ME/);
  assert.match(html, /Sign up to Filippo(?:&#x27;|')s updates/i);
  assert.match(
    html,
    /https:\/\/www\.linkedin\.com\/in\/filippo-pasqua-di-bisceglie-24761629a\//,
  );
  assert.match(html, /filippo\.pasquadib@gmail\.com/i);
  assert.match(html, /mailto:filippo\.pasquadib@gmail\.com/i);
  assert.doesNotMatch(html, /contact-glass-root|data-glass-target/i);
});

test("preserves the custom assets for later sections", async () => {
  const [page, layout, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /PortfolioPage/);
  assert.match(layout, /Filippo Pasqua \| Student & Software Developer/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /BTC Diamond Wood/);
  assert.match(styles, /--blue:\s*#1266ff/);
  assert.match(styles, /contact-assets\/contact-flowers\.png/);
  assert.match(packageJson, /"motion"/);
  assert.match(packageJson, /"three"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(
      new URL(
        "../public/hero-assets/filippo-childhood.webp",
        import.meta.url,
      ),
    ),
    access(
      new URL("../public/hero-assets/filippo-wordmark.png", import.meta.url),
    ),
    access(
      new URL(
        "../public/fonts/BTCDiamondWoodRegular.woff2",
        import.meta.url,
      ),
    ),
    access(
      new URL(
        "../public/contact-assets/contact-flowers.png",
        import.meta.url,
      ),
    ),
  ]);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
  await assert.rejects(
    access(new URL("public/_sites-preview", templateRoot)),
  );
});
