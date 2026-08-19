"use client";

import {
  memo,
  type CSSProperties,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion } from "motion/react";

import { useSound } from "@/components/sound/SoundProvider";

import "./text-flipping-board.css";

const FLAP_CHARS =
  " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$()-+&=;:'\"%,./?°";

const DESKTOP_ROWS = 6;
const DESKTOP_COLS = 22;
const MOBILE_ROWS = 8;
const MOBILE_COLS = 13;
const MOBILE_BOARD_QUERY = "(max-width: 620px)";
const BASE_COL_DELAY = 30;
const BASE_ROW_DELAY = 20;
const BASE_STEP_MS = 55;
const BASE_FLIP_SECONDS = 0.35;
const BASE_TOTAL_SECONDS =
  ((DESKTOP_COLS - 1) * BASE_COL_DELAY +
    (DESKTOP_ROWS - 1) * BASE_ROW_DELAY +
    8 * BASE_STEP_MS) /
  1000;

type AccentColor = {
  top: string;
  bottom: string;
  text: string;
};

const ACCENT_COLORS: AccentColor[] = [
  { top: "#e84249", bottom: "#c82f39", text: "#ffffff" },
  { top: "#f0b83e", bottom: "#d89d23", text: "#181b20" },
  { top: "#8ec84c", bottom: "#70aa32", text: "#181b20" },
  { top: "#2db4ca", bottom: "#1d94aa", text: "#181b20" },
  { top: "#1266ff", bottom: "#084cca", text: "#ffffff" },
  { top: "#9a77d3", bottom: "#7954ba", text: "#ffffff" },
];

function getFlapBoardSize() {
  if (
    typeof window !== "undefined" &&
    window.matchMedia(MOBILE_BOARD_QUERY).matches
  ) {
    return { rows: MOBILE_ROWS, cols: MOBILE_COLS };
  }
  return { rows: DESKTOP_ROWS, cols: DESKTOP_COLS };
}

