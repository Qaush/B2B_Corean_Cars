import { NextRequest, NextResponse } from "next/server";
import { getAgentResponse } from "@/lib/sales-agent";

const WHATSAPP_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN;
const PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID;
const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || "korean-cars-2024";

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
    const body = await request.json();

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
    const messageBody = message.text?.body || "";

    if (!messageBody) {
      return NextResponse.json({ status: "ok" });
    }

    console.log(`Message from ${from}: ${messageBody}`);

    // Check if message contains a car link from our website
    let carContext: string | undefined;
    const carLinkMatch = messageBody.match(
      /(?:vehicle\.php\?id=|\/cars\/|encar\.com\/cars\/detail\/)(\d+)/
    );
    if (carLinkMatch) {
      // Fetch car details for context
      try {
        const carId = carLinkMatch[1];
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://localhost:3000";
        const carRes = await fetch(`${baseUrl}/api/cars/${carId}`);
        if (carRes.ok) {
          const carData = await carRes.json();
          const car = carData.car;
          if (car) {
            carContext = `${car.Manufacturer} ${car.Model} ${car.Year}, ${car.Mileage?.toLocaleString()} km, Çmimi: ${car.Price} 만원`;
          }
        }
      } catch (e) {
        console.error("Failed to fetch car context:", e);
      }
    }

    // Get AI agent response
    const agentReply = await getAgentResponse(from, messageBody, carContext);

    // Send reply via WhatsApp API
    if (WHATSAPP_TOKEN && PHONE_NUMBER_ID) {
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
            to: from,
            type: "text",
            text: { body: agentReply },
          }),
        }
      );
      console.log(`Reply sent to ${from}: ${agentReply.substring(0, 100)}...`);
    } else {
      console.warn("WhatsApp credentials not configured. Reply:", agentReply);
    }

    return NextResponse.json({ status: "ok" });
  } catch (error: any) {
    console.error("WhatsApp webhook error:", error.message);
    return NextResponse.json({ status: "ok" }); // Always return 200 to WhatsApp
  }
}
