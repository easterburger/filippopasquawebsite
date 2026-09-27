import { IbCover, OxfordCover } from "../education/covers";

import type { DoorId } from "./rooms";

// The four souvenirs on the home desk. All of it is decoration (aria-hidden);
// the link text is the label tape. The element marked data-portal is the part
// that grows into the room when the door is opened.

function RecordArt() {
  return (
    <span className="rec" aria-hidden="true">
      <span className="rec-under">
        <img
          src="/hero-stickers/tuttobene-icon.webp"
          alt=""
          width={256}
          height={256}
          decoding="async"
        />
      </span>
      <span className="rec-disc" data-portal="">
        <span className="rec-spin">
          <span className="rec-label">
            <img src="/projects/dawn-cover.webp" alt="" width={640} height={640} decoding="async" />
          </span>
        </span>
        <span className="rec-sheen" />
        <span className="rec-hole" />
      </span>
      <span className="rec-sleeve">
        <img src="/projects/dawn-cover.webp" alt="" width={640} height={640} decoding="async" />
      </span>
    </span>
  );
}

function BookArt() {
  return (
    <span className="book" aria-hidden="true">
      <span className="book-under">
        <OxfordCover />
      </span>
      <span className="book-pages" />
      <span className="book-ribbon" />
      <span className="book-page1">
        <span className="book-page1-script">Ex libris</span>
        <span className="book-page1-name">Filippo Pasqua</span>
      </span>
      <span className="book-cover" data-portal="">
        <IbCover />
      </span>
    </span>
  );
}

function PolaroidArt() {
  return (
    <span className="pol" aria-hidden="true">
      <span className="pol-photo" data-portal="">
        <span className="pol-cloud pol-cloud--a" />
        <span className="pol-cloud pol-cloud--b" />
        <span className="pol-gloss" />
      </span>
      <span className="pol-caption">Milano</span>
    </span>
  );
}

function WaxSeal() {
  return (
    <svg className="env-seal-art" viewBox="-12 -12 24 24">
      <path
        d="M0-10.6c2.3 0 3.4 1.6 5.4 2.5 2 .9 4.6 1 5.2 3.3.6 2.2-1.3 3.4-1.5 5.6-.2 2.2 1.4 4-.1 5.8-1.5 1.8-3.8.9-5.8 1.9C1.2 9.5.6 11.1-1.6 10.9c-2.2-.2-2.7-2-4.6-3-1.9-1-4.4-1-5-3.2-.6-2.2 1.3-3.5 1.4-5.7.1-2.2-1.5-3.9 0-5.7 1.5-1.8 3.8-1 5.8-2C-2.8-9.5-2.3-10.6 0-10.6Z"
        fill="#244e3b"
        stroke="#1a3a2c"
        strokeWidth="0.6"
      />
      <circle r="7.4" fill="none" stroke="#1a3a2c" strokeWidth="0.5" opacity="0.7" />
      {[0, 72, 144, 216, 288].map((angle) => (
        <ellipse
          key={angle}
          cx="0"
          cy="-3.4"
          rx="1.7"
          ry="3"
          fill="#2f6149"
          stroke="rgb(255 255 255 / 0.18)"
          strokeWidth="0.3"
          transform={`rotate(${angle})`}
        />
      ))}
      <circle r="1.3" fill="#1a3a2c" />
    </svg>
  );
}

function EnvelopeArt() {
  return (
    <span className="env" aria-hidden="true">
      <span className="env-inner" />
      <span className="env-letter">
        <span>Ciao!</span>
      </span>
      <svg className="env-body" viewBox="0 0 96 62" preserveAspectRatio="none">
        <path d="M0 0 L44 34 L0 62Z" fill="#e8dcc4" />
        <path d="M96 0 L52 34 L96 62Z" fill="#e8dcc4" />
        <path d="M0 62 L48 30 L96 62Z" fill="#e4d6bb" />
        <path
          d="M0 0 L44 34 L0 62 M96 0 L52 34 L96 62 M0 62 L48 30 L96 62"
          fill="none"
          stroke="rgb(120 96 60 / 0.22)"
          strokeWidth="0.4"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span className="env-flap">
        <svg viewBox="0 0 96 36" preserveAspectRatio="none">
          <path
            d="M0 0 L96 0 L48 36Z"
            fill="#f1e7d3"
            stroke="rgb(120 96 60 / 0.22)"
            strokeWidth="0.4"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        <span className="env-seal" data-portal="">
          <WaxSeal />
        </span>
      </span>
    </span>
  );
}

export function DoorArt({ id }: { id: DoorId }) {
  if (id === "record") return <RecordArt />;
  if (id === "book") return <BookArt />;
  if (id === "photo") return <PolaroidArt />;
  return <EnvelopeArt />;
}
