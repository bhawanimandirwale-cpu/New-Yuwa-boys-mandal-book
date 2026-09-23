"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface RadialGlowButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: "cosmic" | "saffron" | "emerald" | "rose" | "ocean";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
}

const sizeClasses = {
  sm: "min-w-[120px] min-h-[38px] px-4 py-2 text-xs sm:text-sm rounded-xl",
  md: "min-w-[150px] min-h-[46px] px-5 py-2.5 text-sm sm:text-base rounded-2xl",
  lg: "min-w-[180px] min-h-[52px] px-6 py-3.5 text-base sm:text-lg rounded-2xl",
};

const variantCustomVars: Record<string, string> = {
  cosmic: "",
  saffron: `
    --rg-color-1: #200600;
    --rg-color-2: #7c2d12;
    --rg-color-3: #ea580c;
    --rg-color-4: #fef08a;
    --rg-color-5: hsl(20 90% 4%);
    --rg-border-color-1: hsla(28, 95%, 75%, 0.85);
    --rg-border-color-2: hsla(28, 80%, 65%, 0.3);
  `,
  emerald: `
    --rg-color-1: #022c22;
    --rg-color-2: #065f46;
    --rg-color-3: #059669;
    --rg-color-4: #6ee7b7;
    --rg-color-5: hsl(160 85% 3%);
    --rg-border-color-1: hsla(158, 85%, 75%, 0.85);
    --rg-border-color-2: hsla(158, 70%, 65%, 0.3);
  `,
  rose: `
    --rg-color-1: #290412;
    --rg-color-2: #881337;
    --rg-color-3: #e11d48;
    --rg-color-4: #fecdd3;
    --rg-color-5: hsl(340 85% 3%);
    --rg-border-color-1: hsla(345, 85%, 75%, 0.85);
    --rg-border-color-2: hsla(345, 70%, 65%, 0.3);
  `,
  ocean: `
    --rg-color-1: #031326;
    --rg-color-2: #0369a1;
    --rg-color-3: #0284c7;
    --rg-color-4: #7dd3fc;
    --rg-color-5: hsl(205 90% 3%);
    --rg-border-color-1: hsla(200, 85%, 75%, 0.85);
    --rg-border-color-2: hsla(200, 70%, 65%, 0.3);
  `,
};

