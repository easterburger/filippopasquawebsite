"use client";

import { useEffect, useRef } from "react";

import "./PixelTrail.css";

// Port of React Bits' <PixelTrail />. The original feeds drei's trail texture (a
// 2D canvas) through a WebGL shader that samples it once per grid cell. Sampling
// the same canvas on the CPU gives identical pixels without loading three and
// @react-three/* on every page just for the cursor.

type GooeyFilterConfig = { id: string; strength: number };

type PixelTrailProps = {
  /** Cells across the longer side of the viewport. */
  gridSize?: number;
  /** Trail dot radius, as a fraction of the longer side. */
  trailSize?: number;
  /** Lifetime of a trail point in ms. */
  maxAge?: number;
  /** Extra points inserted between pointer samples on fast moves. */
  interpolate?: number;
  color?: string;
  gooeyFilter?: GooeyFilterConfig | false;
  easingFunction?: (x: number) => number;
};

type TrailPoint = { x: number; y: number; age: number; force: number };

// Mirrors drei's TrailTexture defaults that React Bits doesn't override.
const INTENSITY = 0.2;
const MIN_FORCE = 0.3;
// Texels per grid cell; only cell centres are read, so this just needs to be
// fine enough that each centre lands inside the right gradient.
const TEXELS_PER_CELL = 4;
const ENABLED_QUERY =
  "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

const identityEase = (x: number) => x;

function toRgb(color: string): [number, number, number] {
  const probe = document.createElement("canvas").getContext("2d");
  if (!probe) return [255, 255, 255];
  probe.fillStyle = color;
  probe.fillRect(0, 0, 1, 1);
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
  return [r, g, b];
}

function GooeyFilter({ id, strength }: GooeyFilterConfig) {
  return (
    <svg className="pixel-trail-goo" aria-hidden="true" focusable="false">
      <defs>
        <filter id={id}>
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={strength}
            result="blur"
          />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 19 -9"
            result="goo"
          />
          <feComposite in="SourceGraphic" in2="goo" operator="atop" />
        </filter>
      </defs>
    </svg>
  );
}

