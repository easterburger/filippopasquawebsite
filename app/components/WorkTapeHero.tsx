"use client";

import { useCallback, useRef, useState, type MouseEvent } from "react";

import VHS from "@/components/canvasui/VHS";

import { usePageTransition } from "./PageTransition";
import WorkSpinner from "./WorkSpinner";

const PAGE_TITLE = "Software Projects and Work Experience";
const MARK = "✦";
const INK = "rgba(242, 246, 236, 0.96)";
const INK_SOFT = "rgba(242, 246, 236, 0.62)";
const HAIRLINE = "rgba(242, 246, 236, 0.44)";
// Source-canvas pixels per unit of tape time (tape time already runs at the
// VHS speed prop, so the marquee slows down with the tape).
const SCROLL_SPEED = 70;

const badges = [
  {
    text: "work",
    tip: "click to explore work experience",
    href: "/work/experience",
  },
  {
    text: "projects",
    tip: "click to explore projects",
    href: "/work/projects",
  },
] as const;

// Sampled straight off the iMessage reference: a vertical ramp, no horizontal
// shift, with the tail hooking off the bottom-left corner.
const BUBBLE_TOP = "#87b5ff";
const BUBBLE_BOTTOM = "#1f69ee";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

function drawBubble(
  ctx: CanvasRenderingContext2D,
  {
    centerX,
    bottomY,
    text,
    fontSize,
    appear,
    viewportWidth,
    family,
  }: {
    centerX: number;
    bottomY: number;
    text: string;
    fontSize: number;
    appear: number;
    viewportWidth: number;
    family: string;
  },
) {
  ctx.save();
  ctx.font = `500 ${fontSize}px ${family}`;
  ctx.textBaseline = "middle";

  // Proportions taken from the reference: ~0.9em side padding and a bubble
  // just over two text-sizes tall, with fully round ends.
  const padX = fontSize * 0.9;
  const h = fontSize * 2.05;
  const w = ctx.measureText(text).width + padX * 2;
  const r = h / 2;

  const cx = clamp(centerX, w / 2 + 10, Math.max(w / 2 + 10, viewportWidth - w / 2 - 10));
  const rise = (1 - appear) * fontSize * 0.55;
  const x = cx - w / 2;
  const y = bottomY - h + rise;

  ctx.globalAlpha = clamp(appear, 0, 1);
  // Pops open from its own tail, the way a sent message lands.
  const scale = 0.86 + 0.14 * appear;
  ctx.translate(x, y + h);
  ctx.scale(scale, scale);
  ctx.translate(-x, -(y + h));

  const gradient = ctx.createLinearGradient(0, y, 0, y + h);
  gradient.addColorStop(0, BUBBLE_TOP);
  gradient.addColorStop(1, BUBBLE_BOTTOM);

  ctx.fillStyle = gradient;
  ctx.shadowColor = "rgba(6, 22, 64, 0.42)";
  ctx.shadowBlur = h * 0.34;
  ctx.shadowOffsetY = h * 0.1;

  // One path so the translucent fill during the pop has no seam where the
  // tail meets the body.
  const tailX = x + r * 0.62;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.moveTo(tailX + h * 0.16, y + h - h * 0.04);
  ctx.quadraticCurveTo(
    tailX + h * 0.02,
    y + h + h * 0.1,
    x - h * 0.085,
    y + h + h * 0.05,
  );
  ctx.quadraticCurveTo(
    tailX - h * 0.02,
    y + h - h * 0.02,
    tailX - h * 0.02,
    y + h - h * 0.22,
  );
  ctx.closePath();
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.fillStyle = "#ffffff";
  ctx.fillText(text, x + padX, y + h / 2 + fontSize * 0.03);
  ctx.restore();
}

