"use client";

import { ArrowDown, ArrowUpRight, Sparkle } from "@phosphor-icons/react";

type HeroActionMarkKind = "explore" | "spark" | "down";

const ICONS = {
  explore: ArrowUpRight,
  spark: Sparkle,
  down: ArrowDown,
} as const;

export default function HeroActionMark({
  kind,
}: {
  kind: HeroActionMarkKind;
}) {
  const Icon = ICONS[kind];

  return (
    <span className="hero-action-mark" aria-hidden="true">
      <Icon className="hero-action-glyph" weight="bold" />
    </span>
  );
}
