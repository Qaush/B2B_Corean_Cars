import { NextRequest, NextResponse } from "next/server";
import { getAgentResponse } from "@/lib/sales-agent";
import { createHmac } from "crypto";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "korean-cars-2024";
const APP_SECRET = process.env.META_APP_SECRET; // For signature verification

// --- Rate Limiting ---
const MAX_MESSAGES_PER_HOUR = 20;
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(phoneNumber: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(phoneNumber);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(phoneNumber, { count: 1, resetAt: now + 3600_000 });
    return false;
  }

  entry.count++;
  if (entry.count > MAX_MESSAGES_PER_HOUR) {
    return true;
  }
  return false;
}

// --- Meta Signature Verification ---
function verifySignature(rawBody: string, signature: string | null): boolean {
  if (!APP_SECRET) {
    console.warn("META_APP_SECRET not set — skipping signature verification");
    return true; // Allow in dev, but log warning
  }
  if (!signature) return false;

  const expectedSig =
    "sha256=" +
    createHmac("sha256", APP_SECRET).update(rawBody).digest("hex");

  // Constant-time comparison to prevent timing attacks
  if (signature.length !== expectedSig.length) return false;
  let mismatch = 0;
  for (let i = 0; i < signature.length; i++) {
    mismatch |= signature.charCodeAt(i) ^ expectedSig.charCodeAt(i);
  }
  return mismatch === 0;
}

// --- Message Length Limit ---
const MAX_MESSAGE_LENGTH = 1000;

function sanitizeMessage(text: string): string {
  // Trim to max length
  let clean = text.slice(0, MAX_MESSAGE_LENGTH);
  // Remove null bytes and control characters (except newlines)
  clean = clean.replace(/[\x00-\x09\x0B\x0C\x0E-\x1F]/g, "");
  return clean.trim();
}

// WhatsApp webhook verification (GET)
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === VERIFY_TOKEN) {
    console.log("WhatsApp webhook verified");
    return new NextResponse(challenge, { status: 200 });
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

// WhatsApp incoming message (POST)
export async function POST(request: NextRequest) {
  try {
    // Step 1: Verify Meta signature
    const rawBody = await request.text();
    const signature = request.headers.get("x-hub-signature-256");

    if (!verifySignature(rawBody, signature)) {
      console.error("Invalid webhook signature — request rejected");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = JSON.parse(rawBody);

    // Extract message from WhatsApp webhook payload
    const entry = body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;

    // Check if this is a message (not a status update)
    if (!value?.messages?.[0]) {
      return NextResponse.json({ status: "ok" });
    }

    const message = value.messages[0];
    const from = message.from; // sender phone number
    const rawMessageBody = message.text?.body || "";

    if (!rawMessageBody) {
      return NextResponse.json({ status: "ok" });
    }

    // Step 2: Rate limiting
    if (isRateLimited(from)) {
      console.warn(`Rate limited: ${from}`);
      // Send rate limit message
      if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
        await sendWhatsAppMessage(
          from,
          "Keni dërguar shumë mesazhe. Ju lutem prisni pak dhe provoni përsëri. 🙏"
        );
      }
      return NextResponse.json({ status: "ok" });
    }

    // Step 3: Sanitize input
    const messageBody = sanitizeMessage(rawMessageBody);
    if (!messageBody) {
      return NextResponse.json({ status: "ok" });
    }

    console.log(
      `[${new Date().toISOString()}] Message from ${from}: ${messageBody.substring(0, 100)}${messageBody.length > 100 ? "..." : ""}`
    );

    // Check if message contains a car link from our website
    let carContext: string | undefined;
    const carLinkMatch = messageBody.match(
      /(?:vehicle\.php\?id=|\/cars\/|encar\.com\/cars\/detail\/)(\d+)/
    );
    if (carLinkMatch) {
      try {
        const carId = carLinkMatch[1];
        const baseUrl =
          process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000";
        const carRes = await fetch(`${baseUrl}/api/cars/${carId}`);
        if (carRes.ok) {
          const carData = await carRes.json();
          const car = carData.car;
          if (car) {
            carContext = `${car.Manufacturer} ${car.Model} ${car.Year}, ${car.Mileage?.toLocaleString()} km, Çmimi: ${car.Price} 万원`;
          }
        }
      } catch (e) {
        console.error("Failed to fetch car context:", e);
      }
    }

    // Step 4: Get AI agent response
    const agentReply = await getAgentResponse(from, messageBody, carContext);

    // Step 5: Send reply via WhatsApp API
    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
      await sendWhatsAppMessage(from, agentReply);
      console.log(
        `[${new Date().toISOString()}] Reply sent to ${from}: ${agentReply.substring(0, 100)}...`
      );
    } else {
      console.warn("WhatsApp credentials not configured. Reply:", agentReply);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("WhatsApp webhook error:", error.message);
    return NextResponse.json({ status: "ok" }); // Always return 200 to WhatsApp
  }
}

async function sendWhatsAppMessage(to: string, body: string) {
  await fetch(
    `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "text",
        text: { body },
      }),
    }
  );
}
