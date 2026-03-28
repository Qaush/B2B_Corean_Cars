import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json([], { status: 401 });
  }

  const wishlist = await prisma.wishlist.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(wishlist);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { carId, carData } = await req.json();
  if (!carId) {
    return NextResponse.json({ error: "carId required" }, { status: 400 });
  }

  const item = await prisma.wishlist.upsert({
    where: {
      userId_carId: { userId: session.user.id, carId: String(carId) },
    },
    update: { carData: carData || {} },
    create: {
      userId: session.user.id,
      carId: String(carId),
      carData: carData || {},
    },
  });

  return NextResponse.json(item);
}

export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { carId } = await req.json();
  if (!carId) {
    return NextResponse.json({ error: "carId required" }, { status: 400 });
  }

  await prisma.wishlist.deleteMany({
    where: { userId: session.user.id, carId: String(carId) },
  });

  return NextResponse.json({ success: true });
}
