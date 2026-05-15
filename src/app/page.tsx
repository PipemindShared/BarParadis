import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex flex-1 min-h-screen w-full overflow-hidden bg-black">
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

      <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/55" />

      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.08] mix-blend-overlay grain" />

      <FloatingGlyphs />

      <div className="relative z-10 flex flex-1 flex-col px-5 pt-7 pb-8 text-white">
        <header className="flex justify-end">
          <div className="rotate-[-6deg] rounded-md border-2 border-[#FF6B5C]/70 bg-[#FF6B5C]/10 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
            <span className="font-mono text-[#FFD4CD]">
              <span className="text-[#FF6B5C]">✦</span> Édition
            </span>
            <br />
            <span className="font-mono text-white/90">Interface · QC ’26</span>
          </div>
        </header>

        <main className="mt-8 flex flex-1 flex-col gap-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">
            ── bienvenue au
          </p>

          <h1 className="font-serif leading-[0.82] tracking-tight">
            <span
              className="block italic text-white"
              style={{ fontSize: "clamp(4.5rem,22vw,9rem)", marginLeft: "-0.05em" }}
            >
              Paradis
            </span>
            <span className="ml-14 mt-1 inline-block font-sans text-lg font-light tracking-[0.25em] text-white/70 uppercase">
              · des ·
            </span>
            <span
              className="mt-1 block italic text-sky-100"
              style={{ fontSize: "clamp(3.5rem,17vw,7rem)" }}
            >
              développeurs
            </span>
          </h1>

          <div className="mt-2 flex items-center gap-2">
            <span className="h-px w-6 bg-[#FF6B5C]" />
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-[#FFD4CD]">
              47 réincarnés aujourd’hui
            </p>
          </div>

          <div className="mt-auto pt-8 max-w-[300px] self-end text-right">
            <p className="text-lg leading-snug text-white/95">
              Tes anciennes méthodes sont{" "}
              <span className="relative inline-block">
                <span className="italic">mortes</span>
                <span
                  className="absolute left-[-2px] right-[-2px] top-1/2 h-[3px] -translate-y-1/2 rotate-[-3deg] bg-[#FF6B5C]"
                  aria-hidden
                />
              </span>
              .
            </p>
            <p className="mt-2 text-base leading-snug text-white/80">
              Bienvenue dans ta prochaine vie.
            </p>
          </div>
        </main>

        <footer className="mt-7 flex flex-col items-center gap-4">
          <Link
            href="/consentement"
            className="group relative flex w-full items-center justify-between rounded-full border-2 border-white/60 bg-white/5 px-7 py-5 text-lg font-medium tracking-wide text-white backdrop-blur-md transition-all hover:bg-white/15 active:scale-[0.98]"
          >
            <span className="absolute inset-0 -m-2 animate-pulse rounded-full bg-gradient-to-r from-[#FF6B5C]/30 via-sky-300/20 to-violet-300/30 opacity-70 blur-2xl" />
            <span className="relative flex items-center gap-2">
              <span className="text-[#FF6B5C]">✦</span>
              entrer au paradis
            </span>
            <span className="relative text-2xl transition-transform group-hover:translate-x-1">
              →
            </span>
          </Link>

          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-white/55">
            ≈ 2 min · 7 questions · 1 élixir
          </p>

          <Link
            href="/confidentialite"
            className="font-mono text-[9px] uppercase tracking-[0.22em] text-white/35 underline-offset-4 hover:underline"
          >
            politique de confidentialité
          </Link>

          <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-white/25">
            pipemind × interface ’26
          </p>
        </footer>
      </div>
    </div>
  );
}

function FloatingGlyphs() {
  const glyphs = [
    { char: "✦", top: "10%", left: "6%", size: "text-2xl", delay: "0s", color: "text-white/30" },
    { char: "☁", top: "20%", right: "10%", size: "text-3xl", delay: "1.5s", color: "text-white/25" },
    { char: "✧", top: "42%", left: "4%", size: "text-xl", delay: "3s", color: "text-[#FF6B5C]/40" },
    { char: "✦", top: "55%", right: "6%", size: "text-2xl", delay: "0.8s", color: "text-white/30" },
    { char: "⌘", top: "72%", left: "12%", size: "text-base", delay: "2.2s", color: "text-white/25" },
    { char: "✧", top: "30%", right: "22%", size: "text-sm", delay: "1.2s", color: "text-[#FF6B5C]/35" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {glyphs.map((g, i) => (
        <span
          key={i}
          className={`absolute ${g.size} ${g.color} animate-float`}
          style={{
            top: g.top,
            left: g.left,
            right: g.right,
            animationDelay: g.delay,
          }}
        >
          {g.char}
        </span>
      ))}
    </div>
  );
}
