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
        className="absolute inset-0 h-full w-full object-cover"
      >
        <source src="/videos/MobileIntro.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/5 to-black/60" />

      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.08] mix-blend-overlay grain" />

      <FloatingGlyphs />

      <div className="relative z-10 flex h-full w-full flex-col px-5 pt-5 pb-5 text-white drop-shadow-md">
        <header className="flex justify-end">
          <div
            className="rotate-[-6deg] rounded-md border-2 px-3 py-1.5 text-[13px] uppercase tracking-[0.14em] backdrop-blur-md"
            style={{ borderColor: `${TEAL}cc`, backgroundColor: `${TEAL}26` }}
          >
            <span className="font-mono text-white">
              <span style={{ color: TEAL_LIGHT }}>✦</span> Interface 2026
            </span>
          </div>
        </header>

        <div className="mt-3 flex flex-1 flex-col">
          <p className="font-mono text-[14px] uppercase tracking-[0.28em] text-white/90">
            ── bienvenue au
          </p>

          <h1 className="mt-1 font-serif leading-[0.82] tracking-tight text-white">
            <span
              className="block italic"
              style={{
                fontSize: "clamp(3.8rem,18vw,7.5rem)",
                marginLeft: "-0.04em",
                textShadow: "0 2px 16px rgba(0,0,0,0.35)",
              }}
            >
              Paradis
            </span>
            <span className="ml-12 inline-block font-sans text-lg font-light tracking-[0.25em] text-white/90 uppercase">
              · des ·
            </span>
            <span
              className="block italic"
              style={{
                fontSize: "clamp(3rem,14vw,6rem)",
                textShadow: "0 2px 16px rgba(0,0,0,0.4)",
              }}
            >
              développeurs
            </span>
          </h1>

          <div className="mt-3 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 bg-black/35 px-3 py-1.5 backdrop-blur-md">
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
              47 réincarnés à Interface
            </p>
          </div>

          <div className="mt-auto max-w-[300px] self-end text-right">
            <p className="text-lg leading-snug text-white">
              Ta carrière d’avant est{" "}
              <span className="relative inline-block">
                <span className="italic">morte</span>
                <span
                  className="absolute left-[-2px] right-[-2px] top-1/2 h-[3px] -translate-y-1/2 rotate-[-3deg]"
                  style={{ backgroundColor: TEAL_LIGHT }}
                  aria-hidden
                />
              </span>
              .
            </p>
            <p className="mt-2 text-base leading-snug text-white/85">
              Reviens d’entre les morts.
            </p>
          </div>
        </div>

        <footer className="mt-5 flex flex-col items-center gap-2.5">
          <Link
            href="/consentement"
            className="group relative flex w-full items-center justify-between rounded-full px-6 py-4 text-base font-semibold tracking-wide text-white transition-all active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
              boxShadow: `0 10px 40px -8px ${TEAL}99, 0 0 0 1px ${TEAL_LIGHT}33 inset`,
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

          <p className="font-mono text-[12px] uppercase tracking-[0.2em] text-white/75">
            ≈ 2 min · 7 questions · 1 élixir
          </p>

          <Link
            href="/confidentialite"
            className="font-mono text-[12px] uppercase tracking-[0.14em] text-white/60 underline-offset-4 hover:underline"
          >
            confidentialité
          </Link>
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
