import "./covers.css";

// The IB Diploma and Oxford Royale covers, shared by the library shelf and
// the book lying on the home desk.

/** Physics, CS, Economics (higher level), then Math, English, French. */
const SUBJECT_COLOURS = ["#e84249", "#2db4ca", "#e9b936", "#f28c38", "#8ec84c", "#9a77d3"];

export function IbCover() {
  return (
    <span className="bookcover edu-cover-ib">
      <span className="edu-cover-ib-bands" aria-hidden="true">
        {SUBJECT_COLOURS.map((colour) => (
          <span key={colour} style={{ background: colour }} />
        ))}
      </span>
      <span className="edu-cover-ib-word">IB</span>
      <span className="edu-cover-ib-title">Diploma Programme</span>
      <span className="edu-cover-ib-foot">American School of Milan</span>
    </span>
  );
}

export function OxfordCover() {
  return (
    <span className="bookcover edu-cover-oxford">
      <span className="edu-cover-oxford-frame" aria-hidden="true" />
      <span className="edu-cover-oxford-title">Oxford</span>
      <span className="edu-cover-oxford-sub">Royale · Summer 2025</span>
      <span className="edu-cover-oxford-foot">Engineering</span>
      <svg
        className="edu-cover-oxford-skyline"
        viewBox="0 0 100 34"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M0 34V22h6v-4l3-9 3 9v4h5V16h4v-3l2-4 2 4v3h4v18h3V20c0-5 4-9 9-9s9 4 9 9v1h2v-4h3l2-11 2 11h3v6h5V14l3-8 3 8v13h4v-5h4l3-7 3 7v12h6V21h5v13z" />
      </svg>
    </span>
  );
}
