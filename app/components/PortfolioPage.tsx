"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useLayoutEffect, useState } from "react";

import TextFlippingBoardDemo from "@/components/text-flipping-board-demo";

import BlurText from "./BlurText";
import BubbleMenu from "./BubbleMenu";
import DecryptedText from "./DecryptedText";
import IntroGate from "./IntroGate";
import ParticleButton from "./ParticleButton";
import StyleNote from "./StyleNote";
import { MeltGooFilter, MeltLayer, useMeltFill } from "./melt-fill";
import { portfolioMenuItems } from "./portfolio-menu";

const HERO_INTRO =
  "Hi, I'm Filippo Pasqua. I'm an IB student and software developer from Italy.";

const INTRO_GATE_KEY = "fp-intro-gate-seen";

// The gate must disappear before paint for returning visitors, but useLayoutEffect
// is a no-op (and warns) during SSR.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function PortfolioPage() {
  const [isHelloOpen, setIsHelloOpen] = useState(false);
  const [menuOpenRequest, setMenuOpenRequest] = useState(0);
  const [chromeReady, setChromeReady] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const helloMeltProps = useMeltFill();
  const exploreMeltProps = useMeltFill();

  useIsomorphicLayoutEffect(() => {
    try {
      if (window.sessionStorage.getItem(INTRO_GATE_KEY) === "1") {
        setHasEntered(true);
      }
    } catch {
      setHasEntered(true);
    }
  }, []);

  useEffect(() => {
    if (!hasEntered) return;

    const timeout = window.setTimeout(() => {
      setChromeReady(true);
      setIntroReady(true);
    }, 4200);
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

  const handleIntroComplete = () => {
    setIntroReady(true);
    setChromeReady(true);
  };

  return (
    <>
      <MeltGooFilter />

      {!hasEntered && <IntroGate onEnter={handleEnterSite} />}

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
              {introReady ? (
                <DecryptedText
                  text={HERO_INTRO}
                  useOriginalCharsOnly
                  proximityRadius={58}
                  proximitySpeed={120}
                  parentClassName="hero-intro-copy"
                />
              ) : (
                <BlurText
                  text={HERO_INTRO}
                  animateBy="words"
                  direction="bottom"
                  delay={86}
                  stepDuration={0.42}
                  threshold={0.1}
                  active={hasEntered}
                  className="hero-intro-copy"
                  onAnimationComplete={handleIntroComplete}
                />
              )}

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
                  className="hero-action hero-action-hello"
                  onClick={() => setIsHelloOpen((isOpen) => !isOpen)}
                  aria-expanded={isHelloOpen}
                  aria-controls="hello-board-panel"
                  {...helloMeltProps}
                >
                  <MeltLayer />
                  <span className="hero-action-label" data-label="introduction">
                    <span className="hero-action-default">introduction</span>
                  </span>
                  <span
                    className="hero-action-mark"
                    data-mark="✦"
                    aria-hidden="true"
                  >
                    <span className="hero-action-mark-default">✦</span>
                  </span>
                </ParticleButton>

                <button
                  type="button"
                  className="hero-action hero-action-explore"
                  onClick={() => setMenuOpenRequest((request) => request + 1)}
                  aria-label="Explore the portfolio menu"
                  {...exploreMeltProps}
                >
                  <MeltLayer />
                  <span className="hero-action-label" data-label="explore">
                    <span className="hero-action-default">explore</span>
                  </span>
                  <span
                    className="hero-action-mark"
                    data-mark="↗"
                    aria-hidden="true"
                  >
                    <span className="hero-action-mark-default">↗</span>
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
