"use client";

import { useState } from "react";

import BubbleMenu from "./BubbleMenu";
import CurvedInput from "./CurvedInput";
import { portfolioMenuItems } from "./portfolio-menu";

type SignupStatus = "idle" | "submitting" | "success" | "error";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const CONTACT_EMAIL = "filippo.pasquadib@gmail.com";
const LINKEDIN_URL =
  "https://www.linkedin.com/in/filippo-pasqua-di-bisceglie-24761629a/";

export default function ContactPage() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<SignupStatus>("idle");
  const [statusMessage, setStatusMessage] = useState(
    "Sign up to Filippo's updates.",
  );
  const [hasCopiedEmail, setHasCopiedEmail] = useState(false);

  const handleSubmit = async (rawEmail: string) => {
    const normalizedEmail = rawEmail.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setStatus("error");
      setStatusMessage("That email address needs a quick check.");
      return;
    }

    setStatus("submitting");
    setStatusMessage("Adding you to the list…");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });
      const result = (await response.json()) as {
        message?: string;
      };

      if (!response.ok) {
        throw new Error(result.message || "Unable to complete the signup.");
      }

      setStatus("success");
      setStatusMessage("You're in — hello from Filippo.");
    } catch (error) {
      setStatus("error");
      setStatusMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.",
      );
    }
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL);
      setHasCopiedEmail(true);
      window.setTimeout(() => setHasCopiedEmail(false), 1800);
    } catch {
      setHasCopiedEmail(false);
    }
  };

  return (
    <main className="contact-page">
      <BubbleMenu
        items={portfolioMenuItems}
        menuAriaLabel="Toggle portfolio navigation"
        menuBg="#f1efe6"
        menuContentColor="#181b20"
        useFixedPosition
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.1}
        glass
      />

      <section
        id="contact"
        className="contact-section"
        aria-labelledby="contact-heading"
      >
        <div className="contact-canvas">
          <div className="contact-background" aria-hidden="true" />
          <div className="contact-image-wash" aria-hidden="true" />

          <h1 id="contact-heading" className="contact-heading">
            CONTACT ME
          </h1>

          <div
            className={`contact-signup-shell contact-signup-${status}`}
          >
            <div
              className="contact-message-bubble"
              role="status"
              aria-live="polite"
            >
              {statusMessage}
            </div>

            <p className="contact-signup-eyebrow">OCCASIONAL NOTES</p>
            <CurvedInput
              value={email}
              onChange={(value: string) => {
                setEmail(value);
                if (status !== "idle") {
                  setStatus("idle");
                  setStatusMessage("Sign up to Filippo's updates.");
                }
              }}
              onSubmit={handleSubmit}
              placeholder="your@email.com"
              buttonText={status === "submitting" ? "SENDING" : "SIGN UP"}
              type="email"
              name="email"
              ariaLabel="Email address for Filippo's updates"
              theme="light"
              width="100%"
              bend={30}
              height={68}
              cornerRadius={19}
              borderWidth={1.25}
              fontSize={15}
              backgroundColor="rgba(250, 248, 239, 0.88)"
              textColor="#12221a"
              placeholderColor="#66736b"
              borderColor="rgba(18, 34, 26, 0.58)"
              buttonColor="#1769ff"
              buttonTextColor="#ffffff"
              iconColor="#1769ff"
              shadowSize="lg"
              shadowColor="#10291d"
              className="contact-curved-input"
            />
            <p className="contact-signup-note">
              No spam. Just projects, experiments, and things worth sharing.
            </p>
          </div>

          <aside className="contact-social-stack" aria-label="Contact links">
            <a
              className="contact-social-button contact-linkedin"
              href={LINKEDIN_URL}
              target="_blank"
              rel="noreferrer"
              aria-label="Open Filippo's LinkedIn profile"
            >
              <span className="contact-linkedin-mark" aria-hidden="true">
                in
              </span>
            </a>

            <details className="contact-email-options">
              <summary
                className="contact-social-button contact-email-toggle"
                aria-label="Show email options"
              >
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className="contact-email-icon"
                >
                  <path d="M3.75 5.75h16.5v12.5H3.75z" />
                  <path d="m4.5 7 7.5 6 7.5-6" />
                </svg>
              </summary>

              <div className="contact-email-menu">
                <button type="button" onClick={copyEmail}>
                  <span>{CONTACT_EMAIL}</span>
                  <small>{hasCopiedEmail ? "COPIED" : "COPY"}</small>
                </button>
                <a href={`mailto:${CONTACT_EMAIL}`}>
                  <span>send email</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </details>
          </aside>
        </div>
      </section>
    </main>
  );
}
