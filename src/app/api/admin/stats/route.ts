import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const [totalUsers, totalReservations, reservationsByStatus, recentReservations, popularCars] =
    await Promise.all([
      prisma.user.count(),
      prisma.reservation.count(),
      prisma.reservation.groupBy({
        by: ["status"],
        _count: true,
      }),
      prisma.reservation.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true, image: true } } },
      }),
      prisma.reservation.groupBy({
        by: ["carId"],
        _count: { carId: true },
        orderBy: { _count: { carId: "desc" } },
        take: 5,
      }),
    ]);

  // Get car data for popular cars
  const popularCarIds = popularCars.map((c) => c.carId);
  const carDataMap: Record<string, any> = {};
  if (popularCarIds.length > 0) {
    const reservations = await prisma.reservation.findMany({
      where: { carId: { in: popularCarIds } },
      distinct: ["carId"],
      select: { carId: true, carData: true },
    });
    for (const r of reservations) {
      carDataMap[r.carId] = r.carData;
    }
  }

  const statusCounts: Record<string, number> = { pending: 0, confirmed: 0, cancelled: 0 };
  for (const s of reservationsByStatus) {
    statusCounts[s.status] = s._count;
  }

  return NextResponse.json({
    totalUsers,
    totalReservations,
    statusCounts,
    recentReservations,
    popularCars: popularCars.map((c) => ({
      carId: c.carId,
      count: c._count.carId,
      carData: carDataMap[c.carId] || {},
    })),
  });
}
