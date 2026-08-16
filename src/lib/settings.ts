import { prisma } from "./prisma";

const DEFAULT_WHATSAPP = "38344647559";

// After a database failure, skip further queries for a while so every
// page render doesn't pay the connection-timeout penalty.
const DB_RETRY_COOLDOWN_MS = 60_000;
let dbFailedUntil = 0;

export async function getSiteSetting(key: string): Promise<string | null> {
  // The site must keep rendering with defaults when the database is
  // unreachable (e.g. Supabase free-tier project paused after inactivity).
  if (Date.now() < dbFailedUntil) return null;
  try {
    const setting = await prisma.siteSettings.findUnique({ where: { key } });
    return setting?.value ?? null;
  } catch {
    dbFailedUntil = Date.now() + DB_RETRY_COOLDOWN_MS;
    return null;
  }
}

export async function getWhatsAppNumber(): Promise<string> {
  return (await getSiteSetting("whatsappNumber")) || DEFAULT_WHATSAPP;
}

export async function setSiteSetting(key: string, value: string): Promise<void> {
  await prisma.siteSettings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

export function formatWhatsAppDisplay(number: string): string {
  // Format "38344647559" as "+383 44 647 559"
  if (number.startsWith("383")) {
    return `+${number.slice(0, 3)} ${number.slice(3, 5)} ${number.slice(5, 8)} ${number.slice(8)}`;
  }
  return `+${number}`;
}
