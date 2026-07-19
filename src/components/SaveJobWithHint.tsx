"use client";

import { useEffect, useState } from "react";
import { SaveJobButton } from "@/components/SaveJobButton";

const STORAGE_KEY = "careersasa-save-hint-seen";

type SaveJobWithHintProps = {
  jobId: string;
};

/**
 * Save control with a playful one-time "save me :)" beeline that loops
 * toward the bookmark, then fades away so it never becomes clutter.
 */
export default function SaveJobWithHint({ jobId }: SaveJobWithHintProps) {
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    try {
      if (sessionStorage.getItem(STORAGE_KEY)) return;
    } catch {
      // ignore storage failures
    }

    const showTimer = window.setTimeout(() => setShowHint(true), 400);
    const hideTimer = window.setTimeout(() => {
      setShowHint(false);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        // ignore
      }
    }, 5200);

    return () => {
      window.clearTimeout(showTimer);
      window.clearTimeout(hideTimer);
    };
  }, []);

  const dismissHint = () => {
    setShowHint(false);
    try {
      sessionStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative shrink-0" onClick={dismissHint}>
      {/* Playful beeline — mobile only, short-lived */}
      <div
        className={`pointer-events-none absolute -left-[5.75rem] top-9 z-10 w-[7.5rem] transition-all duration-500 sm:hidden ${
          showHint ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"
        }`}
        aria-hidden={!showHint}
      >
        <p className="mb-0.5 text-right font-serif text-[11px] italic leading-none text-[#0A66C2]">
          save me :)
        </p>
        <svg
          viewBox="0 0 120 54"
          className="h-[54px] w-full overflow-visible"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M8 8 C 28 8, 36 42, 58 34 S 92 6, 108 22"
            stroke="#0A66C2"
            strokeWidth="1.6"
            strokeDasharray="4 3.5"
            strokeLinecap="round"
            style={{ animation: "beeline-dash 1.4s linear infinite" }}
          />
          <path
            d="M100 16 L110 24 L98 30"
            stroke="#0A66C2"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      <SaveJobButton
        jobId={jobId}
        variant="outline"
        size="icon"
        showText={false}
        className="relative z-20 sm:hidden"
      />
      <SaveJobButton
        jobId={jobId}
        variant="outline"
        size="default"
        showText={true}
        className="relative z-20 hidden sm:inline-flex"
      />
    </div>
  );
}