export function RadialGlowButton({
  children = "Get Extension",
  className,
  variant = "cosmic",
  size = "md",
  type = "button",
  fullWidth = false,
  ...props
}: RadialGlowButtonProps) {
  const isFull = fullWidth || className?.includes("w-full");

  return (
    <div className={cn("relative select-none", isFull ? "w-full block" : "inline-block")}>
      <style>{`
        @property --rg-pos-x { syntax: '<percentage>'; initial-value: 40%; inherits: false; }
        @property --rg-pos-y { syntax: '<percentage>'; initial-value: 140%; inherits: false; }
        @property --rg-spread-x { syntax: '<percentage>'; initial-value: 130%; inherits: false; }
        @property --rg-spread-y { syntax: '<percentage>'; initial-value: 170%; inherits: false; }
        @property --rg-color-1 { syntax: '<color>'; initial-value: #000022; inherits: false; }
        @property --rg-color-2 { syntax: '<color>'; initial-value: #1f3f6d; inherits: false; }
        @property --rg-color-3 { syntax: '<color>'; initial-value: #469396; inherits: false; }
        @property --rg-color-4 { syntax: '<color>'; initial-value: #f1ffa5; inherits: false; }
        @property --rg-color-5 { syntax: '<color>'; initial-value: hsl(250 80% 2.5%); inherits: false; }
        @property --rg-border-angle { syntax: '<angle>'; initial-value: 180deg; inherits: true; }
        @property --rg-border-color-1 { syntax: '<color>'; initial-value: hsla(230, 75%, 90%, 0.7); inherits: true; }
        @property --rg-border-color-2 { syntax: '<color>'; initial-value: hsla(230, 50%, 90%, 0.25); inherits: true; }
        @property --rg-stop-1 { syntax: '<percentage>'; initial-value: 37.35%; inherits: false; }
        @property --rg-stop-2 { syntax: '<percentage>'; initial-value: 61.36%; inherits: false; }
        @property --rg-stop-3 { syntax: '<percentage>'; initial-value: 78.42%; inherits: false; }
        @property --rg-stop-4 { syntax: '<percentage>'; initial-value: 93.52%; inherits: false; }
        @property --rg-stop-5 { syntax: '<percentage>'; initial-value: 100%; inherits: false; }

        .rg-button {
          --transition: 0.25s;
          --spark: 1.8s;
          --speed: 1.2s;
          --cut: 1px;
          --bg: radial-gradient(
            var(--rg-spread-x) var(--rg-spread-y) at var(--rg-pos-x) var(--rg-pos-y),
            var(--rg-color-1) var(--rg-stop-1),
            var(--rg-color-2) var(--rg-stop-2),
            var(--rg-color-3) var(--rg-stop-3),
            var(--rg-color-4) var(--rg-stop-4),
            var(--rg-color-5) var(--rg-stop-5)
          );
          
          position: relative;
          border: none;
          font-family: inherit;
          font-weight: 700;
          line-height: 1.25;
          color: rgba(255, 255, 255, 0.98);
          background: var(--bg);
          cursor: pointer;
          text-shadow: 0 1px 3px rgba(0, 0, 0, 0.75);
          overflow: hidden;
          -webkit-font-smoothing: antialiased;
          -webkit-tap-highlight-color: transparent;
          transition: 
            --rg-pos-x .75s, --rg-pos-y .75s,
            --rg-spread-x .75s, --rg-spread-y .75s,
            --rg-color-1 .75s, --rg-color-2 .75s, --rg-color-3 .75s, --rg-color-4 .75s, --rg-color-5 .75s,
            --rg-border-angle .75s, --rg-border-color-1 .75s, --rg-border-color-2 .75s,
            --rg-stop-1 .75s, --rg-stop-2 .75s, --rg-stop-3 .75s, --rg-stop-4 .75s, --rg-stop-5 .75s,
            transform 0.15s ease, filter 0.2s ease, box-shadow 0.2s ease;
        }

        .rg-button::before {
          content: '';
          position: absolute;
          inset: 0;
          padding: 1.2px;
          border-radius: inherit;
          background-image: linear-gradient(var(--rg-border-angle), var(--rg-border-color-1), var(--rg-border-color-2));
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          pointer-events: none;
        }

        .rg-button:hover {
          --rg-pos-x: 0%;
          --rg-pos-y: 120%;
          --rg-spread-x: 110.24%;
          --rg-spread-y: 110.2%;
          --rg-border-angle: 190deg;
          --button-line-opacity: 1;
          filter: brightness(1.08);
          box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.4);
        }

        .rg-button:active {
          transform: scale(0.97);
          filter: brightness(0.96);
        }

        .rg-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          pointer-events: none;
        }

        .rg-button.variant-saffron:hover {
          --rg-color-1: #2a0800;
          --rg-color-2: #ffedd5;
          --rg-color-3: #fb923c;
          --rg-color-4: #c2410c;
          --rg-border-color-1: hsla(38, 95%, 85%, 0.95);
          --rg-border-color-2: hsla(28, 80%, 65%, 0.4);
        }

        .rg-button.variant-emerald:hover {
          --rg-color-1: #022018;
          --rg-color-2: #ecfdf5;
          --rg-color-3: #34d399;
          --rg-color-4: #047857;
          --rg-border-color-1: hsla(158, 90%, 85%, 0.95);
          --rg-border-color-2: hsla(158, 75%, 65%, 0.4);
        }

        .rg-button.variant-rose:hover {
          --rg-color-1: #20030f;
          --rg-color-2: #ffe4e6;
          --rg-color-3: #fb7185;
          --rg-color-4: #9f1239;
          --rg-border-color-1: hsla(345, 90%, 85%, 0.95);
          --rg-border-color-2: hsla(345, 75%, 65%, 0.4);
        }

        .rg-button.variant-ocean:hover {
          --rg-color-1: #011324;
          --rg-color-2: #e0f2fe;
          --rg-color-3: #38bdf8;
          --rg-color-4: #0369a1;
          --rg-border-color-1: hsla(200, 90%, 85%, 0.95);
          --rg-border-color-2: hsla(200, 75%, 65%, 0.4);
        }

        .rg-label {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          width: 100%;
        }

        .rg-bg {
          position: absolute;
          inset: var(--cut);
          background: var(--bg);
          border-radius: inherit;
          transition: background var(--transition), opacity var(--transition);
        }

        .rg-shine {
          position: absolute;
          inset: 0;
          container-type: size;
          border-radius: inherit;
          mix-blend-mode: soft-light;
          opacity: var(--button-line-opacity, 0);
          transition: opacity 0.3s;
          overflow: visible;
          pointer-events: none;
        }

        .rg-shine span {
          position: absolute;
          inset: 0;
          height: 100cqh;
          aspect-ratio: 1;
          animation: rg-slide var(--speed) ease-in-out infinite alternate;
          overflow: visible;
        }

        .rg-shine span::before {
          content: "";
          position: absolute;
          inset: -100%;
          background: conic-gradient(
            from calc(270deg - (90deg * 0.5)),
            transparent 0,
            #fff 90deg,
            transparent 90deg
          );
          animation: rg-spin calc(var(--speed) * 2) infinite linear;
        }

        @keyframes rg-spin {
          0% { rotate: 0deg; }
          15%, 35% { rotate: 90deg; }
          65%, 85% { rotate: 270deg; }
          100% { rotate: 360deg; }
        }

        @keyframes rg-slide {
          to { transform: translate(calc(100cqw - 100%), 0); }
        }
      `}</style>
      
      <button
        type={type}
        className={cn(
          "rg-button",
          `variant-${variant}`,
          sizeClasses[size],
          isFull && "w-full",
          className
        )}
        style={variant !== "cosmic" && variantCustomVars[variant] ? {
          ...Object.fromEntries(
            variantCustomVars[variant]
              .split(";")
              .map((s) => s.trim())
              .filter(Boolean)
              .map((s) => {
                const [k, ...v] = s.split(":");
                return [k.trim(), v.join(":").trim()];
              })
          ),
        } : undefined}
        {...props}
      >
        <span className="rg-shine">
          <span></span>
        </span>
        <span className="rg-bg"></span>
        <span className="rg-label">{children}</span>
      </button>
    </div>
  );
}

export default RadialGlowButton;