function useFlapBoardSize() {
  const [size, setSize] = useState(getFlapBoardSize);

  useEffect(() => {
    const media = window.matchMedia(MOBILE_BOARD_QUERY);
    const update = () => setSize(getFlapBoardSize());
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return size;
}

function pickScrambleCharacter() {
  return FLAP_CHARS[
    1 + Math.floor(Math.random() * (FLAP_CHARS.length - 1))
  ];
}

const FlapCell = memo(function FlapCell({
  target,
  delay,
  stepMs,
  flipDuration,
}: {
  target: string;
  delay: number;
  stepMs: number;
  flipDuration: number;
}) {
  const [current, setCurrent] = useState(" ");
  const [previous, setPrevious] = useState(" ");
  const [flipId, setFlipId] = useState(0);
  const [accent, setAccent] = useState<AccentColor | null>(null);
  const [previousAccent, setPreviousAccent] =
    useState<AccentColor | null>(null);
  const currentRef = useRef(" ");
  const targetRef = useRef<string | null>(null);
  const accentRef = useRef<AccentColor | null>(null);
  const startTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stepTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (startTimer.current) clearTimeout(startTimer.current);
    if (stepTimer.current) clearTimeout(stepTimer.current);

    const normalized = FLAP_CHARS.includes(target.toUpperCase())
      ? target.toUpperCase()
      : " ";
    if (normalized === targetRef.current) return;
    targetRef.current = normalized;

    if (normalized === " " && currentRef.current === " ") return;

    const scrambleCount =
      normalized === " "
        ? 7 + Math.floor(Math.random() * 5)
        : 13 + Math.floor(Math.random() * 8);

    const runStep = (step: number) => {
      const isLast = step === scrambleCount;
      const nextCharacter = isLast ? normalized : pickScrambleCharacter();
      const nextAccent =
        isLast || Math.random() >= 0.16
          ? null
          : ACCENT_COLORS[
              Math.floor(Math.random() * ACCENT_COLORS.length)
            ];

      setPrevious(currentRef.current);
      setPreviousAccent(accentRef.current);
      currentRef.current = nextCharacter;
      accentRef.current = nextAccent;
      setCurrent(nextCharacter);
      setAccent(nextAccent);
      setFlipId((value) => value + 1);

      if (!isLast) {
        stepTimer.current = setTimeout(
          () => runStep(step + 1),
          stepMs,
        );
      }
    };

    startTimer.current = setTimeout(() => runStep(1), delay);

    return () => {
      if (startTimer.current) clearTimeout(startTimer.current);
      if (stepTimer.current) clearTimeout(stepTimer.current);
      startTimer.current = null;
      stepTimer.current = null;
      targetRef.current = null;
    };
  }, [delay, stepMs, target]);

  const visibleCharacter = current === " " ? "\u00A0" : current;
  const previousCharacter = previous === " " ? "\u00A0" : previous;
  const topColor = accent?.top ?? "#e7e4dc";
  const bottomColor = accent?.bottom ?? "#d9d6ce";
  const textColor = accent?.text ?? "#181b20";
  const previousTopColor = previousAccent?.top ?? "#efede6";
  const previousTextColor = previousAccent?.text ?? "#181b20";
  const bottomDelay = flipDuration * 0.5;

  return (
    <div className="flap-cell">
      <div className="flap-character">
        <div className="flap-pin-line" aria-hidden="true" />

        <div
          className="flap-static flap-static-top"
          style={{ backgroundColor: topColor }}
        >
          <span
            className="flap-glyph flap-glyph-top"
            style={{ color: textColor }}
          >
            {visibleCharacter}
          </span>
        </div>

        <div
          className="flap-static flap-static-bottom"
          style={{ backgroundColor: bottomColor }}
        >
          <span
            className="flap-glyph flap-glyph-bottom"
            style={{ color: textColor }}
          >
            {visibleCharacter}
          </span>
          {flipId > 0 && (
            <motion.span
              className="flap-flash"
              key={`flash-${flipId}`}
              initial={{ opacity: 0.5 }}
              animate={{ opacity: 0 }}
              transition={{
                duration: flipDuration * 1.3,
                ease: "easeOut",
              }}
            />
          )}
        </div>

        {flipId > 0 && (
          <motion.div
            className="flap-moving flap-moving-top"
            key={`top-${flipId}`}
            style={{ backgroundColor: previousTopColor }}
            initial={{ rotateX: 0 }}
            animate={{ rotateX: -100 }}
            transition={{
              duration: flipDuration,
              ease: [0.55, 0.055, 0.675, 0.19],
            }}
          >
            <span
              className="flap-glyph flap-glyph-top"
              style={{ color: previousTextColor }}
            >
              {previousCharacter}
            </span>
            <motion.span
              className="flap-top-shadow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ duration: flipDuration }}
            />
          </motion.div>
        )}

        {flipId > 0 && (
          <motion.div
            className="flap-moving flap-moving-bottom"
            key={`bottom-${flipId}`}
            style={{ backgroundColor: bottomColor }}
            initial={{ rotateX: 90 }}
            animate={{ rotateX: 0 }}
            transition={{
              duration: flipDuration * 0.85,
              delay: bottomDelay,
              ease: [0.33, 1.55, 0.64, 1],
            }}
          >
            <span
              className="flap-glyph flap-glyph-bottom"
              style={{ color: textColor }}
            >
              {visibleCharacter}
            </span>
            <motion.span
              className="flap-bottom-shine"
              initial={{ opacity: 0.4 }}
              animate={{ opacity: 0 }}
              transition={{
                duration: flipDuration * 0.85,
                delay: bottomDelay,
              }}
            />
          </motion.div>
        )}

        <span className="flap-split-line" aria-hidden="true" />
      </div>
      <div className="flap-stripes" aria-hidden="true" />
    </div>
  );
});

type ParsedCell =
  | { type: "character"; value: string }
  | { type: "color"; value: string };

const COLOR_TOKENS: Record<string, string> = {
  "{R}": "#d32f2f",
  "{O}": "#f57c00",
  "{Y}": "#fbc02d",
  "{G}": "#43a047",
  "{B}": "#1e88e5",
  "{V}": "#8e24aa",
  "{W}": "#fafafa",
};

function parseRow(row: string): ParsedCell[] {
  const cells: ParsedCell[] = [];
  let index = 0;

  while (index < row.length) {
    const token = row.slice(index, index + 3);
    if (COLOR_TOKENS[token]) {
      cells.push({ type: "color", value: COLOR_TOKENS[token] });
      index += 3;
      continue;
    }

    cells.push({ type: "character", value: row[index] });
    index += 1;
  }

  return cells;
}

