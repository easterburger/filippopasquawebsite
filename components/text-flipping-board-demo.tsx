"use client";

import { useCallback, useEffect, useState } from "react";

import { TextFlippingBoard } from "@/components/ui/text-flipping-board";

const MESSAGES = [
  "Hey my name is filippo pasqua.",
  "I live in Milan, Italy.",
  "I am an IB student.",
  "I've built many software projects.",
  "Some, ai products for students like me.",
  "The project i am most proud of is Dawn, an ai personal assistant.",
  "I've also built some cool software for companies.",
  "for example a 90's inspired car racing videogame for borromeo de silva and tuttobene hillclimb.",
  "as well as internal software and ai tools for pasqua wines.",
];

const MESSAGE_DURATIONS = [
  4200,
  3800,
  3600,
  4600,
  5000,
  6500,
  5200,
  8000,
  6200,
];

export default function TextFlippingBoardDemo() {
  const [messageIndex, setMessageIndex] = useState(0);

  const showNextMessage = useCallback(() => {
    setMessageIndex((index) => (index + 1) % MESSAGES.length);
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(
      showNextMessage,
      MESSAGE_DURATIONS[messageIndex],
    );
    return () => window.clearTimeout(timeout);
  }, [messageIndex, showNextMessage]);

  return (
    <div className="hello-board" aria-live="polite">
      <p className="hello-board-kicker">A QUICK INTRODUCTION</p>
      <TextFlippingBoard text={MESSAGES[messageIndex]} duration={1.05} />
    </div>
  );
}
