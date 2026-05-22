"use node";

import twilio from "twilio";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { api } from "./_generated/api";

/**
 * Envoie le SMS de confirmation "ton élixir prend forme" à un participant
 * après son inscription. Utilise Twilio.
 *
 * Variables d'environnement Convex requises:
 *   - TWILIO_ACCOUNT_SID
 *   - TWILIO_AUTH_TOKEN
 *   - TWILIO_FROM_NUMBER  (numéro Twilio en format E.164, ex: +14385551234)
 *
 * Si une variable manque, l'action retourne `{ sent: false, reason: "twilio_not_configured" }`
 * pour ne pas faire échouer l'inscription.
 */
export const sendConfirmation = action({
  args: { participantId: v.id("participants") },
  handler: async (
    ctx,
    { participantId }
  ): Promise<
    | { sent: true; sid: string }
    | { sent: false; reason: string; error?: string }
  > => {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_FROM_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.warn(
        "[sms.sendConfirmation] Twilio non configuré — SMS skip pour",
        participantId
      );
      return { sent: false, reason: "twilio_not_configured" };
    }

    const participant = await ctx.runQuery(api.participants.getById, {
      id: participantId,
    });
    if (!participant) {
      return { sent: false, reason: "participant_not_found" };
    }

    const drinkLabel = participant.elixir ?? "ton élixir";

    const body =
      `✦ Le Paradis t'accueille, ${participant.firstName}.\n` +
      `Ton élixir « ${drinkLabel} » prend forme dans les cieux.\n` +
      `Reste dans le coin — l'oracle te fera signe quand le barman l'aura terminé.`;

    try {
      const client = twilio(accountSid, authToken);
      const result = await client.messages.create({
        to: participant.phone,
        from: fromNumber,
        body,
      });
      return { sent: true, sid: result.sid };
    } catch (err) {
      console.error("[sms.sendConfirmation] échec d'envoi", err);
      return {
        sent: false,
        reason: "twilio_error",
        error: err instanceof Error ? err.message : String(err),
      };
    }
  },
});