function wrapParagraph(paragraph: string, maximumColumns: number) {
  const lines: string[] = [];
  const words = paragraph.split(/[ \t]+/).filter(Boolean);
  let currentLine = "";

  for (const word of words) {
    if (word.length > maximumColumns) {
      if (currentLine) {
        lines.push(currentLine);
        currentLine = "";
      }
      lines.push(word.slice(0, maximumColumns));
      continue;
    }

    if (!currentLine) {
      currentLine = word;
    } else if (
      currentLine.length + 1 + word.length <=
      maximumColumns
    ) {
      currentLine += ` ${word}`;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) lines.push(currentLine);
  return lines;
}

function wrapText(input: string, maximumColumns: number) {
  return input
    .split("\n")
    .flatMap((paragraph) =>
      paragraph.trim() === ""
        ? [""]
        : wrapParagraph(paragraph, maximumColumns),
    );
}

export type TextFlippingBoardProps = {
  rows?: string[];
  text?: string;
  className?: string;
  duration?: number;
};

export function TextFlippingBoard({
  rows,
  text,
  className = "",
  duration = BASE_TOTAL_SECONDS,
}: TextFlippingBoardProps) {
  const { rows: boardRows, cols: boardCols } = useFlapBoardSize();
  const scale = duration / BASE_TOTAL_SECONDS;
  const columnDelay = BASE_COL_DELAY * scale;
  const rowDelay = BASE_ROW_DELAY * scale;
  const stepMs = BASE_STEP_MS * scale;
  const flipDuration = Math.min(
    0.6,
    Math.max(0.15, BASE_FLIP_SECONDS * scale),
  );

  const board = useMemo(() => {
    const grid: ParsedCell[][] = Array.from(
      { length: boardRows },
      () =>
        Array.from({ length: boardCols }, () => ({
          type: "character" as const,
          value: " ",
        })),
    );

    if (text) {
      const lines = wrapText(text, boardCols).slice(0, boardRows);
      const startingRow = Math.max(
        0,
        Math.floor((boardRows - lines.length) / 2),
      );

      lines.forEach((line, lineIndex) => {
        const rowIndex = startingRow + lineIndex;
        if (rowIndex >= boardRows) return;

        const parsedLine = parseRow(line);
        const startingColumn = Math.max(
          0,
          Math.floor((boardCols - parsedLine.length) / 2),
        );

        parsedLine.forEach((cell, columnIndex) => {
          if (startingColumn + columnIndex < boardCols) {
            grid[rowIndex][startingColumn + columnIndex] = cell;
          }
        });
      });
    } else if (rows) {
      rows.forEach((row, rowIndex) => {
        if (rowIndex >= boardRows) return;
        parseRow(row).forEach((cell, columnIndex) => {
          if (columnIndex < boardCols) {
            grid[rowIndex][columnIndex] = cell;
          }
        });
      });
    }

    return grid;
  }, [boardCols, boardRows, rows, text]);

  // Hundreds of flaps step at once, so the clatter is scheduled as one burst
  // for the length of the board change rather than per flip. The board cycles
  // messages on its own every few seconds, so only the first change gets the
  // full burst; the rest sit back to stay listenable.
  const { clatter } = useSound();
  const hasClatteredRef = useRef(false);
  useEffect(() => {
    clatter(duration, hasClatteredRef.current ? 0.5 : 1);
    hasClatteredRef.current = true;
  }, [board, duration, clatter]);

  return (
    <div className={`text-flipping-board ${className}`}>
      <div
        className="flap-grid"
        style={{ "--flap-cols": boardCols } as CSSProperties}
      >
        {board.map((row, rowIndex) =>
          row.map((cell, columnIndex) =>
            cell.type === "color" ? (
              <div
                className="flap-color-cell"
                key={`${rowIndex}-${columnIndex}`}
                style={{ backgroundColor: cell.value }}
              />
            ) : (
              <FlapCell
                key={`${rowIndex}-${columnIndex}`}
                target={cell.value}
                delay={
                  columnIndex * columnDelay + rowIndex * rowDelay
                }
                stepMs={stepMs}
                flipDuration={flipDuration}
              />
            ),
          ),
        )}
      </div>
    </div>
  );
}
