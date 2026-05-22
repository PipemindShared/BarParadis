"use client";

import { useAction } from "convex/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { api } from "../../../../convex/_generated/api";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

export default function BarLoginPage() {
  const router = useRouter();
  const verifyPin = useAction(api.bar.verifyPin);
  const [pin, setPin] = useState("");
  const [name, setName] = useState("");
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function press(d: string) {
    if (pin.length >= 4) return;
    setPin((p) => p + d);
    setError(null);
  }
  function back() {
    setPin((p) => p.slice(0, -1));
    setError(null);
  }
  function clear() {
    setPin("");
    setError(null);
  }

  async function submit() {
    if (pin.length !== 4 || checking) return;
    setChecking(true);
    setError(null);
    try {
      const { ok, mode } = await verifyPin({ pin });
      if (!ok || !mode) {
        setError("PIN incorrect");
        setPin("");
        setChecking(false);
        return;
      }
      try {
        localStorage.setItem("bar_unlocked", "1");
        localStorage.setItem("bar_mode", mode);
        if (name.trim()) localStorage.setItem("bar_barman_name", name.trim());
      } catch {}
      router.push("/bar");
    } catch {
      setError("Erreur de vérification");
      setChecking(false);
    }
  }

  return (
    <div className="relative flex h-[100dvh] w-full overflow-hidden bg-gradient-to-b from-[#06101e] via-[#0a1729] to-[#101d34] text-white">
      <BarLoginBg />

      <div className="relative z-10 mx-auto flex w-full max-w-md flex-col items-center justify-center px-6">
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="font-mono text-[11px] uppercase tracking-[0.32em] text-white/60"
        >
          ── bar du paradis
        </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: 16, filter: "blur(8px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 font-serif text-[clamp(2rem,9vw,3rem)] italic leading-tight"
          style={{ color: TEAL_LIGHT }}
        >
          Entre ton sceau
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
          className="mt-2 text-sm text-white/65"
        >
          Quatre chiffres pour franchir le portail du bar.
        </motion.p>

        {/* PIN dots */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
          className="mt-8 flex gap-4"
        >
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-3 w-3 rounded-full transition-all"
              style={{
                backgroundColor: i < pin.length ? TEAL_LIGHT : "rgba(255,255,255,0.15)",
                boxShadow: i < pin.length ? `0 0 12px ${TEAL_LIGHT}` : "none",
              }}
            />
          ))}
        </motion.div>

        {error && (
          <motion.p
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: [0, -4, 4, -2, 2, 0] }}
            transition={{ duration: 0.4 }}
            className="mt-4 text-sm"
            style={{ color: "#f87171" }}
          >
            {error}
          </motion.p>
        )}

        {/* Keypad */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.2 }}
          className="mt-8 grid grid-cols-3 gap-3"
        >
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <KeyButton key={n} onClick={() => press(String(n))}>
              {n}
            </KeyButton>
          ))}
          <KeyButton onClick={clear} variant="subtle">
            ×
          </KeyButton>
          <KeyButton onClick={() => press("0")}>0</KeyButton>
          <KeyButton onClick={back} variant="subtle">
            ⌫
          </KeyButton>
        </motion.div>

        {/* Optional name */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="mt-8 w-full"
        >
          <label className="flex flex-col gap-1.5">
            <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
              Ton prénom (optionnel)
            </span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tablette 1"
              className="rounded-xl border bg-white/5 px-3 py-2.5 text-[15px] text-white outline-none placeholder:text-white/30"
              style={{ borderColor: "rgba(255,255,255,0.15)" }}
            />
          </label>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.7 }}
          onClick={submit}
          disabled={pin.length !== 4 || checking}
          className="mt-5 flex w-full items-center justify-center rounded-full px-6 py-4 text-base font-semibold tracking-wide transition-all active:scale-[0.98] disabled:cursor-not-allowed"
          style={
            pin.length === 4 && !checking
              ? {
                  background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
                  color: "white",
                  boxShadow: `0 10px 40px -8px ${TEAL}99`,
                }
              : {
                  backgroundColor: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.4)",
                }
          }
        >
          {checking ? "Vérification…" : "Entrer au bar"}
        </motion.button>
      </div>
    </div>
  );
}

function KeyButton({
  children,
  onClick,
  variant = "primary",
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant?: "primary" | "subtle";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-16 items-center justify-center rounded-2xl font-serif text-2xl transition-all active:scale-95"
      style={{
        backgroundColor:
          variant === "primary"
            ? "rgba(255,255,255,0.08)"
            : "rgba(255,255,255,0.03)",
        border: "1px solid rgba(255,255,255,0.10)",
        color: variant === "primary" ? "white" : "rgba(255,255,255,0.6)",
      }}
    >
      {children}
    </button>
  );
}

function BarLoginBg() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="orb"
        style={{
          top: "10%",
          left: "-80px",
          width: 300,
          height: 300,
          background: `radial-gradient(circle, ${TEAL_LIGHT}, transparent 70%)`,
          opacity: 0.18,
          animationName: "orb-drift-1",
          animationDuration: "28s",
        }}
      />
      <div
        className="orb"
        style={{
          bottom: "5%",
          right: "-100px",
          width: 360,
          height: 360,
          background: `radial-gradient(circle, ${TEAL}, transparent 70%)`,
          opacity: 0.15,
          animationName: "orb-drift-2",
          animationDuration: "34s",
        }}
      />
      <div className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-overlay grain" />
    </div>
  );
}
