import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(null, { status: 401 });
  }

  const prefs = await prisma.searchPreference.findUnique({
    where: { userId: session.user.id },
  });

  return NextResponse.json(prefs);
}

export async function PUT(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const data = await req.json();

  const prefs = await prisma.searchPreference.upsert({
    where: { userId: session.user.id },
    update: {
      manufacturer: data.manufacturer || null,
      fuelType: data.fuelType || null,
      minPrice: data.minPrice || null,
      maxPrice: data.maxPrice || null,
      minYear: data.minYear || null,
      maxYear: data.maxYear || null,
      maxMileage: data.maxMileage || null,
    },
    create: {
      userId: session.user.id,
      manufacturer: data.manufacturer || null,
      fuelType: data.fuelType || null,
      minPrice: data.minPrice || null,
      maxPrice: data.maxPrice || null,
      minYear: data.minYear || null,
      maxYear: data.maxYear || null,
      maxMileage: data.maxMileage || null,
    },
  });

  return NextResponse.json(prefs);
}
