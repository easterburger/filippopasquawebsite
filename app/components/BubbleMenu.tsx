"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";

import { usePageTransition } from "./PageTransition";
import "./BubbleMenu.css";

export type BubbleMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  bgColor?: string;
  textColor?: string;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
};

type BubbleMenuProps = {
  logo?: React.ReactNode | string;
  onMenuClick?: (open: boolean) => void;
  className?: string;
  style?: React.CSSProperties;
  menuAriaLabel?: string;
  menuBg?: string;
  menuContentColor?: string;
  useFixedPosition?: boolean;
  items?: BubbleMenuItem[];
  animationEase?: string;
  animationDuration?: number;
  staggerDelay?: number;
  openRequest?: number;
  glass?: boolean;
  entranceReady?: boolean;
  children?: React.ReactNode;
};

const DEFAULT_ITEMS: BubbleMenuItem[] = [
  { label: "work", href: "#work", ariaLabel: "Selected work", rotation: -5 },
  { label: "about", href: "#about", ariaLabel: "About Filippo", rotation: 5 },
  {
    label: "experience",
    href: "#experience",
    ariaLabel: "Experience",
    rotation: -4,
  },
  { label: "contact", href: "#contact", ariaLabel: "Contact", rotation: 4 },
];

export default function BubbleMenu({
  logo,
  onMenuClick,
  className,
  style,
  menuAriaLabel = "Toggle navigation",
  menuBg = "#f3efef",
  menuContentColor = "#080808",
  useFixedPosition = true,
  items,
  animationEase = "back.out(1.5)",
  animationDuration = 0.5,
  staggerDelay = 0.1,
  openRequest = 0,
  glass = false,
  entranceReady = true,
  children,
}: BubbleMenuProps) {
  const { transitionTo } = usePageTransition();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const curtainRef = useRef<HTMLDivElement | null>(null);
  const bubblesRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const previousOpenRequestRef = useRef(openRequest);
  const skipCloseAnimationRef = useRef(false);
  const transitionToRef = useRef(transitionTo);
  transitionToRef.current = transitionTo;

  const menuItems = items?.length ? items : DEFAULT_ITEMS;
  const containerClassName = [
    "bubble-menu",
    useFixedPosition ? "fixed" : "absolute",
    !logo ? "no-logo" : "",
    glass ? "bubble-menu-glass" : "",
    entranceReady ? "is-ready" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  const handleToggle = () => {
    const nextState = !isMenuOpen;
    if (nextState) setShowOverlay(true);
    setIsMenuOpen(nextState);
    onMenuClick?.(nextState);
  };

  const handleMenuItemClick = (
    event: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const url = new URL(href, window.location.origin);
    const isInternal = url.origin === window.location.origin;
    const isCrossPage =
      isInternal &&
      (url.pathname !== window.location.pathname ||
        url.search !== window.location.search);

    if (isCrossPage) {
      event.preventDefault();
      // Keep the menu curtain up; hand off to the page reveal only.
      skipCloseAnimationRef.current = true;
      setIsMenuOpen(false);
      onMenuClick?.(false);
      transitionToRef.current(`${url.pathname}${url.search}${url.hash}`, {
        alreadyCovered: true,
      });
      return;
    }

    setIsMenuOpen(false);
    onMenuClick?.(false);
  };

  useEffect(() => {
    if (openRequest === previousOpenRequestRef.current) return;
    previousOpenRequestRef.current = openRequest;
    setShowOverlay(true);
    setIsMenuOpen(true);
    onMenuClick?.(true);
  }, [onMenuClick, openRequest]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isMenuOpen) {
        setIsMenuOpen(false);
        onMenuClick?.(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMenuOpen, onMenuClick]);

  useEffect(() => {
    const overlay = overlayRef.current;
    const curtain = curtainRef.current;
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);

    if (!overlay || !curtain || !bubbles.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (isMenuOpen) {
      gsap.set(overlay, { display: "flex" });
      gsap.killTweensOf([curtain, ...bubbles, ...labels]);

      if (reducedMotion) {
        gsap.set(curtain, { scaleY: 1, autoAlpha: 1 });
        gsap.set(bubbles, { scale: 1 });
        gsap.set(labels, { y: 0, autoAlpha: 1 });
        return;
      }

      gsap.set(curtain, {
        scaleY: 0,
        autoAlpha: 1,
        transformOrigin: "50% 0%",
      });
      gsap.set(bubbles, {
        scale: 0.58,
        y: -180,
        autoAlpha: 0,
        filter: "blur(48px)",
        transformOrigin: "50% 50%",
      });
      gsap.set(labels, { y: -32, autoAlpha: 0, filter: "blur(18px)" });
      gsap.to(curtain, {
        scaleY: 1,
        duration: 0.72,
        ease: "power4.inOut",
      });

      bubbles.forEach((bubble, index) => {
        const delay =
          0.38 +
          index * staggerDelay +
          gsap.utils.random(-0.025, 0.025);
        const timeline = gsap.timeline({ delay });

        timeline.to(bubble, {
          scale: 1,
          y: 0,
          autoAlpha: 1,
          filter: "blur(0px)",
          duration: animationDuration,
          ease: animationEase,
        });

        if (labels[index]) {
          timeline.to(
            labels[index],
            {
              y: 0,
              autoAlpha: 1,
              filter: "blur(0px)",
              duration: animationDuration,
              ease: "power3.out",
            },
            `-=${animationDuration * 0.9}`,
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([curtain, ...bubbles, ...labels]);

      if (skipCloseAnimationRef.current || reducedMotion) {
        skipCloseAnimationRef.current = false;
        gsap.set(overlay, { display: "none" });
        gsap.set(curtain, { scaleY: 0, autoAlpha: 0 });
        gsap.set(bubbles, { autoAlpha: 0 });
        gsap.set(labels, { autoAlpha: 0 });
        const frame = window.requestAnimationFrame(() =>
          setShowOverlay(false),
        );
        return () => window.cancelAnimationFrame(frame);
      }

      gsap.to(labels, {
        y: -24,
        autoAlpha: 0,
        filter: "blur(14px)",
        duration: 0.2,
        ease: "power3.in",
      });
      gsap.to(bubbles, {
        scale: 0.72,
        y: -90,
        autoAlpha: 0,
        filter: "blur(30px)",
        duration: 0.28,
        stagger: 0.025,
        ease: "power3.in",
      });
      gsap.to(curtain, {
        scaleY: 0,
        duration: 0.52,
        delay: 0.1,
        ease: "power4.inOut",
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
          setShowOverlay(false);
        },
      });
    }

    return () => {
      gsap.killTweensOf([curtain, ...bubbles, ...labels]);
    };
  }, [
    isMenuOpen,
    showOverlay,
    animationEase,
    animationDuration,
    staggerDelay,
  ]);

  useEffect(() => {
    const handleResize = () => {
      if (!isMenuOpen) return;

      const bubbles = bubblesRef.current.filter(Boolean);
      const isDesktop = window.innerWidth >= 900;

      bubbles.forEach((bubble, index) => {
        const item = menuItems[index];
        if (bubble && item) {
          gsap.set(bubble, {
            rotation: isDesktop ? (item.rotation ?? 0) : 0,
          });
        }
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isMenuOpen, menuItems]);

  return (
    <>
      <nav
        className={containerClassName}
        style={style}
        aria-label="Main navigation"
      >
        {logo && (
          <a
            className="bubble logo-bubble"
            aria-label="Back to top"
            style={{ background: menuBg }}
            href="#top"
          >
            <span className="logo-content">{logo}</span>
          </a>
        )}

        <div className="bubble-menu-end">
          {children}
          <button
            type="button"
            className={`bubble toggle-bubble menu-btn ${
              isMenuOpen ? "open" : ""
            }`}
            onClick={handleToggle}
            aria-label={menuAriaLabel}
            aria-expanded={isMenuOpen}
            aria-controls="portfolio-navigation"
            data-sound={isMenuOpen ? "menu-close" : "menu-open"}
            style={glass ? undefined : { background: menuBg }}
          >
            <span className="menu-line" style={{ background: menuContentColor }} />
            <span
              className="menu-line short"
              style={{ background: menuContentColor }}
            />
          </button>
        </div>
      </nav>

      {showOverlay && (
        <div
          id="portfolio-navigation"
          ref={overlayRef}
          className={`bubble-menu-items ${
            useFixedPosition ? "fixed" : "absolute"
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div
            ref={curtainRef}
            className="bubble-menu-curtain"
            aria-hidden="true"
            data-sound="menu-close"
            onClick={handleToggle}
          />
          <ul className="pill-list" aria-label="Menu links">
            {menuItems.map((item, index) => (
              <li key={item.href} className="pill-col">
                <a
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className="pill-link"
                  onClick={(event) => handleMenuItemClick(event, item.href)}
                  style={
                    {
                      "--item-rot": `${item.rotation ?? 0}deg`,
                      "--pill-bg": item.bgColor || menuBg,
                      "--pill-color": item.textColor || menuContentColor,
                      "--hover-bg":
                        item.hoverStyles?.bgColor || "var(--color-smoke-plate)",
                      "--hover-color":
                        item.hoverStyles?.textColor ||
                        "var(--color-bone-white)",
                    } as React.CSSProperties
                  }
                  ref={(element) => {
                    bubblesRef.current[index] = element;
                  }}
                >
                  <span
                    className="pill-label"
                    data-label={item.label}
                    ref={(element) => {
                      labelRefs.current[index] = element;
                    }}
                  >
                    <span className="pill-label-default">{item.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  );
}
