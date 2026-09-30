"use client";

import { ArrowUpRight, Sparkle, X } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";

import TextFlippingBoardDemo from "@/components/text-flipping-board-demo";

import BubbleMenu from "./BubbleMenu";
import IntroGate from "./IntroGate";
import { INTRO_GATE_KEY } from "./intro-seen";
import ParticleButton from "./ParticleButton";
import StyleNote from "./StyleNote";
import SwingText from "./SwingText";
import { heroMarks } from "./hero/HeroMarks";
import { portfolioMenuItems } from "./portfolio-menu";

const HERO_INTRO =
  "Hi, I'm Filippo Pasqua.\nI'm an IB student and software developer from Italy.";

// The gate must disappear before paint for returning visitors, but useLayoutEffect
// is a no-op (and warns) during SSR.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function PortfolioPage() {
  const [isHelloOpen, setIsHelloOpen] = useState(false);
  const [menuOpenRequest, setMenuOpenRequest] = useState(0);
  const [chromeReady, setChromeReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [isGateOpen, setIsGateOpen] = useState(true);

  useIsomorphicLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem(INTRO_GATE_KEY) === "1") {
        setHasEntered(true);
        setIsGateOpen(false);
      }
    } catch {
      setHasEntered(true);
      setIsGateOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!hasEntered) return;

    const timeout = window.setTimeout(() => setChromeReady(true), 4200);
    return () => window.clearTimeout(timeout);
  }, [hasEntered]);

  const handleEnterSite = () => {
    try {
      window.sessionStorage.setItem(INTRO_GATE_KEY, "1");
    } catch {
      // Session storage can be unavailable; the gate simply replays next visit.
    }
    setHasEntered(true);
  };

  const handleIntroComplete = () => setChromeReady(true);

  return (
    <>
      {isGateOpen && (
        <IntroGate
          onReveal={handleEnterSite}
          onDone={() => setIsGateOpen(false)}
        />
      )}

      <main id="top" className="hero-page" inert={!hasEntered}>
        <BubbleMenu
          items={portfolioMenuItems}
          menuAriaLabel="Toggle portfolio navigation"
          menuBg="#f1efe6"
          menuContentColor="#181b20"
          useFixedPosition
          animationEase="back.out(1.5)"
          animationDuration={0.5}
          staggerDelay={0.1}
          openRequest={menuOpenRequest}
          entranceReady={chromeReady}
        >
          <a
            className={`cv-download-button${chromeReady ? " is-ready" : ""}`}
            href="/Filippo-Pasqua-CV.pdf"
            download="Filippo-Pasqua-CV.pdf"
            aria-label="Download Filippo Pasqua CV"
          >
            <span className="cv-download-label" data-label="Download CV">
              <span className="cv-download-default">Download CV</span>
            </span>
          </a>
        </BubbleMenu>

        <StyleNote ready={chromeReady} />

        <section id="home" className="hero-only" aria-labelledby="hero-intro">
          <div className={`hero-content${isHelloOpen ? " hello-open" : ""}`}>
            <div id="hero-intro" className="hero-intro">
              <SwingText
                text={HERO_INTRO}
                className="hero-intro-copy"
                revealed={hasEntered}
                onRevealComplete={handleIntroComplete}
                marks={heroMarks({ autoStickers: hasEntered })}
                breeze
              />

              <motion.div
                className="hero-actions"
                initial={{ opacity: 0, y: 18, filter: "blur(12px)" }}
                animate={
                  chromeReady
                    ? { opacity: 1, y: 0, filter: "blur(0px)" }
                    : { opacity: 0, y: 18, filter: "blur(12px)" }
                }
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              >
                <ParticleButton
                  type="button"
                  className="hero-cta hero-cta-primary"
                  onClick={() => setIsHelloOpen((isOpen) => !isOpen)}
                  aria-expanded={isHelloOpen}
                  aria-controls="hello-board-panel"
                >
                  <span className="hero-cta-label">Introduction</span>
                  <span className="hero-cta-chip" aria-hidden="true">
                    {isHelloOpen ? (
                      <X weight="bold" />
                    ) : (
                      <Sparkle weight="fill" />
                    )}
                  </span>
                </ParticleButton>

                <button
                  type="button"
                  className="hero-cta hero-cta-secondary"
                  onClick={() => setMenuOpenRequest((request) => request + 1)}
                  aria-label="Explore the portfolio menu"
                >
                  <span className="hero-cta-label">Explore</span>
                  <span className="hero-cta-chip" aria-hidden="true">
                    <ArrowUpRight weight="bold" />
                  </span>
                </button>
              </motion.div>
            </div>

            <div className="hello-board-anchor">
              <AnimatePresence initial={false}>
                {isHelloOpen && (
                  <motion.aside
                    id="hello-board-panel"
                    className="hello-board-panel"
                    initial={{ opacity: 0, x: 90, filter: "blur(22px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: 70, filter: "blur(18px)" }}
                    transition={{
                      duration: 0.72,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                  >
                    <TextFlippingBoardDemo />
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
