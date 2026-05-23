"use client";

import { useMutation, useQuery } from "convex/react";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { api } from "../../../convex/_generated/api";

const TEAL = "#19978a";
const TEAL_LIGHT = "#7DD4C7";
const AMBER = "#f59e0b";
const RED = "#f87171";

export function SettingsDialog({
  mode,
  onClose,
}: {
  mode: "live" | "test";
  onClose: () => void;
}) {
  const config = useQuery(api.bar.getConfig);
  const setAcceptingOrders = useMutation(api.bar.setAcceptingOrders);
  const resetTestDrinks = useMutation(api.bar.resetTestDrinks);
  const clearLiveOrders = useMutation(api.bar.clearLiveOrders);

  const [draftMessage, setDraftMessage] = useState("");
  const [messageDirty, setMessageDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmClose, setConfirmClose] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  // Initialise draftMessage quand config arrive
  useEffect(() => {
    if (config?.closedMessage && !messageDirty) {
      setDraftMessage(config.closedMessage);
    }
  }, [config, messageDirty]);

  if (typeof document === "undefined") return null;

  const accepting = config?.acceptingOrders ?? true;

  async function handleToggleAccepting() {
    // Si on passe de ON → OFF, demander confirmation
    if (accepting) {
      setConfirmClose(true);
      return;
    }
    // Si on passe de OFF → ON, direct
    setSaving(true);
    try {
      await setAcceptingOrders({ accepting: true });
    } finally {
      setSaving(false);
    }
  }

  async function confirmTurnOff() {
    setConfirmClose(false);
    setSaving(true);
    try {
      await setAcceptingOrders({
        accepting: false,
        closedMessage: draftMessage || undefined,
      });
      setMessageDirty(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveMessage() {
    setSaving(true);
    try {
      await setAcceptingOrders({
        accepting,
        closedMessage: draftMessage || undefined,
      });
      setMessageDirty(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleReset() {
    setConfirmReset(false);
    setSaving(true);
    try {
      if (mode === "test") {
        await resetTestDrinks({});
      } else {
        await clearLiveOrders({});
      }
    } finally {
      setSaving(false);
    }
  }

  const modal = (
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
          className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#0a1729] shadow-2xl"
        >
          {/* Header */}
          <div className="flex shrink-0 items-start justify-between gap-3 border-b border-white/10 bg-black/40 px-5 py-4">
            <div className="min-w-0 flex-1">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: TEAL_LIGHT }}
              >
                ── paramètres du bar
              </p>
              <h2 className="mt-1 font-serif text-2xl italic text-white">
                Réglages
              </h2>
              {mode === "test" && (
                <span
                  className="mt-1 inline-block rounded-md px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-[0.2em]"
                  style={{
                    backgroundColor: "rgba(245, 158, 11, 0.2)",
                    color: "#fcd34d",
                    border: "1px solid rgba(245, 158, 11, 0.4)",
                  }}
                >
                  mode test
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-xl text-white transition-all hover:bg-white/20"
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto teal-scrollbar">
            <div className="space-y-6 p-5">
              {/* Section: Acceptation des commandes */}
              <section>
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <h3
                      className="font-mono text-[11px] font-bold uppercase tracking-[0.25em]"
                      style={{ color: TEAL_LIGHT }}
                    >
                      — Acceptation des commandes
                    </h3>
                    <p className="mt-1 text-xs text-white/65">
                      Active ou désactive l'inscription côté visiteur.
                    </p>
                  </div>
                </div>

                <div
                  className="flex items-center justify-between gap-4 rounded-xl border p-4"
                  style={{
                    borderColor: accepting ? `${TEAL}55` : `${RED}55`,
                    backgroundColor: accepting ? `${TEAL}11` : `${RED}11`,
                  }}
                >
                  <div>
                    <p
                      className="font-serif text-lg italic"
                      style={{ color: accepting ? "white" : RED }}
                    >
                      {accepting
                        ? "Le paradis accueille les visiteurs"
                        : "Le paradis est fermé"}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.22em] text-white/55">
                      {accepting
                        ? "Les inscriptions sont actives"
                        : "Les visiteurs voient le message d'attente"}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleAccepting}
                    disabled={saving}
                    className="relative flex h-9 w-16 shrink-0 items-center rounded-full transition-all disabled:opacity-50"
                    style={{
                      backgroundColor: accepting ? TEAL : "rgba(248, 113, 113, 0.55)",
                    }}
                  >
                    <span
                      className="absolute h-7 w-7 rounded-full bg-white shadow-md transition-all"
                      style={{ left: accepting ? 32 : 4 }}
                    />
                  </button>
                </div>

                {/* Message d'attente custom */}
                <div className="mt-4">
                  <label className="block">
                    <span className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.22em] text-white/65">
                      Message affiché aux visiteurs quand fermé
                    </span>
                    <textarea
                      value={draftMessage}
                      onChange={(e) => {
                        setDraftMessage(e.target.value);
                        setMessageDirty(true);
                      }}
                      placeholder="Le portail du paradis s'est refermé."
                      rows={3}
                      className="w-full resize-none rounded-md border border-white/20 bg-white/10 px-3 py-2 text-sm text-white outline-none placeholder:text-white/40 focus:border-white/50 focus:bg-white/15"
                    />
                  </label>
                  {messageDirty && (
                    <div className="mt-2 flex justify-end gap-2">
                      <button
                        onClick={() => {
                          setDraftMessage(config?.closedMessage ?? "");
                          setMessageDirty(false);
                        }}
                        className="rounded-full px-3 py-1.5 text-xs text-white/65 hover:text-white"
                      >
                        Annuler
                      </button>
                      <button
                        onClick={handleSaveMessage}
                        disabled={saving}
                        className="rounded-full px-4 py-1.5 text-xs font-bold transition-all active:scale-95"
                        style={{
                          background: `linear-gradient(135deg, ${TEAL} 0%, #0f7a70 100%)`,
                          color: "white",
                        }}
                      >
                        ✓ Sauvegarder le message
                      </button>
                    </div>
                  )}
                </div>
              </section>

              {/* Section: Reset */}
              <section>
                <h3
                  className="mb-3 font-mono text-[11px] font-bold uppercase tracking-[0.25em]"
                  style={{ color: TEAL_LIGHT }}
                >
                  — Réinitialisation
                </h3>

                <div
                  className="rounded-xl border p-4"
                  style={{
                    borderColor:
                      mode === "test" ? `${AMBER}55` : `${RED}55`,
                    backgroundColor:
                      mode === "test" ? `${AMBER}11` : `${RED}0d`,
                  }}
                >
                  <p
                    className="font-serif text-lg italic"
                    style={{ color: mode === "test" ? "#fcd34d" : RED }}
                  >
                    {mode === "test"
                      ? "Reset des drinks de test"
                      : "Effacer toutes les commandes"}
                  </p>
                  <p className="mt-1.5 text-sm text-white/75">
                    {mode === "test" ? (
                      <>
                        Remet les 15 drinks fictifs à l'état{" "}
                        <span className="italic">en attente</span>. Aucun drink
                        live n'est touché.
                      </>
                    ) : (
                      <>
                        <span className="font-bold" style={{ color: RED }}>
                          Action destructive :
                        </span>{" "}
                        supprime toutes les inscriptions réelles (vraies
                        commandes, incluant celles avec téléphones admin). Les
                        seeds du mode test ne sont pas touchés.
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => setConfirmReset(true)}
                    disabled={saving}
                    className="mt-4 rounded-full px-4 py-2 text-sm font-bold transition-all active:scale-95 disabled:opacity-50"
                    style={{
                      background:
                        mode === "test"
                          ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                          : `linear-gradient(135deg, ${RED} 0%, #dc2626 100%)`,
                      color: "white",
                      boxShadow:
                        mode === "test"
                          ? "0 6px 18px -4px rgba(245, 158, 11, 0.6)"
                          : "0 6px 18px -4px rgba(248, 113, 113, 0.5)",
                    }}
                  >
                    {mode === "test"
                      ? "↻ Reset les drinks de test"
                      : "🗑 Effacer toutes les commandes"}
                  </button>
                </div>
              </section>
            </div>
          </div>

          {/* Footer */}
          <div className="flex shrink-0 justify-end gap-2 border-t border-white/15 bg-black/40 px-5 py-3">
            <button
              onClick={onClose}
              className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85 transition-all hover:bg-white/10 hover:text-white"
            >
              Fermer
            </button>
          </div>
        </motion.div>

        {/* Confirm: éteindre l'acceptation */}
        {confirmClose && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setConfirmClose(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0a1729] p-5"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: RED }}
              >
                ── fermer le paradis ?
              </p>
              <h3 className="mt-2 font-serif text-xl italic text-white">
                Bloquer les nouvelles inscriptions ?
              </h3>
              <p className="mt-2 text-sm text-white/75">
                Les visiteurs verront un message d'attente jusqu'à la
                réouverture. Les commandes en cours ne sont pas affectées.
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={confirmTurnOff}
                  className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-white"
                  style={{
                    background: `linear-gradient(135deg, ${RED} 0%, #dc2626 100%)`,
                  }}
                >
                  ⛔ Fermer
                </button>
                <button
                  onClick={() => setConfirmClose(false)}
                  className="rounded-full px-4 py-2.5 text-sm text-white/75 hover:text-white"
                >
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Confirm: reset */}
        {confirmReset && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 p-4"
            onClick={() => setConfirmReset(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#0a1729] p-5"
            >
              <p
                className="font-mono text-[10px] uppercase tracking-[0.28em]"
                style={{ color: mode === "test" ? "#fcd34d" : RED }}
              >
                ── {mode === "test" ? "reset test" : "effacement total"}
              </p>
              <h3 className="mt-2 font-serif text-xl italic text-white">
                {mode === "test"
                  ? "Remettre tous les drinks de test en attente ?"
                  : "Supprimer toutes les commandes ?"}
              </h3>
              <p className="mt-2 text-sm text-white/75">
                {mode === "test" ? (
                  <>
                    Les 15 seeds reviennent à l'état initial. Les drinks live
                    ne sont pas touchés.
                  </>
                ) : (
                  <>
                    <span className="font-bold" style={{ color: RED }}>
                      Cette action est irréversible.
                    </span>{" "}
                    Toutes les vraies inscriptions seront supprimées
                    définitivement.
                  </>
                )}
              </p>
              <div className="mt-5 flex gap-2">
                <button
                  onClick={handleReset}
                  className="flex-1 rounded-full px-4 py-2.5 text-sm font-bold text-white"
                  style={{
                    background:
                      mode === "test"
                        ? "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)"
                        : `linear-gradient(135deg, ${RED} 0%, #dc2626 100%)`,
                  }}
                >
                  {mode === "test" ? "↻ Reset" : "🗑 Tout supprimer"}
                </button>
                <button
                  onClick={() => setConfirmReset(false)}
                  className="rounded-full px-4 py-2.5 text-sm text-white/75 hover:text-white"
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

  return createPortal(modal, document.body);
}
