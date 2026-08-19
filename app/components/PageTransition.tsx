"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import { gsap } from "gsap";

type TransitionToOptions = {
  alreadyCovered?: boolean;
};

type PageTransitionContextValue = {
  transitionTo: (href: string, options?: TransitionToOptions) => void;
};

const PageTransitionContext = createContext<PageTransitionContextValue | null>(
  null,
);

// Top origin: cover drops down; reveal lifts up (new page appears bottom → top).
const CURTAIN_ORIGIN = "50% 0%";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function splitHref(href: string) {
  const url = new URL(href, window.location.origin);
  return {
    pathname: url.pathname,
    hash: url.hash,
    search: url.search,
  };
}

export function usePageTransition() {
  const context = useContext(PageTransitionContext);
  if (!context) {
    throw new Error(
      "usePageTransition must be used within PageTransitionProvider",
    );
  }
  return context;
}

export function PageTransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const isAnimatingRef = useRef(false);
  const pendingRevealRef = useRef(false);
  const pendingHashRef = useRef<string | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  const cover = useCallback((alreadyCovered = false) => {
    return new Promise<void>((resolve) => {
      const curtain = curtainRef.current;
      const overlay = overlayRef.current;
      if (!curtain || !overlay) {
        resolve();
        return;
      }

      gsap.killTweensOf(curtain);
      gsap.set(overlay, { display: "block", pointerEvents: "auto" });
      setIsVisible(true);

      if (alreadyCovered || prefersReducedMotion()) {
        gsap.set(curtain, {
          scaleY: 1,
          autoAlpha: 1,
          transformOrigin: CURTAIN_ORIGIN,
        });
        resolve();
        return;
      }

      gsap.fromTo(
        curtain,
        { scaleY: 0, autoAlpha: 1, transformOrigin: CURTAIN_ORIGIN },
        {
          scaleY: 1,
          duration: 0.72,
          ease: "power4.inOut",
          onComplete: () => resolve(),
        },
      );
    });
  }, []);

  const reveal = useCallback(() => {
    return new Promise<void>((resolve) => {
      const curtain = curtainRef.current;
      const overlay = overlayRef.current;
      if (!curtain || !overlay) {
        resolve();
        return;
      }

      gsap.killTweensOf(curtain);

      const finish = () => {
        gsap.set(overlay, { display: "none", pointerEvents: "none" });
        gsap.set(curtain, { scaleY: 0, autoAlpha: 0 });
        setIsVisible(false);
        resolve();
      };

      if (prefersReducedMotion()) {
        finish();
        return;
      }

      // Curtain lifts upward → page reveals from the bottom up.
      gsap.to(curtain, {
        scaleY: 0,
        duration: 0.72,
        ease: "power4.inOut",
        transformOrigin: CURTAIN_ORIGIN,
        onComplete: finish,
      });
    });
  }, []);

  const transitionTo = useCallback(
    (href: string, options: TransitionToOptions = {}) => {
      if (isAnimatingRef.current) return;

      const target = splitHref(href);
      const currentPath = `${window.location.pathname}${window.location.search}`;
      const targetPath = `${target.pathname}${target.search}`;

      if (targetPath === currentPath) {
        if (target.hash) {
          document.querySelector(target.hash)?.scrollIntoView({
            behavior: "smooth",
          });
        }
        return;
      }

      isAnimatingRef.current = true;
      pendingRevealRef.current = true;
      pendingHashRef.current = target.hash || null;

      void cover(options.alreadyCovered)
        .then(() => {
          router.push(`${target.pathname}${target.search}${target.hash}`);
        })
        .catch(() => {
          pendingRevealRef.current = false;
          isAnimatingRef.current = false;
          void reveal();
        });
    },
    [cover, reveal, router],
  );

  useEffect(() => {
    if (!pendingRevealRef.current) return;

    pendingRevealRef.current = false;
    const hash = pendingHashRef.current;
    pendingHashRef.current = null;

    const frame = window.requestAnimationFrame(() => {
      void (async () => {
        if (hash) {
          document.querySelector(hash)?.scrollIntoView();
        } else {
          window.scrollTo(0, 0);
        }
        await reveal();
        isAnimatingRef.current = false;
      })();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pathname, reveal]);

  useEffect(() => {
    if (!isVisible) return;

    const timeout = window.setTimeout(() => {
      if (!isAnimatingRef.current) return;
      pendingRevealRef.current = false;
      isAnimatingRef.current = false;
      void reveal();
    }, 4000);

    return () => window.clearTimeout(timeout);
  }, [isVisible, reveal]);

  return (
    <PageTransitionContext.Provider value={{ transitionTo }}>
      {children}
      <div
        ref={overlayRef}
        className="page-transition-overlay"
        aria-hidden={!isVisible}
        style={{ display: "none" }}
      >
        <div ref={curtainRef} className="page-transition-curtain" />
      </div>
    </PageTransitionContext.Provider>
  );
}
