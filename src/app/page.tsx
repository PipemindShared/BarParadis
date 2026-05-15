import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="relative flex flex-1 min-h-screen w-full overflow-hidden">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover"
        poster="/images/pipemindlogo1.png"
      >
        <source src="/videos/MobileIntro.mp4" type="video/mp4" />
      </video>

      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/70" />

      <div className="relative z-10 flex flex-1 flex-col items-center justify-between px-6 py-10 text-white sm:px-10 sm:py-14">
        <header className="flex w-full justify-center">
          <Image
            src="/images/pipemindlogo1.png"
            alt="Pipemind"
            width={140}
            height={40}
            priority
            className="h-auto w-auto max-h-10 drop-shadow-lg"
          />
        </header>

        <main className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <h1 className="text-4xl font-semibold leading-tight tracking-tight drop-shadow-md sm:text-5xl">
            Bienvenue au<br />
            <span className="bg-gradient-to-r from-sky-200 to-violet-200 bg-clip-text text-transparent">
              Paradis des développeurs
            </span>
          </h1>

          <p className="text-lg leading-snug text-white/90 drop-shadow-sm">
            Tes anciennes méthodes sont peut-être mortes…<br />
            mais ta prochaine version professionnelle peut commencer ici.
          </p>

          <p className="max-w-sm text-sm leading-relaxed text-white/80">
            Réponds à quelques questions célestes, découvre ton profil
            professionnel et crée ton élixir de renaissance assisté par IA.
          </p>
        </main>

        <footer className="flex w-full max-w-md flex-col items-center gap-4">
          <Link
            href="/consentement"
            className="flex h-14 w-full items-center justify-center rounded-full bg-white px-6 text-lg font-semibold text-zinc-900 shadow-xl transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Créer mon élixir
          </Link>
          <Link
            href="/confidentialite"
            className="text-sm text-white/70 underline-offset-4 hover:underline"
          >
            Comment mes données seront utilisées
          </Link>
        </footer>
      </div>
    </div>
  );
}
