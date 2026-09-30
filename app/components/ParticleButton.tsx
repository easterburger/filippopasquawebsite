"use client";

import { motion } from "motion/react";
import { createPortal } from "react-dom";
import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ParticleButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  onSuccess?: () => void;
  successDuration?: number;
};

const PARTICLES = [
  { x: -68, y: -45, delay: 0, size: 7 },
  { x: -34, y: -70, delay: 0.04, size: 5 },
  { x: 6, y: -76, delay: 0.08, size: 8 },
  { x: 50, y: -55, delay: 0.12, size: 6 },
  { x: 72, y: -18, delay: 0.16, size: 5 },
  { x: 52, y: 34, delay: 0.2, size: 7 },
  { x: 8, y: 48, delay: 0.24, size: 5 },
  { x: -48, y: 28, delay: 0.28, size: 6 },
];

function SuccessParticles({
  origin,
}: {
  origin: { x: number; y: number };
}) {
  return (
    <div className="particle-field" aria-hidden="true">
      {PARTICLES.map((particle, index) => (
        <motion.span
          className="success-particle"
          key={index}
          initial={{ scale: 0, x: 0, y: 0, opacity: 0 }}
          animate={{
            scale: [0, 1, 0],
            x: [0, particle.x],
            y: [0, particle.y],
            opacity: [0, 1, 0],
          }}
          style={{
            left: origin.x,
            top: origin.y,
            width: particle.size,
            height: particle.size,
          }}
          transition={{
            duration: 0.68,
            delay: particle.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

export default function ParticleButton({
  children,
  onClick,
  onSuccess,
  successDuration = 1000,
  className = "",
  ...props
}: ParticleButtonProps) {
  const [particleBurst, setParticleBurst] = useState<{
    id: number;
    x: number;
    y: number;
  } | null>(null);
  const burstIdRef = useRef(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    const rect = event.currentTarget.getBoundingClientRect();
    burstIdRef.current += 1;
    setParticleBurst({
      id: burstIdRef.current,
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    });

    timeoutRef.current = setTimeout(() => {
      setParticleBurst(null);
      onSuccess?.();
    }, successDuration);
  };

  return (
    <>
      {particleBurst &&
        createPortal(
          <SuccessParticles
            key={particleBurst.id}
            origin={{ x: particleBurst.x, y: particleBurst.y }}
          />,
          document.body,
        )}
      <button
        {...props}
        className={`${className}${particleBurst ? " is-popping" : ""}`}
        onClick={handleClick}
      >
        {children}
      </button>
    </>
  );
}
