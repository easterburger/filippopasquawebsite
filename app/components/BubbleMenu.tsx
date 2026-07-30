"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import "./BubbleMenu.css";

export type BubbleMenuItem = {
  label: string;
  href: string;
  ariaLabel?: string;
  rotation?: number;
  hoverStyles?: {
    bgColor?: string;
    textColor?: string;
  };
};

type BubbleMenuProps = {
  logo: React.ReactNode | string;
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
}: BubbleMenuProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const bubblesRef = useRef<Array<HTMLAnchorElement | null>>([]);
  const labelRefs = useRef<Array<HTMLSpanElement | null>>([]);

  const menuItems = items?.length ? items : DEFAULT_ITEMS;
  const containerClassName = [
    "bubble-menu",
    useFixedPosition ? "fixed" : "absolute",
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

  const handleMenuItemClick = () => {
    setIsMenuOpen(false);
    onMenuClick?.(false);
  };

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
    const bubbles = bubblesRef.current.filter(Boolean);
    const labels = labelRefs.current.filter(Boolean);

    if (!overlay || !bubbles.length) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (isMenuOpen) {
      gsap.set(overlay, { display: "flex" });
      gsap.killTweensOf([...bubbles, ...labels]);

      if (reducedMotion) {
        gsap.set(bubbles, { scale: 1 });
        gsap.set(labels, { y: 0, autoAlpha: 1 });
        return;
      }

      gsap.set(bubbles, { scale: 0, transformOrigin: "50% 50%" });
      gsap.set(labels, { y: 24, autoAlpha: 0 });

      bubbles.forEach((bubble, index) => {
        const delay =
          index * staggerDelay + gsap.utils.random(-0.035, 0.035);
        const timeline = gsap.timeline({ delay });

        timeline.to(bubble, {
          scale: 1,
          duration: animationDuration,
          ease: animationEase,
        });

        if (labels[index]) {
          timeline.to(
            labels[index],
            {
              y: 0,
              autoAlpha: 1,
              duration: animationDuration,
              ease: "power3.out",
            },
            `-=${animationDuration * 0.9}`,
          );
        }
      });
    } else if (showOverlay) {
      gsap.killTweensOf([...bubbles, ...labels]);

      if (reducedMotion) {
        gsap.set(overlay, { display: "none" });
        const frame = window.requestAnimationFrame(() =>
          setShowOverlay(false),
        );
        return () => window.cancelAnimationFrame(frame);
      }

      gsap.to(labels, {
        y: 24,
        autoAlpha: 0,
        duration: 0.2,
        ease: "power3.in",
      });
      gsap.to(bubbles, {
        scale: 0,
        duration: 0.2,
        ease: "power3.in",
        onComplete: () => {
          gsap.set(overlay, { display: "none" });
          setShowOverlay(false);
        },
      });
    }

    return () => {
      gsap.killTweensOf([...bubbles, ...labels]);
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
        <a
          className="bubble logo-bubble"
          aria-label="Back to top"
          style={{ background: menuBg }}
          href="#top"
        >
          <span className="logo-content">{logo}</span>
        </a>

        <button
          type="button"
          className={`bubble toggle-bubble menu-btn ${
            isMenuOpen ? "open" : ""
          }`}
          onClick={handleToggle}
          aria-label={menuAriaLabel}
          aria-expanded={isMenuOpen}
          aria-controls="portfolio-navigation"
          style={{ background: menuBg }}
        >
          <span className="menu-line" style={{ background: menuContentColor }} />
          <span
            className="menu-line short"
            style={{ background: menuContentColor }}
          />
        </button>
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
          <ul className="pill-list" aria-label="Menu links">
            {menuItems.map((item, index) => (
              <li key={item.href} className="pill-col">
                <a
                  href={item.href}
                  aria-label={item.ariaLabel || item.label}
                  className="pill-link"
                  onClick={handleMenuItemClick}
                  style={
                    {
                      "--item-rot": `${item.rotation ?? 0}deg`,
                      "--pill-bg": menuBg,
                      "--pill-color": menuContentColor,
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
                    ref={(element) => {
                      labelRefs.current[index] = element;
                    }}
                  >
                    {item.label}
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
