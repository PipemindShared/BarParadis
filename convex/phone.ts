// Téléphones de test qui peuvent réclamer plusieurs élixirs
// (utilisés pour QA durant l'événement)
export const TEST_PHONES = new Set([
  "+14182623688",
  "+14189075688",
]);

/**
 * Normalise un téléphone en format E.164 (+1XXXXXXXXXX).
 * Accepte les formats canadiens/américains courants.
 * Lance une erreur si le format est invalide.
 */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  throw new Error(
    "Le numéro de téléphone n’est pas dans un format reconnu (besoin de 10 chiffres canadiens/américains)."
  );
}

export function isTestPhone(normalized: string): boolean {
  return TEST_PHONES.has(normalized);
}
