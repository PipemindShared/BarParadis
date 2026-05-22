"use client";

import { AnimatePresence, motion } from "framer-motion";
import { getRecipe } from "@/lib/recipes";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

export function RecipeDialog({
  elixir,
  withAlcohol,
  firstName,
  onClose,
}: {
  elixir: string | undefined | null;
  withAlcohol: boolean;
  firstName?: string;
  onClose: () => void;
}) {
  const recipe = getRecipe(elixir);
  if (!recipe) return null;

  const variant = withAlcohol ? recipe.alcoholic : recipe.mocktail;
  const variantLabel = withAlcohol ? "Avec alcool" : "Sans alcool (mocktail)";
  const variantColor = withAlcohol ? TEAL_LIGHT : TEAL;

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1729] shadow-2xl"
        >
          {/* Header with image background */}
          <div className="relative h-[140px] shrink-0 overflow-hidden">
            <img
              src={recipe.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover"
              style={
                !withAlcohol
                  ? { filter: "saturate(0.3) brightness(0.7)" }
                  : undefined
              }
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a1729] via-[#0a1729]/40 to-transparent" />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-xl text-white/85 backdrop-blur-md transition-all hover:bg-black/75 hover:text-white"
            >
              ×
            </button>

            <div className="absolute bottom-3 left-4 right-16">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-white/55">
                ── recette
                {firstName && (
                  <>
                    {" "}
                    · pour <span style={{ color: TEAL_LIGHT }}>{firstName}</span>
                  </>
                )}
              </p>
              <h2
                className="mt-1 font-serif text-3xl italic leading-tight text-white"
                style={{ textShadow: "0 2px 12px rgba(0,0,0,0.85)" }}
              >
                {recipe.elixir}
              </h2>
              <p
                className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em]"
                style={{ color: TEAL_LIGHT }}
              >
                {recipe.deity}
              </p>
            </div>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto teal-scrollbar">
            <div className="space-y-5 p-5 text-white">
              {/* Variant indicator */}
              <div
                className="flex items-center gap-2 rounded-lg border px-3 py-2"
                style={{
                  borderColor: `${variantColor}55`,
                  backgroundColor: `${variantColor}1a`,
                }}
              >
                <span className="text-lg">{withAlcohol ? "🍸" : "⊘"}</span>
                <p
                  className="font-mono text-[11px] font-bold uppercase tracking-[0.22em]"
                  style={{ color: variantColor }}
                >
                  {variantLabel}
                </p>
              </div>

              {/* Allergens */}
              {recipe.allergens.length > 0 && (
                <div
                  className="rounded-lg border px-3 py-2.5"
                  style={{
                    borderColor: "rgba(248, 113, 113, 0.4)",
                    backgroundColor: "rgba(248, 113, 113, 0.08)",
                  }}
                >
                  <p className="font-mono text-[10px] font-bold uppercase tracking-[0.22em] text-red-300">
                    ⚠ Allergènes
                  </p>
                  <p className="mt-1 text-sm text-white/85">
                    {recipe.allergens.join(", ")}
                  </p>
                </div>
              )}

              {/* Signature visual */}
              <Section title="Effet signature">
                <p className="text-sm leading-snug text-white/85">
                  {recipe.signature}
                </p>
              </Section>

              {/* Prep (if any) */}
              {recipe.prep && (
                <Section title="Préparation préalable">
                  <p className="text-sm leading-snug text-white/85">
                    {recipe.prep}
                  </p>
                </Section>
              )}

              {/* Mocktail substitution note */}
              {!withAlcohol && (
                <Section title="Substitution mocktail">
                  <p className="text-sm leading-snug text-white/85">
                    {variant.substitution}
                  </p>
                </Section>
              )}

              {/* Ingredients */}
              <Section title="Ingrédients">
                <ul className="flex flex-col gap-1.5">
                  {variant.ingredients.map((ing, i) => (
                    <li
                      key={i}
                      className="flex items-baseline justify-between gap-3 border-b border-white/5 pb-1.5"
                    >
                      <span className="text-sm text-white/90">{ing.name}</span>
                      <span
                        className="shrink-0 font-mono text-[11px] uppercase tracking-wider"
                        style={{ color: TEAL_LIGHT }}
                      >
                        {ing.qty}
                      </span>
                    </li>
                  ))}
                </ul>
              </Section>

              {/* Steps */}
              <Section title="Étapes">
                <ol className="flex flex-col gap-2.5">
                  {variant.steps.map((step, i) => (
                    <li key={i} className="flex gap-3">
                      <span
                        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full font-serif text-sm italic"
                        style={{
                          backgroundColor: `${TEAL}33`,
                          color: TEAL_LIGHT,
                          border: `1px solid ${TEAL}55`,
                        }}
                      >
                        {i + 1}
                      </span>
                      <span className="pt-0.5 text-sm leading-snug text-white/90">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </Section>

              {/* Rim & glassware */}
              <Section title="Détails service">
                <div className="flex flex-wrap gap-2">
                  <Chip>Givrage : {recipe.rim}</Chip>
                  <Chip>Spiritueux : {variant.spirits || "—"}</Chip>
                </div>
              </Section>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="mb-2 font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-white/55">
        — {title}
      </h3>
      {children}
    </div>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="rounded-md px-2.5 py-1 text-xs"
      style={{
        backgroundColor: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.85)",
      }}
    >
      {children}
    </span>
  );
}
