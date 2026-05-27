"use client";

import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { FAV_TEAMS, type FavTeam } from "@/lib/hockey";
import { Checkbox, Field, TeamLogo, TEAL, TEAL_DEEP, TEAL_LIGHT } from "./ui";

export default function HockeyRegister({
  onRegistered,
}: {
  onRegistered: (entryId: string) => void;
}) {
  const register = useMutation(api.hockey.register);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [favoriteTeam, setFavoriteTeam] = useState<FavTeam | null>(null);
  const [consent, setConsent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validity = useMemo(() => {
    const fn = firstName.trim().length >= 2;
    const ln = lastName.trim().length >= 2;
    const digits = phone.replace(/\D/g, "").length;
    const ph = digits === 10 || digits === 11;
    return {
      fn,
      ln,
      ph,
      all: fn && ln && ph && !!favoriteTeam && consent,
    };
  }, [firstName, lastName, phone, favoriteTeam, consent]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!validity.all || !favoriteTeam || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const { entryId } = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
        favoriteTeam,
        consent,
      });
      try {
        localStorage.setItem("hockey_entry_id", entryId);
      } catch {}
      onRegistered(entryId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg.includes("PREDICTIONS_CLOSED")) {
        setError("Les prédictions sont fermées — le match a commencé.");
      } else if (msg.includes("format reconnu")) {
        setError(msg);
      } else {
        setError("Une erreur est survenue. Réessaie dans une seconde.");
      }
      setSubmitting(false);
    }
  }

  return (
    <div className="relative min-h-[100dvh] w-full overflow-y-auto px-5 pb-10 pt-6 teal-scrollbar">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-white/55">
          ── Habsterface · inscription
        </p>
      </header>

      <motion.h1
        initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
        className="mt-4 font-serif text-[clamp(1.9rem,8vw,2.7rem)] italic leading-[1.05] text-white"
      >
        <span className="block">Crée ton compte</span>
        <span className="block" style={{ color: TEAL_LIGHT }}>
          pour jouer
        </span>
      </motion.h1>

      <motion.form
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
        onSubmit={submit}
        className="mt-6 flex flex-col gap-4"
      >
        <div className="grid grid-cols-2 gap-3">
          <Field
            label="Prénom"
            value={firstName}
            onChange={setFirstName}
            autoComplete="given-name"
            placeholder="Gabriel"
            valid={validity.fn}
            touched={firstName.length > 0}
          />
          <Field
            label="Nom"
            value={lastName}
            onChange={setLastName}
            autoComplete="family-name"
            placeholder="Tremblay"
            valid={validity.ln}
            touched={lastName.length > 0}
          />
        </div>

        <Field
          label="Téléphone"
          type="tel"
          value={phone}
          onChange={setPhone}
          autoComplete="tel"
          placeholder="(514) 555-1234"
          inputMode="tel"
          valid={validity.ph}
          touched={phone.length > 0}
        />

        <div>
          <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
            Ton équipe de coeur
          </span>
          <div className="mt-2 grid grid-cols-3 gap-2.5">
            {FAV_TEAMS.map((t) => {
              const selected = favoriteTeam === t.code;
              return (
                <button
                  key={t.code}
                  type="button"
                  onClick={() => setFavoriteTeam(t.code)}
                  className="flex flex-col items-center gap-2 rounded-2xl border px-2 py-3 transition active:scale-95"
                  style={{
                    borderColor: selected ? t.color : "rgba(255,255,255,0.12)",
                    background: selected
                      ? `${t.color}22`
                      : "rgba(255,255,255,0.04)",
                    boxShadow: selected ? `0 0 22px -6px ${t.color}` : "none",
                  }}
                >
                  <TeamLogo
                    src={t.logo}
                    alt={t.name}
                    color={t.color}
                    abbr={t.short.slice(0, 3).toUpperCase()}
                    size={52}
                    glow
                  />
                  <span className="text-center text-[11px] font-semibold leading-tight text-white">
                    {t.short}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-1">
          <Checkbox
            checked={consent}
            onChange={setConsent}
            label={
              <>
                J&apos;accepte que Pipemind utilise mes infos pour ma
                participation au jeu, m&apos;envoyer un{" "}
                <strong>SMS pendant le match</strong>, et me recontacter après
                l&apos;événement.
              </>
            }
          />
        </div>

        {error && (
          <p
            className="rounded-lg border px-3 py-2 text-sm"
            style={{
              borderColor: "rgba(248,113,113,0.4)",
              background: "rgba(248,113,113,0.12)",
              color: "#fca5a5",
            }}
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!validity.all || submitting}
          className="group relative mt-2 flex w-full items-center justify-between rounded-full px-6 py-4 text-base font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed"
          style={
            validity.all && !submitting
              ? {
                  background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
                  color: "white",
                  boxShadow: `0 10px 40px -8px ${TEAL}99`,
                }
              : {
                  background: "rgba(255,255,255,0.06)",
                  color: "rgba(255,255,255,0.4)",
                }
          }
        >
          <span className="flex items-center gap-2">
            <span
              style={{
                color: validity.all && !submitting ? TEAL_LIGHT : "inherit",
              }}
            >
              🏒
            </span>
            {submitting ? "Création…" : "Continuer vers mes prédictions"}
          </span>
          <span className="text-xl transition-transform group-hover:translate-x-1">
            →
          </span>
        </button>

        <p className="mt-1 text-center font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
          <a href="/confidentialite" className="underline-offset-4 hover:underline">
            politique de confidentialité
          </a>
        </p>
      </motion.form>
    </div>
  );
}
