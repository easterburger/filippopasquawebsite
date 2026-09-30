import { balloonSvg } from "./balloon-art";

import "./balloon-logo.css";

// Filippo's initials as a foil balloon, floating in the top-left corner of the
// home page on a string. The same art is the site's favicon.

const BALLOON_MARKUP = balloonSvg();

export default function BalloonLogo({ ready }: { ready: boolean }) {
  return (
    <a
      className={`balloon-logo${ready ? " is-ready" : ""}`}
      href="#top"
      aria-label="Filippo Pasqua, back to the top"
    >
      <span className="balloon-float" aria-hidden="true">
        <svg className="balloon-string" viewBox="0 0 20 64" preserveAspectRatio="none">
          <path d="M10 0 C 4 14, 16 26, 10 38 S 5 54, 11 64" />
        </svg>
        <span className="balloon-art" dangerouslySetInnerHTML={{ __html: BALLOON_MARKUP }} />
      </span>
    </a>
  );
}
