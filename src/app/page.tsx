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

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />

      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.08] mix-blend-overlay grain" />

      <FloatingGlyphs />

      <div className="relative z-10 flex h-full w-full flex-col px-5 pt-5 pb-5 text-white">
        <header className="flex justify-end">
          <div
            className="rotate-[-6deg] rounded-md border-2 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md"
            style={{ borderColor: `${TEAL}b3`, backgroundColor: `${TEAL}1a` }}
          >
            <span className="font-mono" style={{ color: TEAL_LIGHT }}>
              <span style={{ color: TEAL }}>✦</span> Édition
            </span>
            <br />
            <span className="font-mono text-white/90">Interface · QC ’26</span>
          </div>
        </header>

        <div className="mt-3 flex flex-1 flex-col">
          <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-white/70">
            ── bienvenue au
          </p>

          <h1 className="mt-1 font-serif leading-[0.82] tracking-tight">
            <span
              className="block italic text-white"
              style={{
                fontSize: "clamp(3.8rem,18vw,7.5rem)",
                marginLeft: "-0.04em",
              }}
            >
              Paradis
            </span>
            <span className="ml-12 inline-block font-sans text-base font-light tracking-[0.25em] text-white/70 uppercase">
              · des ·
            </span>
            <span
              className="block italic"
              style={{
                fontSize: "clamp(3rem,14vw,6rem)",
                color: TEAL_LIGHT,
              }}
            >
              développeurs
            </span>
          </h1>

          <div className="mt-3 flex items-center gap-2">
            <span
              className="h-px w-6"
              style={{ backgroundColor: TEAL }}
            />
            <p
              className="font-mono text-[10px] uppercase tracking-[0.22em]"
              style={{ color: TEAL_LIGHT }}
            >
              47 réincarnés aujourd’hui
            </p>
          </div>

          <div className="mt-auto max-w-[280px] self-end text-right">
            <p className="text-base leading-snug text-white/95">
              Tes anciennes méthodes sont{" "}
              <span className="relative inline-block">
                <span className="italic">mortes</span>
                <span
                  className="absolute left-[-2px] right-[-2px] top-1/2 h-[3px] -translate-y-1/2 rotate-[-3deg]"
                  style={{ backgroundColor: TEAL }}
                  aria-hidden
                />
              </span>
              .
            </p>
            <p className="mt-1.5 text-sm leading-snug text-white/80">
              Bienvenue dans ta prochaine vie.
            </p>
          </div>
        </div>

        <footer className="mt-4 flex flex-col items-center gap-2.5">
          <Link
            href="/consentement"
            className="group relative flex w-full items-center justify-between rounded-full border-2 border-white/60 bg-white/5 px-6 py-4 text-base font-medium tracking-wide text-white backdrop-blur-md transition-all hover:bg-white/15 active:scale-[0.98]"
          >
            <span
              className="absolute inset-0 -m-2 animate-pulse rounded-full opacity-70 blur-2xl"
              style={{
                background: `linear-gradient(90deg, ${TEAL}66, rgba(180,200,255,0.25), ${TEAL}66)`,
              }}
            />
            <span className="relative flex items-center gap-2">
              <span style={{ color: TEAL_LIGHT }}>✦</span>
              entrer au paradis
            </span>
            <span className="relative text-xl transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-white/55">
            ≈ 2 min · 7 questions · 1 élixir
          </p>

          <div className="flex items-center gap-3 text-[9px] uppercase tracking-[0.22em] text-white/30">
            <Link
              href="/confidentialite"
              className="font-mono underline-offset-4 hover:underline"
            >
              confidentialité
            </Link>
            <span>·</span>
            <span className="font-mono">pipemind × interface ’26</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

function FloatingGlyphs() {
  const glyphs = [
    { char: "✦", top: "10%", left: "6%", size: "text-2xl", delay: "0s", color: "text-white/30" },
    { char: "☁", top: "22%", right: "10%", size: "text-3xl", delay: "1.5s", color: "text-white/25" },
    { char: "✧", top: "44%", left: "4%", size: "text-xl", delay: "3s", color: "#7DD4C766" },
    { char: "✦", top: "58%", right: "6%", size: "text-2xl", delay: "0.8s", color: "text-white/30" },
    { char: "⌘", top: "75%", left: "12%", size: "text-base", delay: "2.2s", color: "text-white/25" },
    { char: "✧", top: "32%", right: "22%", size: "text-sm", delay: "1.2s", color: "#7DD4C780" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {glyphs.map((g, i) => {
        const isClass = g.color.startsWith("text-");
        return (
          <span
            key={i}
            className={`absolute ${g.size} animate-float ${isClass ? g.color : ""}`}
            style={{
              top: g.top,
              left: g.left,
              right: g.right,
              animationDelay: g.delay,
              ...(isClass ? {} : { color: g.color }),
            }}
          >
            {g.char}
          </span>
        );
      })}
    </div>
  );
}
