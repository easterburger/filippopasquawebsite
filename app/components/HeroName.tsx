"use client";

import { useEffect, useRef, useState } from "react";

import HeatWord from "./HeatMap";

// The home page's headline: just the name, large and bowed along an arc, in
// ink at rest, melting into a heat map under the cursor. The canvas is
// decoration; the heading underneath carries the name for everyone else.

const NAME = "FILIPPO PASQUA";
const MAX_WIDTH = 1180;
/** How far the name bends; 0 is straight. */
const CURVE = 0.5;
const INK: [number, number, number] = [24, 27, 32];

export default function HeroName({ revealed }: { revealed: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  // The canvas is drawn at its exact size, so it follows the column's width.
  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.round(Math.min(entry.contentRect.width, MAX_WIDTH)));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, []);

  // A bent line needs more height than a straight one; narrow screens more so.
  const height = Math.round(width * (width < 640 ? 0.46 : 0.36));

  return (
    <div ref={boxRef} className="hero-name">
      <h1 id="hero-name" className="sr-only">
        Filippo Pasqua
      </h1>
      {revealed && width > 0 ? (
        <HeatWord shape="Word" word={NAME} width={width} height={height} curve={CURVE} rest={INK} cycle={false} />
      ) : (
        <div style={{ height }} aria-hidden="true" />
      )}
    </div>
  );
}
