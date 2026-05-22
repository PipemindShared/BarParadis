"use client";

import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { api } from "../../../convex/_generated/api";
import {
  ELIXIR_KEY_TO_NAME,
  RECIPES,
  type ElixirKey,
} from "@/lib/recipes";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";

const ELIXIR_TABS: { key: ElixirKey; label: string; image: string }[] = [
  { key: "renaissance", label: "Renaissance", image: "/images/renaissance.jpeg" },
  { key: "perles", label: "Perles", image: "/images/paradis.jpeg" },
  { key: "cendres", label: "Cendres", image: "/images/phenix.jpeg" },
  { key: "hotfix", label: "Hotfix", image: "/images/hotfix.jpeg" },
];

type Ingredient = { name: string; qty: string };
type VariantData = { ingredients: Ingredient[]; steps: string[] };
type RecipeData = { alcoholic: VariantData; mocktail: VariantData };

function getDefault(key: ElixirKey): RecipeData {
  const name = ELIXIR_KEY_TO_NAME[key];
  const r = RECIPES[name];
  return {
    alcoholic: {
      ingredients: r.alcoholic.ingredients.map((i) => ({ ...i })),
      steps: [...r.alcoholic.steps],
    },
    mocktail: {
      ingredients: r.mocktail.ingredients.map((i) => ({ ...i })),
      steps: [...r.mocktail.steps],
    },
  };
}

