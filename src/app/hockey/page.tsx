"use client";

import { useQuery } from "convex/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import { api } from "../../../convex/_generated/api";
import HockeyIntro from "./HockeyIntro";
import HockeyPredict from "./HockeyPredict";
import HockeyRegister from "./HockeyRegister";
import { HOCKEY_BG, TEAL, TEAL_DEEP, TEAL_LIGHT } from "./ui";

type Step = "intro" | "register" | "predict" | "done";

export default function HockeyPage() {
  const config = useQuery(api.hockey.getConfig);
  const [step, setStep] = useState<Step>("intro");
  const [entryId, setEntryId] = useState<string | null>(null);

  const predictionsOpen = config?.predictionsOpen ?? true;

  return (
    <div
      className="relative min-h-[100dvh] w-full overflow-hidden text-white"
      style={{ background: HOCKEY_BG }}
    >
      <Orbs />
      <div className="relative z-10 min-h-[100dvh] w-full">
        {step === "intro" && (
          <HockeyIntro
            onDone={() => setStep(predictionsOpen ? "register" : "done")}
          />
        )}

        {step === "register" &&
          (predictionsOpen ? (
            <HockeyRegister
              onRegistered={(id) => {
                setEntryId(id);
                setStep("predict");
              }}
            />
          ) : (
            <ClosedView />
          ))}

        {step === "predict" && entryId && (
          <HockeyPredict entryId={entryId} onDone={() => setStep("done")} />
        )}

        {step === "done" && <DoneView open={predictionsOpen} />}
      </div>
    </div>
  );
}

function DoneView({ open }: { open: boolean }) {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 text-center">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex h-20 w-20 items-center justify-center rounded-full text-4xl"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${TEAL}, ${TEAL_DEEP})`,
          boxShadow: `0 0 40px -6px ${TEAL}`,
        }}
      >
        🏒
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        className="mt-6 font-serif text-[clamp(2rem,9vw,3rem)] italic leading-tight"
      >
        {open ? (
          <>
            C&apos;est{" "}
            <span style={{ color: TEAL_LIGHT }}>enregistré!</span>
          </>
        ) : (
          <>Les prédictions sont fermées</>
        )}
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="mt-4 max-w-sm text-white/70"
      >
        {open
          ? "Ta prédiction est dans la boîte. Suis le classement en direct pendant le match — les points montent à chaque période."
          : "Le match a commencé. Tu peux quand même suivre le classement en direct."}
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.8 }}
        className="mt-8 w-full max-w-xs"
      >
        <Link
          href="/hockey/leaderboard"
          className="flex w-full items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition active:scale-[0.98]"
          style={{
            background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
            boxShadow: `0 10px 40px -8px ${TEAL}99`,
          }}
        >
          Voir le classement →
        </Link>
      </motion.div>
    </div>
  );
}

function ClosedView() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center px-6 text-center">
      <h1 className="font-serif text-[clamp(2rem,9vw,3rem)] italic leading-tight">
        Prédictions <span style={{ color: TEAL_LIGHT }}>fermées</span>
      </h1>
      <p className="mt-4 max-w-sm text-white/70">
        Le match est déjà commencé — impossible de s&apos;inscrire maintenant.
        Mais tu peux suivre le classement en direct.
      </p>
      <Link
        href="/hockey/leaderboard"
        className="mt-8 flex items-center justify-center gap-2 rounded-full px-6 py-4 text-base font-semibold text-white transition active:scale-[0.98]"
        style={{
          background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
          boxShadow: `0 10px 40px -8px ${TEAL}99`,
        }}
      >
        Voir le classement →
      </Link>
    </div>
  );
}

function Orbs() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="orb"
        style={{
          top: "8%",
          left: "-90px",
          width: 320,
          height: 320,
          background: `radial-gradient(circle, ${TEAL_LIGHT}, transparent 70%)`,
          opacity: 0.14,
          animationName: "orb-drift-1",
          animationDuration: "30s",
        }}
      />
      <div
        className="orb"
        style={{
          bottom: "4%",
          right: "-110px",
          width: 380,
          height: 380,
          background: `radial-gradient(circle, ${TEAL}, transparent 70%)`,
          opacity: 0.12,
          animationName: "orb-drift-2",
          animationDuration: "36s",
        }}
      />
      <div className="absolute inset-0 opacity-[0.05] mix-blend-overlay grain" />
    </div>
  );
}
