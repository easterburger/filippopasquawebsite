"use client";

import { useEffect, useRef, useState } from "react";
import { Playfair_Display } from "next/font/google";

import BlurText from "./BlurText";
import BubbleMenu from "./BubbleMenu";
import EducationCanvas from "./EducationCanvas";
import VariableProximity from "./VariableProximity";
import { MeltGooFilter, MeltLayer, useMeltFill } from "./melt-fill";
import { portfolioMenuItems } from "./portfolio-menu";

const educationEditorial = Playfair_Display({
  subsets: ["latin"],
  style: ["italic"],
  weight: "variable",
  display: "swap",
});

type EducationNodeId = "ib-program" | "subjects" | "oxford-summer";

const subjects = [
  "Physics HL",
  "Computer Science HL",
  "Economics HL",
  "French SL",
  "English SL",
  "Math AA SL",
] as const;

const educationNodes: Array<{
  id: EducationNodeId;
  label: string;
  meta: string;
  body?: string;
  subjects?: readonly string[];
}> = [
  {
    id: "ib-program",
    label: "IB program",
    meta: "diploma programme",
    body: "I'm completing the International Baccalaureate Diploma Programme, a two-year curriculum built around six subjects, Theory of Knowledge, an Extended Essay, and Creativity, Activity, Service. It keeps the work broad and rigorous at the same time.",
  },
  {
    id: "subjects",
    label: "subjects",
    meta: "three HL, three SL",
    subjects,
  },
  {
    id: "oxford-summer",
    label: "oxford summer program",
    meta: "two weeks, engineering",
    body: "I spent two weeks at Oxford studying engineering, moving through core ideas across disciplines and getting a closer look at how different branches of engineering think, build, and solve problems.",
  },
];

export default function EducationPage() {
  const containerRef = useRef(null);
  const nodesRef = useRef<HTMLDivElement | null>(null);
  const [introDone, setIntroDone] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [openNode, setOpenNode] = useState<EducationNodeId | null>(null);
  const openMeltProps = useMeltFill();

  useEffect(() => {
    if (!sheetOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (openNode) {
        setOpenNode(null);
        return;
      }
      setSheetOpen(false);
    };

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!openNode) return;
      const target = event.target as Node | null;
      if (target && nodesRef.current && !nodesRef.current.contains(target)) {
        setOpenNode(null);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("mousedown", onPointerDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("mousedown", onPointerDown);
    };
  }, [openNode, sheetOpen]);

  const toggleSheet = () => {
    setSheetOpen((current) => {
      if (current) setOpenNode(null);
      return !current;
    });
  };

  const toggleNode = (id: EducationNodeId) => {
    setOpenNode((current) => (current === id ? null : id));
  };

  return (
    <main className="education-page">
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

      <MeltGooFilter />

      <section className="education-hero" aria-labelledby="education-heading">
        <div
          ref={containerRef}
          className="education-hero-canvas"
          style={{ position: "relative" }}
        >
          <EducationCanvas
            className="education-background"
            imageSrc="/education-assets/ceiling-fresco.png"
          />
          <div className="education-image-wash" aria-hidden="true" />

          <div className="education-hero-copy">
            {!introDone ? (
              <BlurText
                tag="h1"
                id="education-heading"
                text="EDUCATION"
                animateBy="letters"
                direction="top"
                delay={70}
                stepDuration={0.42}
                threshold={0.01}
                rootMargin="0px"
                className={`education-heading ${educationEditorial.className}`}
                onAnimationComplete={() => setIntroDone(true)}
              />
            ) : (
              <h1 id="education-heading" className="education-heading">
                <VariableProximity
                  label="EDUCATION"
                  className={`education-heading-proximity ${educationEditorial.className}`}
                  fromFontVariationSettings="'wght' 500"
                  toFontVariationSettings="'wght' 900"
                  containerRef={containerRef}
                  radius={240}
                  falloff="gaussian"
                />
              </h1>
            )}

            <div className="education-open-row">
              <button
                type="button"
                className={`education-open-toggle${introDone ? " is-ready" : ""}${
                  sheetOpen ? " is-open" : ""
                }`}
                aria-expanded={sheetOpen}
                aria-controls="education-sheet"
                aria-label={
                  sheetOpen ? "Close education details" : "Open education details"
                }
                onClick={toggleSheet}
                {...openMeltProps}
              >
                <MeltLayer />
                <span className="education-open-text" data-label="explore">
                  <span className="education-open-default">Open</span>
                </span>
                <span className="education-open-cross" aria-hidden="true" />
              </button>
            </div>
          </div>

          <div
            id="education-sheet"
            className={`education-sheet${sheetOpen ? " is-open" : ""}`}
            aria-hidden={!sheetOpen}
          >
            <div
              ref={nodesRef}
              className={`education-index${sheetOpen ? " is-ready" : ""}`}
              aria-label="Education programs"
            >
              {educationNodes.map((node) => {
                const isOpen = openNode === node.id;

                return (
                  <article
                    key={node.id}
                    className={`education-row${isOpen ? " is-open" : ""}`}
                  >
                    <button
                      type="button"
                      className="education-row-head"
                      aria-expanded={isOpen}
                      aria-controls={`education-panel-${node.id}`}
                      tabIndex={sheetOpen ? 0 : -1}
                      onClick={() => toggleNode(node.id)}
                    >
                      <span
                        className={`education-row-title ${educationEditorial.className}`}
                      >
                        {node.label}
                      </span>
                      <span className="education-row-meta">{node.meta}</span>
                      <span className="education-row-icon" aria-hidden="true" />
                    </button>

                    <div
                      id={`education-panel-${node.id}`}
                      className="education-row-panel"
                      role="region"
                      aria-label={`${node.label} details`}
                      aria-hidden={!isOpen}
                    >
                      <div className="education-row-panel-inner">
                        {node.subjects ? (
                          <ul className="education-subject-pills">
                            {node.subjects.map((subject) => (
                              <li key={subject}>{subject}</li>
                            ))}
                          </ul>
                        ) : (
                          <p className="education-row-body">{node.body}</p>
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
