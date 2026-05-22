"use client";

import { useMutation } from "convex/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import { computeResult, type Answer } from "@/lib/questionnaire";

const TEAL = "#19978a";
const TEAL_DEEP = "#0f7a70";
const TEAL_LIGHT = "#7DD4C7";
const INK = "#1d2a3a";
const INK_SOFT = "#475569";
const INK_MUTED = "#7a8a9a";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  consentParticipation: boolean;
  consentEmailMarketing: boolean;
  consentSmsMarketing: boolean;
};

const INITIAL_FORM: FormState = {
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  consentParticipation: false,
  consentEmailMarketing: false,
  consentSmsMarketing: false,
};

export default function ReclamerPage() {
  const router = useRouter();
  const register = useMutation(api.participants.register);

  const [form, setForm] = useState<FormState>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("paradis_answers");
      if (raw) setAnswers(JSON.parse(raw));
    } catch {}
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function validate(): string | null {
    if (!form.firstName.trim()) return "On a besoin de ton prénom.";
    if (!form.lastName.trim()) return "Pis ton nom de famille aussi.";
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      return "Ton courriel a l’air pas correct.";
    if (!form.phone.trim() || form.phone.replace(/\D/g, "").length < 10)
      return "Ton téléphone a l’air trop court.";
    if (!form.consentParticipation)
      return "L’oracle a besoin de ton accord pour te faire signe.";
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setSubmitting(true);
    try {
      const result = answers.length > 0 ? computeResult(answers) : null;
      const { participantId } = await register({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        consentParticipation: form.consentParticipation,
        consentEmailMarketing: form.consentEmailMarketing,
        consentSmsMarketing: form.consentSmsMarketing,
        profile: result?.primary,
        deity: result?.deity ?? undefined,
        elixir: result?.elixir ?? undefined,
        withAlcohol: result?.withAlcohol,
        traits: result?.traits,
        rawAnswers: answers,
      });
      try {
        localStorage.setItem("paradis_participant_id", participantId);
      } catch {}
      router.push("/file");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "L’oracle a eu un trouble. Réessaie dans une seconde."
      );
      setSubmitting(false);
    }
  }

  return (
    <div
      className="relative flex min-h-[100dvh] w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, #f3f7fb 0%, #e5edf5 50%, #d6e2ec 100%)",
        color: INK,
      }}
    >
      <div className="divine-rays pointer-events-none absolute inset-0" />
      <div
        className="sun-pulse pointer-events-none absolute left-1/2 top-[-160px] h-[520px] w-[520px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(255,210,130,0.75) 0%, rgba(255,200,110,0.55) 20%, rgba(255,220,160,0.32) 45%, rgba(255,235,190,0.16) 65%, transparent 80%)",
          filter: "blur(18px)",
        }}
      />
      <DriftingClouds />
      <div className="pointer-events-none absolute inset-0 z-[6] opacity-[0.06] mix-blend-multiply grain" />

      <div className="relative z-10 flex min-h-[100dvh] w-full flex-col px-5 pt-5 pb-8">
        <header>
          <p
            className="font-mono text-[11px] uppercase tracking-[0.3em]"
            style={{ color: INK_MUTED }}
          >
            ── dernière étape avant ton élixir
          </p>
        </header>

        <motion.div
          initial={{ opacity: 0, y: 24, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="mt-5"
        >
          <h1
            className="font-serif text-[clamp(1.8rem,7.5vw,2.6rem)] italic leading-[1.05] tracking-tight"
            style={{ color: INK }}
          >
            <span className="block">Laisse notre oracle</span>
            <span className="block" style={{ color: TEAL }}>
              te faire signe
            </span>
          </h1>
          <p
            className="mt-3 text-sm leading-snug"
            style={{ color: INK_SOFT }}
          >
            quand ton élixir est prêt à être servi.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          onSubmit={handleSubmit}
          className="mt-7 flex flex-col gap-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Prénom"
              value={form.firstName}
              onChange={(v) => update("firstName", v)}
              autoComplete="given-name"
              placeholder="Gabriel"
            />
            <Field
              label="Nom"
              value={form.lastName}
              onChange={(v) => update("lastName", v)}
              autoComplete="family-name"
              placeholder="Tremblay"
            />
          </div>

          <Field
            label="Courriel"
            type="email"
            value={form.email}
            onChange={(v) => update("email", v)}
            autoComplete="email"
            placeholder="toi@exemple.com"
            inputMode="email"
          />

          <Field
            label="Téléphone"
            type="tel"
            value={form.phone}
            onChange={(v) => update("phone", v)}
            autoComplete="tel"
            placeholder="(514) 555-1234"
            inputMode="tel"
          />

          <div className="mt-2 flex flex-col gap-2.5">
            <Checkbox
              checked={form.consentParticipation}
              onChange={(v) => update("consentParticipation", v)}
              required
              label={
                <>
                  J’accepte que Pipemind utilise mes infos pour me préparer mon
                  élixir et gérer ma place dans la file.{" "}
                  <span style={{ color: TEAL_DEEP }}>* obligatoire</span>
                </>
              }
            />
            <Checkbox
              checked={form.consentEmailMarketing}
              onChange={(v) => update("consentEmailMarketing", v)}
              label="J’accepte de recevoir des courriels de Pipemind après l’événement (formations, offres)."
            />
            <Checkbox
              checked={form.consentSmsMarketing}
              onChange={(v) => update("consentSmsMarketing", v)}
              label="J’accepte de recevoir des SMS de Pipemind après l’événement."
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border px-3 py-2 text-sm"
              style={{
                borderColor: "rgba(220, 38, 38, 0.3)",
                backgroundColor: "rgba(254, 226, 226, 0.6)",
                color: "#991b1b",
              }}
            >
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="group relative mt-3 flex w-full items-center justify-between rounded-full px-6 py-4 text-base font-semibold tracking-wide text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{
              background: `linear-gradient(135deg, ${TEAL} 0%, ${TEAL_DEEP} 100%)`,
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
              {submitting ? "Envoi à l’oracle…" : "Réclamer mon élixir"}
            </span>
            <span className="relative text-xl transition-transform group-hover:translate-x-1">
              →
            </span>
          </button>

          <p
            className="text-center font-mono text-[10px] uppercase tracking-[0.18em] mt-2"
            style={{ color: INK_MUTED }}
          >
            <a href="/confidentialite" className="underline-offset-4 hover:underline">
              politique de confidentialité
            </a>
          </p>
        </motion.form>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  autoComplete,
  placeholder,
  inputMode,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  inputMode?: "text" | "email" | "tel" | "numeric";
}) {
  return (
    <label className="flex flex-col gap-1">
      <span
        className="font-mono text-[10px] uppercase tracking-[0.22em]"
        style={{ color: INK_MUTED }}
      >
        {label}
      </span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        className="rounded-xl border px-3 py-3 text-[15px] outline-none transition-all placeholder:opacity-40"
        style={{
          borderColor: "rgba(29, 42, 58, 0.15)",
          backgroundColor: "rgba(255, 255, 255, 0.7)",
          color: INK,
          backdropFilter: "blur(8px)",
          WebkitBackdropFilter: "blur(8px)",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = TEAL;
          e.currentTarget.style.boxShadow = `0 0 0 3px ${TEAL}22`;
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "rgba(29, 42, 58, 0.15)";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
    </label>
  );
}

function Checkbox({
  checked,
  onChange,
  label,
  required,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: React.ReactNode;
  required?: boolean;
}) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <span className="relative flex shrink-0 items-center justify-center pt-0.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="sr-only"
          required={required}
        />
        <span
          className="flex h-5 w-5 items-center justify-center rounded-md border-2 transition-all"
          style={{
            borderColor: checked ? TEAL : "rgba(29, 42, 58, 0.25)",
            backgroundColor: checked ? TEAL : "rgba(255, 255, 255, 0.6)",
          }}
        >
          {checked && (
            <svg viewBox="0 0 16 16" className="h-3 w-3 text-white" aria-hidden>
              <path
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 8.5 6.5 12 13 4.5"
              />
            </svg>
          )}
        </span>
      </span>
      <span
        className="text-[13px] leading-snug"
        style={{ color: INK_SOFT }}
      >
        {label}
      </span>
    </label>
  );
}

function DriftingClouds() {
  const clouds = [
    { size: 320, top: "5%", left: "-15%", anim: "drift-a", duration: 48, delay: 0, opacity: 0.6 },
    { size: 260, top: "35%", left: "65%", anim: "drift-b", duration: 56, delay: 4, opacity: 0.5 },
    { size: 360, top: "65%", left: "-20%", anim: "drift-c", duration: 64, delay: 9, opacity: 0.55 },
    { size: 220, top: "20%", left: "75%", anim: "drift-d", duration: 52, delay: 2, opacity: 0.7 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {clouds.map((c, i) => (
        <div
          key={i}
          className="cloud"
          style={{
            top: c.top,
            left: c.left,
            width: c.size,
            height: c.size,
            opacity: c.opacity,
            animationName: c.anim,
            animationDuration: `${c.duration}s`,
            animationDelay: `${c.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
