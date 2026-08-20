import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";

/**
 * vinext self-hosts Google Fonts under `.vinext/fonts` and is supposed to
 * rewrite those absolute disk paths to `/assets/_vinext_fonts/...` before
 * they hit the bundle. On Nitro/Vercel builds that rewrite sometimes does
 * not run for the SSR-injected <style>/<link> tags, so production HTML
 * still points at the build machine path and browsers fall back to system
 * fonts. This plugin force-rewrites any leaked absolute `.vinext/fonts`
 * references to the served URL namespace.
 */
export function fixVinextFontUrls(): Plugin {
  const rewrite = (source: string) =>
    source.replace(/\/[^\s"'()]*\.vinext\/fonts/g, "/assets/_vinext_fonts");

  const patchTree = async (directory: string) => {
    let entries;
    try {
      entries = await readdir(directory, { withFileTypes: true });
    } catch {
      return;
    }

    await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(directory, entry.name);
        if (entry.isDirectory()) {
          await patchTree(fullPath);
          return;
        }

        if (!/\.(html|js|mjs|css|json)$/.test(entry.name)) return;

        const original = await readFile(fullPath, "utf8");
        const next = rewrite(original);
        if (next !== original) {
          await writeFile(fullPath, next, "utf8");
        }
      }),
    );
  };

  return {
    name: "fix-vinext-font-urls",
    enforce: "post",
    transform(code, id) {
      if (!code.includes(".vinext/fonts")) return null;
      if (!/\.(tsx?|jsx?|mjs|css)($|\?)/.test(id) && !id.includes("\0")) {
        return null;
      }
      const next = rewrite(code);
      return next === code ? null : next;
    },
    renderChunk(code) {
      if (!code.includes(".vinext/fonts")) return null;
      const next = rewrite(code);
      return next === code ? null : { code: next, map: null };
    },
    async writeBundle(outputOptions) {
      if (!outputOptions.dir) return;
      await patchTree(outputOptions.dir);
    },
    async closeBundle() {
      // Nitro writes the final Vercel output after Vite environments finish.
      await patchTree(path.resolve(process.cwd(), ".vercel/output"));
      await patchTree(path.resolve(process.cwd(), "dist"));
    },
  };
}