export default function PixelTrail({
  gridSize = 50,
  trailSize = 0.1,
  maxAge = 250,
  interpolate = 5,
  color = "#ffffff",
  gooeyFilter = { id: "pixel-trail-goo", strength: 2 },
  easingFunction = identityEase,
}: PixelTrailProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const media = window.matchMedia(ENABLED_QUERY);
    let stop: (() => void) | null = null;

    const start = () => {
      const pixelCtx = canvas.getContext("2d");
      const trailCanvas = document.createElement("canvas");
      const trailCtx = trailCanvas.getContext("2d", {
        willReadFrequently: true,
      });
      if (!pixelCtx || !trailCtx) return () => {};

      const size = gridSize * TEXELS_PER_CELL;
      trailCanvas.width = trailCanvas.height = size;
      canvas.width = canvas.height = gridSize;
      const pixels = pixelCtx.createImageData(gridSize, gridSize);
      const [red, green, blue] = toRgb(color);

      // The grid covers a square the size of the viewport's longer side,
      // centred, like the shader's coverUv.
      let side = 0;
      let offsetX = 0;
      let offsetY = 0;
      const layout = () => {
        side = Math.max(window.innerWidth, window.innerHeight);
        offsetX = (window.innerWidth - side) / 2;
        offsetY = (window.innerHeight - side) / 2;
        canvas.style.width = canvas.style.height = `${side}px`;
        canvas.style.left = `${offsetX}px`;
        canvas.style.top = `${offsetY}px`;
      };
      layout();

      let trail: TrailPoint[] = [];
      let force = 0;
      let frame = 0;
      let lastTime = 0;

      const addTouch = (x: number, y: number) => {
        const last = trail[trail.length - 1];
        if (last) {
          const dx = last.x - x;
          const dy = last.y - y;
          const dd = dx * dx + dy * dy;
          force = Math.max(MIN_FORCE, Math.min(dd * 10000, 1));
          if (interpolate) {
            const lines = Math.ceil(
              dd / Math.pow((trailSize * 0.5) / interpolate, 2),
            );
            for (let i = 1; i < lines; i++) {
              trail.push({
                x: last.x - (dx / lines) * i,
                y: last.y - (dy / lines) * i,
                age: 0,
                force,
              });
            }
          }
        }
        trail.push({ x, y, age: 0, force });
      };

      const drawTouch = (point: TrailPoint) => {
        const rise = maxAge * 0.3;
        const eased =
          point.age < rise
            ? easingFunction(point.age / rise)
            : easingFunction(1 - (point.age - rise) / (maxAge - rise));
        const radius = Math.max(0, size * trailSize * eased * point.force);
        const px = point.x * size;
        const py = point.y * size;
        const gradient = trailCtx.createRadialGradient(
          px,
          py,
          radius * 0.25,
          px,
          py,
          radius,
        );
        gradient.addColorStop(0, `rgba(255, 255, 255, ${INTENSITY})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        trailCtx.beginPath();
        trailCtx.fillStyle = gradient;
        trailCtx.arc(px, py, radius, 0, Math.PI * 2);
        trailCtx.fill();
      };

      const render = (time: number) => {
        // Clamp so a backgrounded tab doesn't age everything out in one step.
        const delta = lastTime ? Math.min(time - lastTime, 100) : 16;
        lastTime = time;

        trail = trail.filter((point) => (point.age += delta) <= maxAge);

        trailCtx.globalCompositeOperation = "source-over";
        trailCtx.fillStyle = "black";
        trailCtx.fillRect(0, 0, size, size);
        trailCtx.globalCompositeOperation = "screen";
        trail.forEach(drawTouch);

        const texels = trailCtx.getImageData(0, 0, size, size).data;
        const out = pixels.data;
        const centre = TEXELS_PER_CELL >> 1;
        for (let row = 0; row < gridSize; row++) {
          for (let col = 0; col < gridSize; col++) {
            const src =
              ((row * TEXELS_PER_CELL + centre) * size +
                col * TEXELS_PER_CELL +
                centre) *
              4;
            const dst = (row * gridSize + col) * 4;
            out[dst] = red;
            out[dst + 1] = green;
            out[dst + 2] = blue;
            out[dst + 3] = texels[src];
          }
        }
        pixelCtx.putImageData(pixels, 0, 0);

        if (trail.length) {
          frame = requestAnimationFrame(render);
        } else {
          // Idle: stop the loop and drop out of the blend/filter pass entirely.
          frame = 0;
          lastTime = 0;
          force = 0;
          canvas.dataset.active = "false";
        }
      };

      const onPointerMove = (event: PointerEvent) => {
        if (event.pointerType !== "mouse") return;
        addTouch(
          (event.clientX - offsetX) / side,
          (event.clientY - offsetY) / side,
        );
        if (!frame) {
          canvas.dataset.active = "true";
          frame = requestAnimationFrame(render);
        }
      };

      window.addEventListener("pointermove", onPointerMove, { passive: true });
      window.addEventListener("resize", layout);

      return () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("resize", layout);
        cancelAnimationFrame(frame);
        pixelCtx.clearRect(0, 0, gridSize, gridSize);
        canvas.dataset.active = "false";
      };
    };

    const sync = () => {
      stop?.();
      stop = media.matches ? start() : null;
    };
    sync();
    media.addEventListener("change", sync);

    return () => {
      media.removeEventListener("change", sync);
      stop?.();
    };
  }, [gridSize, trailSize, maxAge, interpolate, color, easingFunction]);

  return (
    <>
      {gooeyFilter && <GooeyFilter {...gooeyFilter} />}
      <canvas
        ref={canvasRef}
        className="pixel-trail"
        aria-hidden="true"
        data-active="false"
        style={gooeyFilter ? { filter: `url(#${gooeyFilter.id})` } : undefined}
      />
    </>
  );
}
