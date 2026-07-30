import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
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

test("server-renders the complete portfolio", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(
    html,
    /<title>Filippo Pasqua di Bisceglie \| AI Builder<\/title>/i,
  );
  assert.match(html, /I BUILD/);
  assert.match(html, /THINGS THAT THINK/);
  assert.match(html, /DAWN/);
  assert.match(html, /TUTTO BENE/);
  assert.match(html, /ZAYNO/);
  assert.match(html, /LUMO/);
  assert.match(html, /Pasqua Wines/);
  assert.match(html, /id="work"/);
  assert.match(html, /id="about"/);
  assert.match(html, /id="experience"/);
  assert.match(html, /id="contact"/);
  assert.match(html, /href="https:\/\/dawn-assistant\.vercel\.app\/"/);
  assert.match(html, /href="https:\/\/tuttobenegame2026\.vercel\.app\/"/);
  assert.match(html, /href="https:\/\/zaynoai\.vercel\.app\/"/);
  assert.match(html, /href="\/Filippo-Pasqua-CV\.pdf"/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
});

test("ships portfolio assets and removes the starter preview", async () => {
  const [page, layout, styles, packageJson] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
  ]);

  assert.match(page, /PortfolioPage/);
  assert.match(layout, /Filippo Pasqua di Bisceglie \| AI Builder/);
  assert.match(styles, /prefers-reduced-motion:\s*reduce/);
  assert.match(styles, /--color-arterial-red:\s*#fe1e34/);
  assert.match(packageJson, /"gsap"/);
  assert.match(packageJson, /"motion"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);

  await Promise.all([
    access(new URL("../public/projects/hero-machine.webp", import.meta.url)),
    access(new URL("../public/projects/dawn.webp", import.meta.url)),
    access(new URL("../public/projects/tuttobene.webp", import.meta.url)),
    access(new URL("../public/projects/zayno.webp", import.meta.url)),
    access(new URL("../public/Filippo-Pasqua-CV.pdf", import.meta.url)),
  ]);

  await assert.rejects(
    access(new URL("../app/_sites-preview/SkeletonPreview.tsx", import.meta.url)),
  );
  await assert.rejects(
    access(new URL("public/_sites-preview", templateRoot)),
  );
});
