import { NextResponse } from "next/server";
import { getWhatsAppNumber } from "@/lib/settings";

export async function GET() {
  const whatsappNumber = await getWhatsAppNumber();
  return NextResponse.json({ whatsappNumber });
}
