import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatEur,
  getTotalPrice,
  translateManufacturer,
  translateModel,
} from "@/lib/encar";

export default async function AdminDashboard() {
  const [totalUsers, totalReservations, reservationsByStatus, recentReservations, popularCars] =
    await Promise.all([
      prisma.user.count(),
      prisma.reservation.count(),
      prisma.reservation.groupBy({ by: ["status"], _count: true }),
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

  const statusCounts: Record<string, number> = { pending: 0, confirmed: 0, cancelled: 0 };
  for (const s of reservationsByStatus) {
    statusCounts[s.status] = s._count;
  }

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

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Ne pritje", color: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: "Konfirmuar", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Anulluar", color: "bg-red-100 text-red-800" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paneli Kryesor</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Perdorues total" value={totalUsers} icon="users" color="blue" />
        <StatCard label="Rezervime total" value={totalReservations} icon="calendar" color="purple" />
        <StatCard label="Ne pritje" value={statusCounts.pending} icon="clock" color="yellow" />
        <StatCard label="Konfirmuar" value={statusCounts.confirmed} icon="check" color="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent reservations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Rezervimet e fundit</h2>
            <Link href="/admin/reservations" className="text-sm text-blue-600 hover:underline">
              Shiko te gjitha
            </Link>
          </div>
          {recentReservations.length === 0 ? (
            <p className="text-gray-500 text-sm">Nuk ka rezervime ende.</p>
          ) : (
            <div className="space-y-3">
              {recentReservations.map((r: any) => {
                const car = r.carData as any;
                const st = statusMap[r.status] || statusMap.pending;
                return (
                  <div key={r.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={car.image} alt="" className="w-12 h-9 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {translateManufacturer(car.manufacturer)} {translateModel(car.model)}
                      </p>
                      <p className="text-xs text-gray-500">{r.user?.name || r.user?.email}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${st.color}`}>
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Popular cars */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Veturat me te kerkuara</h2>
          {popularCars.length === 0 ? (
            <p className="text-gray-500 text-sm">Nuk ka te dhena ende.</p>
          ) : (
            <div className="space-y-3">
              {popularCars.map((c) => {
                const car = carDataMap[c.carId] as any;
                if (!car) return null;
                const { total } = getTotalPrice(car.price);
                return (
                  <div key={c.carId} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <img src={car.image} alt="" className="w-12 h-9 object-cover rounded" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {translateManufacturer(car.manufacturer)} {translateModel(car.model)}
                      </p>
                      <p className="text-xs text-blue-600 font-semibold">{formatEur(total)}</p>
                    </div>
                    <span className="text-sm font-bold text-gray-700">{c._count.carId} rez.</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colors: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
    yellow: "bg-yellow-50 text-yellow-600",
    green: "bg-green-50 text-green-600",
  };

  const icons: Record<string, JSX.Element> = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${colors[color]}`}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
