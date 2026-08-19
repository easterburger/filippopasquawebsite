"use client";

import type { CSSProperties, FocusEvent, PointerEvent } from "react";
import { useState } from "react";

export const MELT_GOO_FILTER_ID = "melt-goo";

const MELT_BLOBS = [0, 1, 2, 3, 4, 5];
const MELT_FALLBACK = { x: 50, y: 50, reach: 90 };

/* Distance from the pointer to the furthest corner, so the liquid needs the
   whole animation to reach the far side no matter where the cursor entered. */
function meltStateFrom(target: HTMLElement, clientX: number, clientY: number) {
  const rect = target.getBoundingClientRect();
  const x = clientX - rect.left;
  const y = clientY - rect.top;

  return {
    x: (x / rect.width) * 100,
    y: (y / rect.height) * 100,
    reach: Math.max(
      Math.hypot(x, y),
      Math.hypot(rect.width - x, y),
      Math.hypot(x, rect.height - y),
      Math.hypot(rect.width - x, rect.height - y),
    ),
  };
}

/** Spread the props onto a button that renders <MeltLayer /> as its first child. */
export function useMeltFill() {
  const [melt, setMelt] = useState(MELT_FALLBACK);
  const [isMelting, setIsMelting] = useState(false);

  const stopMelt = () => setIsMelting(false);

  return {
    "data-melting": isMelting ? "true" : undefined,
    style: {
      "--melt-x": `${melt.x}%`,
      "--melt-y": `${melt.y}%`,
      "--melt-reach": `${melt.reach}px`,
    } as CSSProperties,
    onPointerEnter: (event: PointerEvent<HTMLElement>) => {
      setMelt(meltStateFrom(event.currentTarget, event.clientX, event.clientY));
      setIsMelting(true);
    },
    onPointerLeave: stopMelt,
    onPointerCancel: stopMelt,
    onBlur: stopMelt,
    onFocus: (event: FocusEvent<HTMLElement>) => {
      if (!event.currentTarget.matches(":focus-visible")) return;

      const rect = event.currentTarget.getBoundingClientRect();

      setMelt(
        meltStateFrom(
          event.currentTarget,
          rect.left + rect.width / 2,
          rect.top + rect.height / 2,
        ),
      );
      setIsMelting(true);
    },
  };
}

export function MeltLayer() {
  return (
    <span className="hero-action-melt" aria-hidden="true">
      {MELT_BLOBS.map((blob) => (
        <span key={blob} className="hero-action-melt-blob" />
      ))}
    </span>
  );
}

/** Every melting button references this by id, so render it once per page. */
export function MeltGooFilter() {
  return (
    <svg className="melt-goo-defs" aria-hidden="true" focusable="false">
      <filter
        id={MELT_GOO_FILTER_ID}
        x="-60%"
        y="-60%"
        width="220%"
        height="220%"
        colorInterpolationFilters="sRGB"
      >
        <feGaussianBlur in="SourceGraphic" stdDeviation="7" result="melt" />
        {/* Thresholding the blurred alpha fuses the blobs into one liquid edge. */}
        <feColorMatrix
          in="melt"
          type="matrix"
          values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 26 -12"
        />
      </filter>
    </svg>
  );
}
