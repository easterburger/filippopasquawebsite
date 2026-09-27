"use client";

import { useEffect, useLayoutEffect, useState } from "react";

import BubbleMenu from "./BubbleMenu";
import DeskHero from "./home/DeskHero";
import IntroGate from "./IntroGate";
import { INTRO_GATE_KEY } from "./intro-seen";
import StyleNote from "./StyleNote";
import { portfolioMenuItems } from "./portfolio-menu";

// The gate must disappear before paint for returning visitors, but useLayoutEffect
// is a no-op (and warns) during SSR.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

export default function PortfolioPage() {
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

  const handleEnterSite = () => {
    try {
      window.sessionStorage.setItem(INTRO_GATE_KEY, "1");
    } catch {
      // Session storage can be unavailable; the gate simply replays next visit.
    }
    setHasEntered(true);
  };

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

        <section id="home" className="hero-only desk-hero" aria-labelledby="hero-heading">
          <DeskHero entered={hasEntered} onSettled={() => setChromeReady(true)} />
        </section>

        <StyleNote ready={chromeReady} />
      </main>
    </>
  );
}
