"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { Baloo_2 } from "next/font/google";

import ParticleObject from "@/components/canvasui/ParticleObject";
import { useSound } from "@/components/sound/SoundProvider";

import BubbleMenu from "./BubbleMenu";
import CircularText from "./CircularText";
import Asciify from "./canvas/Asciify";
import { portfolioMenuItems } from "./portfolio-menu";

const baloo = Baloo_2({
  subsets: ["latin"],
  weight: "800",
  display: "swap",
});

const HEADING_TEXT = "ABOUT ME";

type CloudSpec = {
  top: string;
  scale: number;
  opacity: number;
  duration: number;
  delay: number;
};

// Negative delays pre-scatter the clouds across the sky on first paint.
// Tops are percentages of the full page height, so they spread across
// both the hero and the story section below it.
const clouds: CloudSpec[] = [
  { top: "2%", scale: 1.55, opacity: 0.95, duration: 128, delay: -22 },
  { top: "7%", scale: 0.82, opacity: 0.68, duration: 172, delay: -104 },
  { top: "14%", scale: 1.18, opacity: 0.85, duration: 146, delay: -61 },
  { top: "22%", scale: 0.68, opacity: 0.52, duration: 196, delay: -139 },
  { top: "31%", scale: 1.32, opacity: 0.78, duration: 118, delay: -47 },
  { top: "42%", scale: 0.92, opacity: 0.62, duration: 156, delay: -112 },
  { top: "53%", scale: 1.62, opacity: 0.9, duration: 108, delay: -76 },
  { top: "64%", scale: 0.78, opacity: 0.55, duration: 182, delay: -90 },
  { top: "75%", scale: 1.24, opacity: 0.72, duration: 134, delay: -36 },
  { top: "87%", scale: 1.05, opacity: 0.8, duration: 150, delay: -118 },
];

function CloudCard({
  align,
  card,
}: {
  align: "is-left" | "is-right";
  card: { title: string; body: string };
}) {
  return (
    <article className={`about-cloud-card ${align}`}>
      <svg
        className="about-cloud-silhouette"
        viewBox="0 0 640 360"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M108 299C57 292 24 250 39 204C49 172 79 151 116 154C111 111 143 76 188 77C209 40 252 23 292 40C324 1 390 3 421 47C466 25 523 48 537 94C578 91 609 121 607 158C639 173 651 212 632 242C615 269 585 281 555 276C540 317 495 336 455 316C423 352 363 355 326 323C293 348 242 344 214 313C175 337 127 329 108 299Z" />
      </svg>
      <div className="about-card-body">
        <h2 className={baloo.className}>{card.title}</h2>
        <p>{card.body}</p>
      </div>
    </article>
  );
}

const storyCards = [
  {
    id: "who",
    title: "Hi, I’m Filippo.",
    body: "I’m an IB student from Italy who likes turning ideas into websites, tools and small experiments.",
  },
  {
    id: "build",
    title: "I learn by making.",
    body: "I move between design and code, asking questions, testing ideas and rebuilding things until they feel right.",
  },
  {
    id: "products",
    title: "AI agents, mostly.",
    body: "I build AI-agent products: systems that can reason, use tools and help people turn a goal into action.",
  },
  {
    id: "school",
    title: "Still figuring it out.",
    body: "Right now I’m studying Physics, Computer Science and Economics while working out what I want to build next.",
  },
] as const;

