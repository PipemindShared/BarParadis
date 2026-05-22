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
async function sendSms(
  to: string,
  body: string
): Promise<
  | { sent: true; sid: string }
  | { sent: false; reason: string; error?: string }
> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.TWILIO_FROM_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    console.warn("[sms] Twilio non configuré — SMS skip");
    return { sent: false, reason: "twilio_not_configured" };
  }

  try {
    const client = twilio(accountSid, authToken);
    const result = await client.messages.create({
      to,
      from: fromNumber,
      body,
    });
    return { sent: true, sid: result.sid };
  } catch (err) {
    console.error("[sms] échec d'envoi", err);
    return {
      sent: false,
      reason: "twilio_error",
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

/**
 * Notifie le client que son élixir est prêt à être servi.
 * Déclenché par l'app barman quand le drink passe à "ready".
 */
export const notifyReady = action({
  args: {
    participantId: v.id("participants"),
    wasReassigned: v.optional(v.boolean()),
  },
  handler: async (
    ctx,
    { participantId, wasReassigned }
  ): Promise<
    | { sent: true; sid: string }
    | { sent: false; reason: string; error?: string }
  > => {
    const participant = await ctx.runQuery(api.participants.getById, {
      id: participantId,
    });
    if (!participant) {
      return { sent: false, reason: "participant_not_found" };
    }
    if (participant.isSeed) {
      return { sent: false, reason: "seed_participant" };
    }

    const drinkLabel = participant.elixir ?? "ton élixir";
    const body = wasReassigned
      ? `✦ Bonne nouvelle, ${participant.firstName}.\n` +
        `Ton « ${drinkLabel} » a de l'avance — il est prêt maintenant.\n` +
        `Présente-toi au bar.`
      : `✦ Ton élixir « ${drinkLabel} » est prêt, ${participant.firstName}.\n` +
        `Présente-toi au bar du Paradis pour le récupérer.`;

    return await sendSms(participant.phone, body);
  },
});

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
    if (participant.isSeed) {
      return { sent: false, reason: "seed_participant" };
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
