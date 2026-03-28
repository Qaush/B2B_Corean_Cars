import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const reservations = await prisma.reservation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(reservations);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { carId, carData, notes } = await req.json();
  if (!carId) {
    return NextResponse.json({ error: "carId required" }, { status: 400 });
  }

  // Check if already has a pending reservation for this car
  const existing = await prisma.reservation.findFirst({
    where: {
      userId: session.user.id,
      carId: String(carId),
      status: "pending",
    },
  });

  if (existing) {
    return NextResponse.json(
      { error: "Keni tashmë një kërkesë aktive për këtë veturë" },
      { status: 409 }
    );
  }

  const reservation = await prisma.reservation.create({
    data: {
      userId: session.user.id,
      carId: String(carId),
      carData: carData || {},
      notes: notes || null,
    },
  });

  return NextResponse.json(reservation);
}

export async function PATCH(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id, status } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  // Users can only cancel their own requests
  const reservation = await prisma.reservation.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!reservation) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (status === "cancelled") {
    const updated = await prisma.reservation.update({
      where: { id },
      data: { status: "cancelled" },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}