export default function AboutPage() {
  const probeRef = useRef<HTMLSpanElement | null>(null);
  const [textSrc, setTextSrc] = useState<string | null>(null);
  const { sand } = useSound();

  // Dragging through the heading sounds like dragging a hand through sand: the
  // hiss follows how much of the lettering is actually being pushed around.
  const onHeadingStir = useCallback(
    (activity: number) => sand(activity),
    [sand],
  );

  useEffect(() => () => sand(0), [sand]);

  // ParticleObject consumes images, so the heading is rasterized to a PNG
  // object URL with the balloon font once it has loaded.
  useEffect(() => {
    let cancelled = false;
    let objectUrl: string | null = null;

    const probe = probeRef.current;
    const family = probe
      ? getComputedStyle(probe).fontFamily
      : "system-ui, sans-serif";
    const fontSize = 240;
    const fontSpec = `800 ${fontSize}px ${family}`;

    const render = async () => {
      try {
        await document.fonts.load(fontSpec, HEADING_TEXT);
        await document.fonts.ready;
      } catch {
        // Fall through and draw with whatever font is available.
      }
      if (cancelled) return;

      const canvas = document.createElement("canvas");
      const measureCtx = canvas.getContext("2d");
      if (!measureCtx) return;
      measureCtx.font = fontSpec;
      const width = measureCtx.measureText(HEADING_TEXT).width;
      canvas.width = Math.ceil(width + fontSize * 0.4);
      canvas.height = Math.ceil(fontSize * 1.3);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.font = fontSpec;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = "#fdfdfa";
      ctx.fillText(HEADING_TEXT, canvas.width / 2, canvas.height / 2);

      canvas.toBlob((blob) => {
        if (!blob || cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        setTextSrc(objectUrl);
      }, "image/png");
    };

    void render();

    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  return (
    <main className="about-page">
      <BubbleMenu
        items={portfolioMenuItems}
        menuAriaLabel="Toggle portfolio navigation"
        menuBg="#f1efe6"
        menuContentColor="#181b20"
        useFixedPosition
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.1}
        glass
      />

      <div className="about-sky" aria-hidden="true">
        {clouds.map((cloud, index) => (
          <div
            key={index}
            className="about-cloud"
            style={
              {
                top: cloud.top,
                "--cloud-scale": cloud.scale,
                "--cloud-opacity": cloud.opacity,
                "--drift-duration": `${cloud.duration}s`,
                "--drift-delay": `${cloud.delay}s`,
              } as CSSProperties
            }
          >
            <div className="about-cloud-shape" />
          </div>
        ))}
      </div>

      <section className="about-hero" aria-labelledby="about-heading">
        <div className="about-hero-canvas">
          <h1 id="about-heading" className="sr-only">
            About me
          </h1>

          <span
            ref={probeRef}
            className={`${baloo.className} about-font-probe`}
            aria-hidden="true"
          >
            {HEADING_TEXT}
          </span>

          <div className="about-heading-particles" aria-hidden="true">
            {textSrc ? (
              <ParticleObject
                src={textSrc}
                count={26000}
                size={2.6}
                sizeVariance={0.5}
                color="#fbf2bd"
                radius={70}
                strength={0.22}
                swirl={0.25}
                spring={1.5}
                damping={0.55}
                drift={0.55}
                scale={15}
                floatIntensity={0.6}
                rotationIntensity={0.25}
                floatSpeed={1.6}
                orbit={false}
                zoom={false}
                autoRotate={false}
                fov={65}
                cameraDistance={4.2}
                onActivity={onHeadingStir}
                style={{ position: "absolute", inset: 0 }}
              />
            ) : null}
          </div>

          <div className="about-scroll-cue">
            <CircularText
              text="SCROLL DOWN*ABOUT ME*"
              spinDuration={24}
              onHover="slowDown"
              className="about-circular-text"
            />
          </div>
        </div>
      </section>

      <section className="about-story" aria-label="More about Filippo">
        <CloudCard align="is-left" card={storyCards[0]} />

        <figure className="about-portrait">
          <Asciify
            className="about-portrait-ascii"
            radius={0.4}
            softness={1}
            scale={2}
            spacing={1}
            backgroundOpacity={0}
            contrast={1}
            brightness={0}
            invert={0}
            glow={0.75}
            aberration={0.75}
            strength={1}
            baseStrength={0}
            followSpeed={3}
            charset="ascii"
            background={[0, 0, 0]}
          >
            <img
              src="/hero-assets/filippo-childhood.webp"
              alt="Filippo Pasqua as a child"
              loading="lazy"
            />
          </Asciify>
          <figcaption className={baloo.className}>
            I&apos;m a bit older now
          </figcaption>
        </figure>

        <CloudCard align="is-left" card={storyCards[1]} />
        <CloudCard align="is-right" card={storyCards[2]} />
        <CloudCard align="is-left" card={storyCards[3]} />
      </section>
    </main>
  );
}
