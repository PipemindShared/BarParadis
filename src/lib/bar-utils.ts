import { ELIXIRS } from "./questionnaire";

// Téléphones de test (admin) — mêmes valeurs que convex/phone.ts
const ADMIN_PHONES = new Set([
  "+14182623688",
  "+14189075688",
  "+15813494191",
]);

export function isAdminPhone(phone: string | undefined | null): boolean {
  if (!phone) return false;
  return ADMIN_PHONES.has(phone);
}

export type ProfileKey = "Codeur" | "Designer" | "Manager";

export const PROFILE_STYLES: Record<
  ProfileKey,
  { color: string; bg: string; icon: string; label: string }
> = {
  Codeur: {
    color: "#10b981",
    bg: "rgba(16, 185, 129, 0.15)",
    icon: "</>",
    label: "Codeur",
  },
  Designer: {
    color: "#ec4899",
    bg: "rgba(236, 72, 153, 0.15)",
    icon: "✿",
    label: "Designer",
  },
  Manager: {
    color: "#f59e0b",
    bg: "rgba(245, 158, 11, 0.15)",
    icon: "▤",
    label: "Manager",
  },
};

export function getProfileStyle(profile: string | undefined | null) {
  if (!profile) return null;
  return PROFILE_STYLES[profile as ProfileKey] ?? null;
}

export function getElixirImage(elixir: string | undefined | null): string {
  if (!elixir) return "/images/renaissance.jpeg";
  if (elixir === ELIXIRS.renaissance) return "/images/renaissance.jpeg";
  if (elixir === ELIXIRS.perles) return "/images/paradis.jpeg";
  if (elixir === ELIXIRS.cendres) return "/images/phenix.jpeg";
  if (elixir === ELIXIRS.hotfix) return "/images/hotfix.jpeg";
  return "/images/renaissance.jpeg";
}

export function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  return `${min} min`;
}

export function maskLastName(lastName: string): string {
  if (!lastName) return "";
  return `${lastName.charAt(0).toUpperCase()}.`;
}
