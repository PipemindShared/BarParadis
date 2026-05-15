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

      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/60" />

      <FloatingGlyphs />

      <div className="relative z-10 flex flex-1 flex-col px-5 pt-8 pb-10 text-white">
        <header className="flex justify-end">
          <div className="rotate-[-6deg] rounded-md border border-white/40 bg-white/10 px-2.5 py-1.5 text-[10px] uppercase tracking-[0.18em] backdrop-blur-md">
            <span className="font-mono">✦ Édition</span>
            <br />
            <span className="font-mono">Interface · QC ’26</span>
          </div>
        </header>

        <main className="mt-10 flex flex-1 flex-col gap-6">
          <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-white/70">
            — bienvenue au
          </p>

          <h1 className="font-serif text-[clamp(3.5rem,18vw,7rem)] leading-[0.85] tracking-tight">
            <span className="italic">Paradis</span>
            <br />
            <span className="ml-12 inline-block text-[0.55em] font-sans font-light tracking-wide text-white/80">
              des
            </span>
            <br />
            <span className="italic text-sky-100">développeurs</span>
          </h1>

          <div className="ml-auto max-w-[260px] text-right">
            <p className="text-base leading-snug text-white/90">
              Tes anciennes méthodes sont peut-être{" "}
              <span className="italic text-violet-200">mortes</span>…
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              mais ta prochaine version professionnelle peut commencer ici.
            </p>
          </div>
        </main>

        <footer className="mt-8 flex flex-col items-center gap-5">
          <div className="relative">
            <div className="absolute inset-0 -m-3 animate-pulse rounded-full bg-gradient-to-r from-sky-300/40 via-violet-300/40 to-pink-300/40 blur-xl" />
            <Link
              href="/consentement"
              className="relative flex items-center gap-3 rounded-full bg-white px-9 py-5 text-lg font-semibold tracking-tight text-zinc-900 shadow-[0_10px_40px_-10px_rgba(255,255,255,0.6)] transition-transform active:scale-95"
            >
              <span className="text-xl">✦</span>
              Réincarne-toi
              <span aria-hidden className="text-xl">
                →
              </span>
            </Link>
          </div>

          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/60">
            ≈ 2 min · 7 questions · 1 élixir
          </p>

          <Link
            href="/confidentialite"
            className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/40 underline-offset-4 hover:underline"
          >
            · politique de confidentialité ·
          </Link>

          <p className="mt-2 font-mono text-[9px] uppercase tracking-[0.3em] text-white/30">
            un projet pipemind × interface ’26
          </p>
        </footer>
      </div>
    </div>
  );
}

function FloatingGlyphs() {
  const glyphs = [
    { char: "✦", top: "12%", left: "8%", size: "text-2xl", delay: "0s" },
    { char: "☁", top: "22%", right: "12%", size: "text-3xl", delay: "1.5s" },
    { char: "✧", top: "45%", left: "5%", size: "text-xl", delay: "3s" },
    { char: "✦", top: "60%", right: "8%", size: "text-2xl", delay: "0.8s" },
    { char: "⌘", top: "75%", left: "15%", size: "text-base", delay: "2.2s" },
    { char: "✧", top: "35%", right: "20%", size: "text-sm", delay: "1.2s" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-[5]">
      {glyphs.map((g, i) => (
        <span
          key={i}
          className={`absolute ${g.size} text-white/30 animate-float`}
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
