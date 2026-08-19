"use client";

import { ArrowLeft } from "@phosphor-icons/react";

import { usePageTransition } from "./PageTransition";

export default function SubpageBackLink({
  href = "/work",
  label = "work & projects",
  className,
}: {
  href?: string;
  label?: string;
  className?: string;
}) {
  const { transitionTo } = usePageTransition();

  return (
    <a
      href={href}
      className={`subpage-back-link${className ? ` ${className}` : ""}`}
      onClick={(event) => {
        event.preventDefault();
        transitionTo(href);
      }}
    >
      <ArrowLeft weight="bold" size={15} />
      {label}
    </a>
  );
}
