import type { OpenGeometry } from "./OpenBookOverlay";
import type { BookDef } from "./types";

/** Where an opened book sits and how big it gets, from the shelf slot it
 *  was pulled from and the viewport. */
export function computeGeometry(book: BookDef, rect: DOMRect): OpenGeometry {
  const wr = book.size.wr ?? 0.72;
  const vw = window.innerWidth;
  const vh = window.innerHeight;

  // Phone: strong single-page reading. Tablet portrait: large single page.
  // Tablet landscape / small laptop: modest spread. Desktop: full spread.
  const mode =
    vw < 640 ? "phone" : vw < 900 || (vw < 1024 && vh > vw) ? "tablet" : "desktop";

  // Leave room for close, pager, sound toggle, and iOS safe areas.
  const usableH = vh - (mode === "phone" ? 112 : 96);

  let H: number;
  let W: number;
  let shift: number;

  if (vh < 520 && mode !== "phone") {
    // Landscape phones: a spread would shrink each page to a sliver, so show
    // one wide page instead (its text scrolls if it has to).
    H = usableH * 0.94;
    W = Math.min(vw * 0.56, 460);
    shift = 0;
  } else if (mode === "phone") {
    W = Math.min(vw * 0.92, 400);
    H = Math.min(W / wr, usableH * 0.88);
    W = H * wr;
    shift = 0;
  } else if (mode === "tablet") {
    // Prefer a readable single page when the two-page spread would shrink
    // each leaf below a comfortable size.
    const spreadPageCap = Math.min(vw * 0.4, 420);
    const singleCap = Math.min(vw * 0.72, 480);
    const useSingle = spreadPageCap < 300 || vw < 820;

    if (useSingle) {
      W = Math.min(singleCap, usableH * wr * 0.9);
      H = Math.min(W / wr, usableH * 0.9);
      W = H * wr;
      shift = 0;
    } else {
      H = Math.min(usableH * 0.88, 700);
      W = H * wr;
      if (W > spreadPageCap) {
        W = spreadPageCap;
        H = W / wr;
      }
      shift = W / 2;
    }
  } else {
    H = Math.min(usableH * 0.94, 820);
    W = H * wr;
    const maxW = Math.min(vw * 0.47, 580);
    if (W > maxW) {
      W = maxW;
      H = W / wr;
    }
    shift = W / 2;
  }

  const D = Math.max(14, Math.min(58, book.size.d * (H / book.size.h)));

  return {
    dx: rect.left + rect.width / 2 - vw / 2,
    dy: rect.top + rect.height / 2 - vh / 2,
    scale: rect.height / H,
    W,
    H,
    D,
    shift,
  };
}
