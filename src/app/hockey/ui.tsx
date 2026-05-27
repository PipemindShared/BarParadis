"use client";

import { useState } from "react";

export const TEAL = "#19978a";
export const TEAL_DEEP = "#0f7a70";
export const TEAL_LIGHT = "#7DD4C7";
export const ICE = "#e8f1f8";

// Thème "patinoire / nuit" partagé par les pages hockey
export const HOCKEY_BG =
  "linear-gradient(to bottom, #050d1a 0%, #0a1729 45%, #0d2036 100%)";

/**
 * Logo d'équipe avec repli gracieux si le PNG n'est pas encore déposé.
 * (Gabriel ajoute les fichiers — d'ici là on montre une pastille colorée.)
 */
export function TeamLogo({
  src,
  alt,
  color,
  abbr,
  size = 72,
  glow = false,
}: {
  src: string;
  alt: string;
  color: string;
  abbr: string;
  size?: number;
  glow?: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span
        className="flex items-center justify-center rounded-full font-mono font-bold"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${color}, rgba(0,0,0,0.6))`,
          color: "white",
          fontSize: size * 0.28,
          boxShadow: `0 0 22px -4px ${color}`,
        }}
        aria-label={alt}
      >
        {abbr}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      width={size}
      height={size}
      onError={() => setFailed(true)}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: glow
          ? "drop-shadow(0 0 7px rgba(255,255,255,0.65)) drop-shadow(0 0 18px rgba(255,255,255,0.35))"
          : "drop-shadow(0 4px 16px rgba(0,0,0,0.5))",
      }}
    />
  );
}

export function NumberStepper({
  value,
  onChange,
  min = 0,
  max = 20,
  accent = TEAL_LIGHT,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
  accent?: string;
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, n));
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold transition active:scale-90 disabled:opacity-30"
        style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
        aria-label="moins"
      >
        −
      </button>
      <span
        className="w-8 text-center font-mono text-xl font-bold tabular-nums"
        style={{ color: accent }}
      >
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-lg font-bold transition active:scale-90 disabled:opacity-30"
        style={{ background: "rgba(255,255,255,0.08)", color: "white" }}
        aria-label="plus"
      >
        +
      </button>
    </div>
  );
}

export function SectionTitle({
  index,
  title,
  hint,
}: {
  index: number;
  title: string;
  hint?: string;
}) {
  return (
    <div className="mb-3">
      <p
        className="font-mono text-[10px] uppercase tracking-[0.28em]"
        style={{ color: TEAL_LIGHT }}
      >
        ── étape {index}
      </p>
      <h2 className="mt-1 font-serif text-2xl italic text-white">{title}</h2>
      {hint && <p className="mt-0.5 text-[13px] text-white/55">{hint}</p>}
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
  valid,
  touched,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
  valid?: boolean;
  touched?: boolean;
}) {
  const showInvalid = touched && valid === false;
  const showValid = touched && valid === true;
  return (
    <label className="flex flex-col gap-1">
      <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        className="w-full rounded-xl border px-3 py-3 text-[15px] text-white outline-none transition-all placeholder:text-white/30"
        style={{
          borderColor: showInvalid
            ? "rgba(248,113,113,0.6)"
            : showValid
              ? `${TEAL_LIGHT}88`
              : "rgba(255,255,255,0.14)",
          background: "rgba(255,255,255,0.05)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = TEAL_LIGHT;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${TEAL}33`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.boxShadow = "none";
          e.currentTarget.style.borderColor = showInvalid
            ? "rgba(248,113,113,0.6)"
            : showValid
              ? `${TEAL_LIGHT}88`
              : "rgba(255,255,255,0.14)";
        }}
      />
    </label>
  );
}

export function Checkbox({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative flex shrink-0 items-center justify-center pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
        />
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all"
          style={{
            borderColor: checked ? TEAL_LIGHT : "rgba(255,255,255,0.3)",
            backgroundColor: checked ? TEAL : "rgba(255,255,255,0.06)",
          }}
        >
          {checked && (
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8.5 6.5 12 13 4.5"
              />
            </svg>
          )}
        </span>
      </span>
      <span className="text-[13px] leading-snug text-white/70">{label}</span>
    </label>
  );
}
