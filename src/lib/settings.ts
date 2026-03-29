import { prisma } from "./prisma";

const DEFAULT_WHATSAPP = "38344647559";

export async function getSiteSetting(key: string): Promise<string | null> {
  const setting = await prisma.siteSettings.findUnique({ where: { key } });
  return setting?.value ?? null;
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