export default function WorkTapeHero() {
  const bandRef = useRef<HTMLDivElement | null>(null);
  const rowRef = useRef<HTMLDivElement | null>(null);
  const hoveredRef = useRef<number | null>(null);
  const springsRef = useRef(badges.map(() => ({ value: 0, velocity: 0 })));
  const lastFrameRef = useRef(0);
  // State only exists to re-render, which nudges the tape to paint a frame
  // when the loop is idle under reduced motion.
  const [hovered, setHovered] = useState<number | null>(null);
  const { transitionTo } = usePageTransition();

  const setHover = (index: number | null) => {
    hoveredRef.current = index;
    setHovered(index);
  };

  const handleActivate = (
    event: MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    event.preventDefault();
    transitionTo(href);
  };

  // Draws the title band, the spinner frames and the hover bubble into the
  // tape's source canvas, so the VHS shader warps and degrades all of it.
  const composite = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      width: number,
      height: number,
      time: number,
    ) => {
      void height;

      const band = bandRef.current;
      if (band) {
        const rect = band.getBoundingClientRect();
        const bandStyle = getComputedStyle(band);
        const fontSize = parseFloat(bandStyle.fontSize) || 48;
        const family = bandStyle.fontFamily || "Arial, sans-serif";

        ctx.fillStyle = HAIRLINE;
        ctx.fillRect(0, Math.round(rect.top), width, 1);
        ctx.fillRect(0, Math.round(rect.bottom) - 1, width, 1);

        const gap = Math.min(Math.max(26, width * 0.034), 64);
        const titleFont = `600 ${fontSize}px ${family}`;
        const markFont = `600 ${Math.round(fontSize * 0.3)}px ${family}`;

        ctx.textBaseline = "middle";
        ctx.letterSpacing = `${(-0.032 * fontSize).toFixed(2)}px`;
        ctx.font = titleFont;
        const titleWidth = ctx.measureText(PAGE_TITLE).width;
        ctx.font = markFont;
        const markWidth = ctx.measureText(MARK).width;
        const itemWidth = titleWidth + markWidth + gap * 2;
        const centerY = rect.top + rect.height / 2 + fontSize * 0.05;

        let x = -((time * SCROLL_SPEED) % itemWidth);
        while (x < width) {
          ctx.font = titleFont;
          ctx.fillStyle = INK;
          ctx.fillText(PAGE_TITLE, x, centerY);
          ctx.font = markFont;
          ctx.fillStyle = INK_SOFT;
          ctx.fillText(MARK, x + titleWidth + gap, centerY - fontSize * 0.02);
          x += itemWidth;
        }
        ctx.letterSpacing = "0px";
      }

      const row = rowRef.current;
      if (!row) return;

      const now = performance.now();
      const delta = lastFrameRef.current
        ? Math.min((now - lastFrameRef.current) / 1000, 1 / 30)
        : 0;
      lastFrameRef.current = now;
      const reducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      const family = getComputedStyle(row).fontFamily || "Arial, sans-serif";

      const children = Array.from(row.children);
      const rects: Array<DOMRect | null> = [];

      for (const [index, child] of children.entries()) {
        if (!(child instanceof HTMLElement)) {
          rects.push(null);
          continue;
        }
        const rect = child.getBoundingClientRect();
        rects.push(rect);
        const canvas = child.querySelector("canvas");
        if (canvas instanceof HTMLCanvasElement && canvas.width > 0) {
          ctx.drawImage(canvas, rect.left, rect.top, rect.width, rect.height);
        }
        void index;
      }

      // Bubbles paint after every badge so they always sit on top.
      for (const [index, badge] of badges.entries()) {
        const spring = springsRef.current[index];
        const rect = rects[index];
        if (!spring || !rect) continue;

        const target = hoveredRef.current === index ? 1 : 0;
        if (reducedMotion) {
          spring.value = target;
          spring.velocity = 0;
        } else {
          const force =
            (target - spring.value) * 260 - spring.velocity * 24;
          spring.velocity += force * delta;
          spring.value += spring.velocity * delta;
        }
        if (spring.value <= 0.002 && target === 0) {
          spring.value = 0;
          spring.velocity = 0;
          continue;
        }

        drawBubble(ctx, {
          centerX: rect.left + rect.width / 2,
          bottomY: rect.top - clamp(rect.width * 0.03, 10, 22),
          text: badge.tip,
          fontSize: clamp(rect.width * 0.042, 14, 22),
          appear: spring.value,
          viewportWidth: width,
          family,
        });
      }
    },
    [],
  );

  return (
    <>
      <div className="work-tape" aria-hidden="true">
        <VHS
          className="work-tape-canvas"
          imageSrc="/work-assets/work-meadow.png"
          composite={composite}
          speed={0.6}
          wave={1.3}
          jitter={0.45}
          crease={0.28}
          switching={0.16}
          switchingHeight={0.03}
          bloom={0.45}
          aberration={2.5}
          acBeat={0.55}
          grain={0.14}
          scanlines={0.22}
          vignette={0.08}
          barrel={0}
          saturation={1}
          exposure={1.02}
        />
        <div className="work-tape-wash" />
      </div>

      <section className="work-hero">
        <h1 className="sr-only">{PAGE_TITLE}</h1>

        {/* Invisible layout doubles: the band spacer and spinner canvases are
            measured here, then drawn into the tape by the composite hook. */}
        <div ref={bandRef} className="work-title-space" aria-hidden="true" />

        <div ref={rowRef} className="work-spinners">
          {badges.map((badge, index) => (
            <a
              key={badge.text}
              href={badge.href}
              className={`work-spinner-hit${
                hovered === index ? " is-hovered" : ""
              }`}
              aria-label={badge.tip}
              onClick={(event) => handleActivate(event, badge.href)}
              onPointerEnter={() => setHover(index)}
              onPointerLeave={() => setHover(null)}
              onPointerCancel={() => setHover(null)}
              onFocus={() => setHover(index)}
              onBlur={() => setHover(null)}
            >
              <WorkSpinner
                text={badge.text}
                speed={0.5}
                phase={0.6}
                className="work-spinner"
              />
            </a>
          ))}
        </div>
      </section>
    </>
  );
}
