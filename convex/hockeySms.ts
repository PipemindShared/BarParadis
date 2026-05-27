"use node";

import twilio from "twilio";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * SMS de confirmation après qu'un participant a soumis sa prédiction de match.
 * Réutilise les mêmes variables Twilio que le Paradis:
 *   TWILIO_ACCOUNT_SID / TWILIO_AUTH_TOKEN / TWILIO_FROM_NUMBER
 * Non-bloquant: si Twilio n'est pas configuré, retourne { sent: false }.
 */
export const sendPredictionConfirmation = action({
  args: { entryId: v.id("hockeyEntries") },
  handler: async (
    ctx,
    { entryId }
  ): Promise<
    | { sent: true; sid: string }
    | { sent: false; reason: string; error?: string }
  > => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn("[hockeySms] Twilio non configuré — SMS skip");
      return { sent: false, reason: "twilio_not_configured" };
    }

    const entry = await ctx.runQuery(api.hockey.getEntry, { entryId });
    if (!entry) return { sent: false, reason: "entry_not_found" };
    if (entry.isSeed) return { sent: false, reason: "seed_entry" };

    const body =
      `🏒 C'est noté, ${entry.firstName}!\n` +
      `Ta prédiction pour Canadiens vs Hurricanes est enregistrée.\n` +
      `Suis le classement en direct pendant le match. Bonne chance!`;

    try {
      const client = twilio(accountSid, authToken);
      const result = await client.messages.create({
        to: entry.phone,
        from: fromNumber,
        body,
      });
      return { sent: true, sid: result.sid };
    } catch (err) {
      console.error("[hockeySms] échec d'envoi", err);
      return {
        sent: false,
        reason: "twilio_error",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
