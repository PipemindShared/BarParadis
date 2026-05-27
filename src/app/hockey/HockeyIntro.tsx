"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { TEAL, TEAL_LIGHT } from "./ui";

/**
 * Intro: vidéo Hockey.mp4 en fond + texte "Habsterface".
 * À la fin de la vidéo (ou en cas d'erreur), l'écran devient noir
 * avec le logo Pipemind, puis l'utilisateur entre dans l'app.
 */
// Si la vidéo n'a pas démarré après ce délai (codec non supporté, etc.),
// on passe au logo en ayant montré le titre "Habsterface".
const STALL_FALLBACK_MS = 4500;
// Garde-fou absolu si onEnded ne se déclenche jamais malgré une lecture.
const HARD_CAP_MS = 40000;

export default function HockeyIntro({ onDone }: { onDone: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [phase, setPhase] = useState<"video" | "logo">("video");
  const advanced = useRef(false);
  const started = useRef(false); // la vidéo a-t-elle commencé à jouer?

  function goLogo() {
    if (advanced.current) return;
    advanced.current = true;
    setPhase("logo");
  }

  // Si la vidéo joue: on la laisse aller jusqu'à la fin (onEnded → logo).
  // Si elle ne démarre pas (codec, etc.): on passe au logo après le repli,
  // de sorte que le titre "Habsterface" a quand même été affiché.
  useEffect(() => {
    if (phase !== "video") return;
    const fallback = setTimeout(() => {
      if (!started.current) goLogo();
    }, STALL_FALLBACK_MS);
    const hardCap = setTimeout(goLogo, HARD_CAP_MS);
    return () => {
      clearTimeout(fallback);
      clearTimeout(hardCap);
    };
  }, [phase]);

  return (
    <div className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden bg-black">
      {phase === "video" && (
        <>
          {/* Lueur de fond — garde l'écran vivant même si la vidéo ne joue pas */}
          <div
            className="pointer-events-none absolute left-1/2 top-1/2 h-[80vmin] w-[80vmin] -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              background: `radial-gradient(circle, ${TEAL}33 0%, transparent 65%)`,
              filter: "blur(40px)",
            }}
          />
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            preload="auto"
            onPlaying={() => {
              started.current = true;
            }}
            onTimeUpdate={() => {
              started.current = true;
            }}
            onEnded={goLogo}
            className="absolute inset-0 h-full w-full object-cover animate-fade-in"
          >
            <source src="/videos/Hockey.mp4" type="video/mp4" />
          </video>

          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-black/70" />

          {/* Entrée en CSS (pas framer-motion): fiable sur la page d'entrée
              rendue côté serveur + hydratée, contrairement à framer-motion. */}
          <div className="relative z-10 px-6 text-center">
            <p
              className="font-mono text-[12px] uppercase tracking-[0.34em] text-white/80 animate-fade-up"
              style={{ animationDelay: "0.3s" }}
            >
              ── Interface présente
            </p>
            <div
              className="mt-3 animate-fade-up"
              style={{ animationDelay: "0.5s" }}
            >
              <h1
                className="uppercase leading-[0.9] text-white"
                style={{
                  fontFamily: "var(--font-anton), sans-serif",
                  fontSize: "clamp(3.3rem, 17vw, 7rem)",
                  letterSpacing: "0.01em",
                  transform: "skewX(-7deg)",
                  textShadow: "0 5px 28px rgba(0,0,0,0.55)",
                }}
              >
                <span style={{ color: TEAL_LIGHT }}>Habs</span>terface
              </h1>
            </div>
            <p
              className="mt-4 text-lg text-white/85 animate-fade-up"
              style={{ animationDelay: "0.9s" }}
            >
              Prédis le match. Domine le classement.
            </p>
          </div>

          <button
            onClick={goLogo}
            className="absolute bottom-6 right-6 z-20 rounded-full border border-white/25 bg-black/30 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.18em] text-white/70 backdrop-blur-md transition hover:text-white"
          >
            Passer l&apos;intro →
          </button>
        </>
      )}

      {phase === "logo" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9 }}
          className="relative z-10 flex flex-col items-center px-6 text-center"
        >
          <motion.div
            initial={{ scale: 0.85, opacity: 0, filter: "blur(10px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/pipemindlogo1.png"
              alt="Pipemind"
              className="h-20 w-auto opacity-95"
              style={{ filter: "drop-shadow(0 0 30px rgba(25,151,138,0.5))" }}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/reverbere.png"
              alt="Réverbère"
              className="h-16 w-auto opacity-90"
            />
          </motion.div>

          <motion.button
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.9 }}
            onClick={onDone}
            className="group mt-12 flex items-center gap-3 rounded-full px-7 py-4 text-base font-semibold text-white transition active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
              boxShadow: `0 10px 40px -8px ${TEAL}aa`,
            }}
          >
            <span style={{ color: TEAL_LIGHT }}>🏒</span>
            Faire ma prédiction
            <span className="text-xl transition-transform group-hover:translate-x-1">
              →
            </span>
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
