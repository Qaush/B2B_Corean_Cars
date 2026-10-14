import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Called daily by the Vercel cron in vercel.json. A Supabase free-tier
// project is paused after 7 days without database activity (it happened on
// 17.09 and again in October 2026); one small query a day keeps it awake.
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ ok: true, at: new Date().toISOString() });
  } catch (error) {
    console.error("[keepalive] database unreachable", error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
