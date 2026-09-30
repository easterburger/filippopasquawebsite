"use client";

import PixelTrail from "./PixelTrail";
import { useCursorMode } from "./cursor-mode";

/** The site-wide pixel trail, unless the visitor picked something else. */
export default function CursorTrail() {
  return useCursorMode() === "pixel" ? <PixelTrail /> : null;
}
