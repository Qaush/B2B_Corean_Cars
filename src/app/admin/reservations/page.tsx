import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import ReservationsTable from "./ReservationsTable";

export default async function AdminReservationsPage() {
  await requireAdmin();

  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { name: true, email: true, image: true } },
    },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Menaxhimi i Rezervimeve</h1>
      <ReservationsTable initialData={JSON.parse(JSON.stringify(reservations))} />
    </div>
  );
}