export function RecipeManager({
  onClose,
  barmanName,
}: {
  onClose: () => void;
  barmanName?: string;
}) {
  const overrides = useQuery(api.recipes.list);
  const upsert = useMutation(api.recipes.upsert);
  const reset = useMutation(api.recipes.reset);

  const [activeKey, setActiveKey] = useState<ElixirKey>("renaissance");
  const [variant, setVariant] = useState<"alcoholic" | "mocktail">("alcoholic");
  const [draft, setDraft] = useState<RecipeData>(() => getDefault("renaissance"));
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetConfirm, setResetConfirm] = useState(false);

  // Charge la recette quand on change d'élixir ou quand les overrides arrivent
  useEffect(() => {
    if (overrides === undefined) return;
    const o = overrides[activeKey];
    if (o) {
      setDraft({
        alcoholic: {
          ingredients: o.alcoholic.ingredients.map((i) => ({ ...i })),
          steps: [...o.alcoholic.steps],
        },
        mocktail: {
          ingredients: o.mocktail.ingredients.map((i) => ({ ...i })),
          steps: [...o.mocktail.steps],
        },
      });
    } else {
      setDraft(getDefault(activeKey));
    }
    setDirty(false);
  }, [activeKey, overrides]);

  function patchVariant(updater: (v: VariantData) => VariantData) {
    setDraft((d) => ({ ...d, [variant]: updater(d[variant]) }));
    setDirty(true);
  }

  async function handleSave() {
    setSaving(true);
    try {
      await upsert({
        elixir: activeKey,
        recipe: draft,
        updatedBy: barmanName,
      });
      setDirty(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setResetConfirm(false);
    await reset({ elixir: activeKey });
    setDraft(getDefault(activeKey));
    setDirty(false);
  }

  const hasOverride = !!overrides?.[activeKey];
  const currentVariant = draft[variant];
  const tabImage = ELIXIR_TABS.find((t) => t.key === activeKey)?.image;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1729] shadow-2xl"
        >
          {/* Header */}
          <div className="relative shrink-0 border-b border-white/10 px-5 py-4">
            <button
              onClick={onClose}
              className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-xl text-white/85 transition-all hover:bg-white/10"
            >
              ×
            </button>
            <p
              className="font-mono text-[10px] uppercase tracking-[0.28em]"
              style={{ color: TEAL_LIGHT }}
            >
              ── gestionnaire de recettes
            </p>
            <h2 className="mt-1 font-serif text-2xl italic text-white">
              Éditer une recette
            </h2>
            <p className="mt-1 text-xs text-white/55">
              Changements appliqués en temps réel sur les cards barman.
            </p>
          </div>

          {/* Elixir tabs */}
          <div className="flex shrink-0 gap-1.5 overflow-x-auto border-b border-white/10 bg-black/30 px-5 py-3 teal-scrollbar">
            {ELIXIR_TABS.map((tab) => {
              const active = activeKey === tab.key;
              const overridden = !!overrides?.[tab.key];
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveKey(tab.key)}
                  className="relative flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 transition-all"
                  style={{
                    backgroundColor: active
                      ? `${TEAL}22`
                      : "rgba(255,255,255,0.03)",
                    border: `1px solid ${active ? TEAL : "rgba(255,255,255,0.08)"}`,
                  }}
                >
                  <div
                    className="h-6 w-6 shrink-0 overflow-hidden rounded"
                    style={{
                      backgroundImage: `url(${tab.image})`,
                      backgroundSize: "cover",
                    }}
                  />
                  <span
                    className="font-mono text-[11px] font-bold uppercase tracking-wider"
                    style={{ color: active ? TEAL_LIGHT : "rgba(255,255,255,0.6)" }}
                  >
                    {tab.label}
                  </span>
                  {overridden && (
                    <span
                      className="font-mono text-[9px] font-bold"
                      style={{ color: "#fbbf24" }}
                      title="Recette modifiée"
                    >
                      ●
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Variant toggle */}
          <div className="flex shrink-0 items-center justify-between border-b border-white/10 bg-black/20 px-5 py-3">
            <div className="flex rounded-full border border-white/15 p-0.5">
              <VariantBtn
                active={variant === "alcoholic"}
                onClick={() => setVariant("alcoholic")}
                icon="🍸"
                label="Avec alcool"
              />
              <VariantBtn
                active={variant === "mocktail"}
                onClick={() => setVariant("mocktail")}
                icon="⊘"
                label="Mocktail"
              />
            </div>
            {hasOverride && (
              <button
                onClick={() => setResetConfirm(true)}
                className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/45 transition-colors hover:text-red-300"
              >
                ↶ Revenir au défaut
              </button>
            )}
          </div>

          {/* Body — scrollable */}
          <div className="flex-1 overflow-y-auto teal-scrollbar">
            <div className="space-y-6 p-5">
              {/* Hint pour image */}
              <div
                className="relative flex items-center gap-3 overflow-hidden rounded-lg p-3"
                style={{
                  border: `1px solid ${TEAL}33`,
                  backgroundColor: `${TEAL}11`,
                }}
              >
                <div
                  className="h-12 w-12 shrink-0 overflow-hidden rounded-md"
                  style={{
                    backgroundImage: `url(${tabImage})`,
                    backgroundSize: "cover",
                  }}
                />
                <div>
                  <p className="font-serif text-base italic text-white">
                    {ELIXIR_KEY_TO_NAME[activeKey]}
                  </p>
                  <p
                    className="font-mono text-[9px] uppercase tracking-[0.22em]"
                    style={{ color: TEAL_LIGHT }}
                  >
                    {variant === "alcoholic" ? "Version alcoolisée" : "Version mocktail"}
                  </p>
                </div>
              </div>

              {/* Ingredients section */}
              <Section title="Ingrédients">
                <div className="space-y-2">
                  {currentVariant.ingredients.map((ing, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="text"
                        value={ing.name}
                        onChange={(e) =>
                          patchVariant((v) => ({
                            ...v,
                            ingredients: v.ingredients.map((x, j) =>
                              j === i ? { ...x, name: e.target.value } : x
                            ),
                          }))
                        }
                        placeholder="Ingrédient"
                        className="flex-1 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                      />
                      <input
                        type="text"
                        value={ing.qty}
                        onChange={(e) =>
                          patchVariant((v) => ({
                            ...v,
                            ingredients: v.ingredients.map((x, j) =>
                              j === i ? { ...x, qty: e.target.value } : x
                            ),
                          }))
                        }
                        placeholder="2 oz"
                        className="w-24 rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-center font-mono text-xs text-white outline-none placeholder:text-white/30 focus:border-white/30"
                      />
                      <button
                        onClick={() =>
                          patchVariant((v) => ({
                            ...v,
                            ingredients: v.ingredients.filter(
                              (_, j) => j !== i
                            ),
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white/55 transition-all hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                        title="Retirer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      patchVariant((v) => ({
                        ...v,
                        ingredients: [
                          ...v.ingredients,
                          { name: "", qty: "" },
                        ],
                      }))
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-white/15 py-2 text-xs font-bold uppercase tracking-wider text-white/55 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white"
                  >
                    + Ajouter un ingrédient
                  </button>
                </div>
              </Section>

              {/* Steps section */}
              <Section title="Étapes">
                <div className="space-y-2">
                  {currentVariant.steps.map((step, i) => (
                    <div key={i} className="flex gap-2">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-serif text-sm italic"
                        style={{
                          backgroundColor: `${TEAL}22`,
                          color: TEAL_LIGHT,
                          border: `1px solid ${TEAL}44`,
                        }}
                      >
                        {i + 1}
                      </span>
                      <textarea
                        value={step}
                        onChange={(e) =>
                          patchVariant((v) => ({
                            ...v,
                            steps: v.steps.map((s, j) =>
                              j === i ? e.target.value : s
                            ),
                          }))
                        }
                        rows={2}
                        placeholder="Décrire l'étape…"
                        className="flex-1 resize-none rounded-md border border-white/15 bg-white/5 px-2.5 py-1.5 text-sm text-white outline-none placeholder:text-white/30 focus:border-white/30"
                      />
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() =>
                            patchVariant((v) => {
                              if (i === 0) return v;
                              const next = [...v.steps];
                              [next[i - 1], next[i]] = [next[i], next[i - 1]];
                              return { ...v, steps: next };
                            })
                          }
                          disabled={i === 0}
                          className="flex h-4 w-9 items-center justify-center rounded text-xs text-white/45 transition-all hover:text-white disabled:opacity-25"
                          title="Monter"
                        >
                          ▲
                        </button>
                        <button
                          onClick={() =>
                            patchVariant((v) => {
                              if (i === v.steps.length - 1) return v;
                              const next = [...v.steps];
                              [next[i], next[i + 1]] = [next[i + 1], next[i]];
                              return { ...v, steps: next };
                            })
                          }
                          disabled={i === currentVariant.steps.length - 1}
                          className="flex h-4 w-9 items-center justify-center rounded text-xs text-white/45 transition-all hover:text-white disabled:opacity-25"
                          title="Descendre"
                        >
                          ▼
                        </button>
                      </div>
                      <button
                        onClick={() =>
                          patchVariant((v) => ({
                            ...v,
                            steps: v.steps.filter((_, j) => j !== i),
                          }))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-md border border-white/10 text-white/55 transition-all hover:border-red-400/40 hover:bg-red-400/10 hover:text-red-300"
                        title="Retirer"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() =>
                      patchVariant((v) => ({ ...v, steps: [...v.steps, ""] }))
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-white/15 py-2 text-xs font-bold uppercase tracking-wider text-white/55 transition-all hover:border-white/30 hover:bg-white/5 hover:text-white"
                  >
                    + Ajouter une étape
                  </button>
                </div>
              </Section>
            </div>
          </div>

          {/* Footer with save */}
          <div className="flex shrink-0 items-center justify-between gap-3 border-t border-white/10 bg-black/30 px-5 py-3">
            <p className="text-xs text-white/55">
              {dirty
                ? "Tu as des changements non sauvegardés."
                : hasOverride
                  ? "Recette personnalisée active."
                  : "Recette par défaut."}
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="rounded-full px-4 py-2 text-sm text-white/70 transition-all hover:text-white"
              >
                Fermer
              </button>
              <button
                onClick={handleSave}
                disabled={!dirty || saving}
                className="rounded-full px-5 py-2 text-sm font-bold transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
                style={{
                  background: dirty && !saving
                    ? `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`
                    : "rgba(255,255,255,0.08)",
                  color: "white",
                }}
              >
                {saving ? "Enregistrement…" : "✓ Sauvegarder"}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Reset confirmation overlay */}
        {resetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0a1729] p-5"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: "#fbbf24" }}
              >
                ── reset
              </p>
              <h3 className="mt-2 font-serif text-xl italic text-white">
                Revenir au défaut du code ?
              </h3>
              <p className="mt-2 text-sm text-white/65">
                Tu perdras les modifications custom de la recette « {ELIXIR_KEY_TO_NAME[activeKey]} ».
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
                  }}
                >
                  ↶ Reset
                </button>
                <button
                  onClick={() => setResetConfirm(false)}
                  className="rounded-full px-4 py-2.5 text-sm text-white/70"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function VariantBtn({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all"
      style={{
        backgroundColor: active ? TEAL : "transparent",
        color: active ? "white" : "rgba(255,255,255,0.55)",
      }}
    >
      <span>{icon}</span>
      <span className="font-mono text-[10px] font-bold uppercase tracking-wider">
        {label}
      </span>
    </button>
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
      <h3
        className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.25em]"
        style={{ color: TEAL_LIGHT }}
      >
        — {title}
      </h3>
      {children}
    </div>
  );
}
