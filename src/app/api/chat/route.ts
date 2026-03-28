import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic();

const SYSTEM_PROMPT = `Ti je asistenti virtual i "DriveSphere" - një platformë që importon vetura nga Korea e Jugut për tregun e Kosovës dhe Shqipërisë.

RREGULLAT:
- Fol gjithmonë SHQIP
- Ji profesional, i ndihmshëm dhe i shkurtër
- Mos jep informata të rreme
- Përgjigju në maksimum 2-3 fjali (shkurt!)
- Përdor emoji vetëm rrallë

INFORMATA PËR KOMPANINË:
- Importojmë vetura direkt nga Korea e Jugut
- Çmimet përfshijnë transportin deri në Kosovë/Shqipëri (1,500€)
- Pagesa: para në dorë ose transfer bankar
- Dorëzimi: 3-5 javë
- Të gjitha veturat kanë historik aksidentesh dhe inspektim
- WhatsApp: +383 44 647 559
- Website: https://b2c-corean-cars.vercel.app

MUND TË NDIHMOSH ME:
- Çmime dhe kosto importi
- Procedurën e blerjes
- Informata për marka/modele
- Garanci dhe inspektim
- Transport dhe dorëzim

Nëse pyetja nuk ka lidhje me vetura, thuaj me mirësjellje që je asistent për vetura.`;

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages required" }, { status: 400 });
    }

    // Limit conversation history to last 10 messages
    const recentMessages = messages.slice(-10).map((m: any) => ({
      role: m.role as "user" | "assistant",
      content: String(m.content).slice(0, 500),
    }));

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: recentMessages,
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";

    return NextResponse.json({ content: text });
  } catch (error: any) {
    console.error("Chat API error:", error?.message || error);
    return NextResponse.json(
      { content: "Na vjen keq, ka nje problem teknik. Ju lutem na kontaktoni ne WhatsApp: +383 44 647 559" },
      { status: 200 }
    );
  }
}
