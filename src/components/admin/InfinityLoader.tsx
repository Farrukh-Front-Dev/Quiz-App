"use client";

import React from "react";

export type InfinityLoaderProps = {
  size?: number | string; // e.g. 48 or "3rem"
  color?: string;
  duration?: number; // seconds
  ariaLabel?: string;
  className?: string;
};

export default function InfinityLoader({
  size = 48,
  color = "#2563EB",
  duration = 1.8,
  ariaLabel = "Loading",
  className = "",
}: InfinityLoaderProps) {
  // Normalize size to CSS value
  const sizeValue = typeof size === "number" ? `${size}px` : size;
  const styleVars: React.CSSProperties = {
    // CSS variables for easy overrides
    ["--inf-size" as any]: sizeValue,
    ["--inf-color" as any]: color,
    ["--inf-duration" as any]: `${duration}s`,
  };

  return (
    <div
      role="img"
      aria-label={ariaLabel}
      className={`inf-loader-root ${className}`}
      style={styleVars}
    >
      {/* Off-screen text for screen readers if an aria-live container is not used */}
      <span className="sr-only">{ariaLabel}…</span>

      {/* Inline accessible SVG */}
      <svg
        viewBox="0 0 64 32"
        width="var(--inf-size)"
        height="calc(var(--inf-size) * 0.5)"
        aria-hidden="false"
        role="img"
        className="inf-svg"
      >
        <title>Loading</title>
        <desc>An animated infinity-shaped loading indicator.</desc>
        <path
          className="inf-path"
          d="M4 16 C4 7, 22 7, 22 16 C22 25, 40 25, 40 16 C40 7, 58 7, 58 16"
          fill="none"
          stroke="var(--inf-color)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      <style jsx>{`
        .inf-loader-root {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: var(--inf-size);
          height: calc(var(--inf-size) * 0.5);
          --inf-color: ${color};
          --inf-duration: ${duration}s;
        }

        /* screen-reader only */
        .sr-only {
          position: absolute !important;
          height: 1px;
          width: 1px;
          overflow: hidden;
          clip: rect(1px, 1px, 1px, 1px);
          white-space: nowrap;
          border: 0;
          padding: 0;
          margin: -1px;
        }

        .inf-svg {
          display: block;
          will-change: transform, opacity;
        }

        .inf-path {
          stroke-dasharray: 140; /* tuned for path length */
          stroke-dashoffset: 140;
          transform-origin: 50% 50%;
          animation: draw var(--inf-duration) linear infinite,
            pulse calc(var(--inf-duration) * 2) ease-in-out infinite;
        }

        /* Drawing animation: moves dashoffset to create a flowing stroke */
        @keyframes draw {
          0% {
            stroke-dashoffset: 140;
            opacity: 0.85;
          }
          50% {
            stroke-dashoffset: 0;
            opacity: 1;
          }
          100% {
            stroke-dashoffset: -140;
            opacity: 0.85;
          }
        }

        /* subtle scale pulse synced to the animation */
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.06);
          }
          100% {
            transform: scale(1);
          }
        }

        /* Reduced motion preference — show static icon */
        @media (prefers-reduced-motion: reduce) {
          .inf-path {
            animation: none !important;
            stroke-dasharray: none;
            stroke-dashoffset: 0;
          }
        }

        /* Optional dark theme example — override in parent via CSS variables */
        :global(.dark) .inf-loader-root {
          --inf-color: #fff;
        }
      `}</style>
    </div>
  );
}

/*
Usage examples (copy into your Next.js page or component):

// Simple import and use
import InfinityLoader from "@/components/InfinityLoader";

export default function Page() {
  return (
    <div aria-live="polite">
      <InfinityLoader size={56} color="#06b6d4" duration={1.6} ariaLabel="Loading CRM data" />
    </div>
  );
}

// CSS-based override for dark mode (global stylesheet)
// .dark :global(.inf-loader-root) { --inf-color: #fff; }

*/