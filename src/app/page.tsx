import Link from "next/link";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

export default function Home() {
  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-black">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover animate-fade-in"
        style={{
          filter: "saturate(0.7) hue-rotate(-12deg) brightness(0.95) contrast(1.05)",
        }}
      >
        <source src="/videos/MobileIntro.mp4" type="video/mp4" />
      </video>

      <div
        className="pointer-events-none absolute inset-0 mix-blend-soft-light"
        style={{ backgroundColor: TEAL, opacity: 0.12 }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/60" />

      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.08] mix-blend-overlay grain" />

      <FloatingGlyphs />

      <div className="relative z-10 flex h-full w-full flex-col px-5 pt-5 pb-5 text-white drop-shadow-md">
        <header
          className="flex justify-end animate-slide-in"
          style={{ animationDelay: "0.2s" }}
        >
          <div
            className="rotate-[-6deg] rounded-md border-2 px-3 py-1.5 text-[13px] uppercase tracking-[0.14em] backdrop-blur-md"
            style={{ borderColor: `${TEAL}cc`, backgroundColor: `${TEAL}26` }}
          >
            <span className="font-mono text-white">
              <span style={{ color: TEAL_LIGHT }}>✦</span> Interface 2026
            </span>
          </div>
        </header>

        <div className="mt-6 flex flex-1 flex-col items-start">
          <p
            className="font-mono text-[14px] uppercase tracking-[0.28em] text-white/90 animate-fade-up"
            style={{ animationDelay: "0.5s" }}
          >
            ── bienvenue au
          </p>

          <h1 className="mt-2 font-serif leading-[0.82] tracking-tight text-white">
            <span
              className="block italic animate-fade-up"
              style={{
                fontSize: "clamp(3.8rem,18vw,7.5rem)",
                marginLeft: "-0.04em",
                textShadow: "0 2px 16px rgba(0,0,0,0.35)",
                animationDelay: "0.8s",
              }}
            >
              Paradis
            </span>
            <span
              className="ml-10 inline-block font-sans text-lg font-light tracking-[0.25em] text-white/90 uppercase animate-fade-up"
              style={{ animationDelay: "1.2s" }}
            >
              · des ·
            </span>
            <span
              className="block italic animate-fade-up"
              style={{
                fontSize: "clamp(3rem,14vw,6rem)",
                textShadow: "0 2px 16px rgba(0,0,0,0.4)",
                animationDelay: "1.4s",
              }}
            >
              développeurs
            </span>
          </h1>

          <div
            className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md animate-fade-up"
            style={{ animationDelay: "1.8s" }}
          >
            <span className="relative flex h-2 w-2">
              <span
                className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75"
                style={{ backgroundColor: TEAL_LIGHT }}
              />
              <span
                className="relative inline-flex h-2 w-2 rounded-full"
                style={{ backgroundColor: TEAL_LIGHT }}
              />
            </span>
            <p className="font-mono text-[13px] uppercase tracking-[0.14em] text-white">
              47 âmes réincarnées
            </p>
          </div>

          <div
            className="mt-auto max-w-[340px] animate-fade-up"
            style={{ animationDelay: "2.1s" }}
          >
            <p className="text-xl leading-snug text-white">
              Ta carrière d’avant est{" "}
              <span className="relative inline-block whitespace-nowrap">
                <span className="italic">morte</span>
                <svg
                  className="pointer-events-none absolute left-[-4px] right-[-4px] top-1/2 h-3 w-[calc(100%+8px)] -translate-y-1/2"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  aria-hidden
                >
                  <path
                    d="M 2 6 Q 15 1 30 7 T 60 5 T 90 7 T 98 6"
                    stroke={TEAL}
                    strokeWidth="3.5"
                    fill="none"
                    strokeLinecap="round"
                    style={{
                      filter: "drop-shadow(0 1px 1px rgba(0,0,0,0.3))",
                    }}
                  />
                </svg>
              </span>
              .
            </p>
          </div>
        </div>

        <footer className="mt-5 flex flex-col items-stretch gap-3">
          <Link
            href="/consentement"
            className="group relative flex w-full items-center justify-between rounded-full px-6 py-4 text-base font-semibold tracking-wide text-white transition-all active:scale-[0.98] animate-fade-up"
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
              boxShadow: `0 10px 40px -8px ${TEAL}99, 0 0 0 1px ${TEAL_LIGHT}33 inset`,
              animationDelay: "2.4s",
            }}
          >
            <span
              className="pointer-events-none absolute inset-0 -m-3 animate-pulse rounded-full opacity-60 blur-2xl"
              style={{
                background: `linear-gradient(90deg, ${TEAL}99, ${TEAL_LIGHT}66, ${TEAL}99)`,
              }}
            />
            <span className="relative flex items-center gap-2">
              <span style={{ color: TEAL_LIGHT }}>✦</span>
              Obtiens ton élixir
            </span>
            <span className="relative text-xl transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <div
            className="flex items-center justify-between animate-fade-up"
            style={{ animationDelay: "2.7s" }}
          >
            <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/75">
              2 min · 7 questions
            </p>
            <Link
              href="/confidentialite"
              className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/60 underline-offset-4 hover:underline"
            >
              confidentialité
            </Link>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FloatingGlyphs() {
  const glyphs = [
    { char: "✦", top: "10%", left: "6%", size: "text-2xl", delay: "0s", color: "text-white/35" },
    { char: "☁", top: "22%", right: "10%", size: "text-3xl", delay: "1.5s", color: "text-white/30" },
    { char: "✧", top: "44%", left: "4%", size: "text-xl", delay: "3s", colorHex: "#7DD4C766" },
    { char: "✦", top: "58%", right: "6%", size: "text-2xl", delay: "0.8s", color: "text-white/35" },
    { char: "⌘", top: "75%", left: "12%", size: "text-base", delay: "2.2s", color: "text-white/30" },
    { char: "✧", top: "32%", right: "22%", size: "text-sm", delay: "1.2s", colorHex: "#7DD4C780" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {glyphs.map((g, i) => (
        <span
          key={i}
          className={`absolute ${g.size} animate-float ${g.color ?? ""}`}
          style={{
            top: g.top,
            left: g.left,
            right: g.right,
            animationDelay: g.delay,
            ...(g.colorHex ? { color: g.colorHex } : {}),
          }}
        >
          {g.char}
        </span>
      ))}
    </div>
  );
}
