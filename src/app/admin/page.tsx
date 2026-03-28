import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatEur,
  getTotalPrice,
  translateManufacturer,
  translateModel,
} from "@/lib/encar";
import { StatusPieChart, PopularCarsChart } from "./DashboardCharts";

export default async function AdminDashboard() {
  const [totalUsers, totalReservations, totalWishlist, reservationsByStatus, recentReservations, popularCars] =
    await Promise.all([
      prisma.user.count(),
      prisma.reservation.count(),
      prisma.wishlist.count(),
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

  const popularCarsData = popularCars.map((c) => {
    const car = carDataMap[c.carId] as any;
    const name = car ? `${translateManufacturer(car.manufacturer)} ${translateModel(car.model)}` : c.carId;
    return { name, count: c._count.carId };
  });

  const statusMap: Record<string, { label: string; color: string }> = {
    pending: { label: "Ne pritje", color: "bg-yellow-100 text-yellow-800" },
    confirmed: { label: "Konfirmuar", color: "bg-green-100 text-green-800" },
    cancelled: { label: "Anulluar", color: "bg-red-100 text-red-800" },
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Paneli Kryesor</h1>

      {/* Stat cards - clickable */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/users">
          <StatCard label="Perdorues total" value={totalUsers} icon="users" color="blue" />
        </Link>
        <Link href="/admin/reservations">
          <StatCard label="Inspektime total" value={totalReservations} icon="calendar" color="purple" />
        </Link>
        <Link href="/admin/reservations">
          <StatCard label="Ne pritje" value={statusCounts.pending} icon="clock" color="yellow" />
        </Link>
        <Link href="/admin/reservations">
          <StatCard label="Konfirmuar" value={statusCounts.confirmed} icon="check" color="green" />
        </Link>
      </div>

      {/* Second row: extra stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">Anulluar</p>
          <p className="text-xl font-bold text-red-600">{statusCounts.cancelled}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-1">Wishlist total</p>
          <p className="text-xl font-bold text-pink-600">{totalWishlist}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 col-span-2 lg:col-span-1">
          <p className="text-sm text-gray-500 mb-1">Shkalla e konfirmimit</p>
          <p className="text-xl font-bold text-blue-600">
            {totalReservations > 0
              ? Math.round((statusCounts.confirmed / totalReservations) * 100)
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Statusi i Rezervimeve</h2>
          <StatusPieChart statusCounts={statusCounts} />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="font-bold text-gray-900 mb-4">Veturat me te kerkuara</h2>
          <PopularCarsChart popularCars={popularCarsData} />
        </div>
      </div>

      {/* Recent reservations */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-gray-900">Kerkesat e fundit</h2>
          <Link href="/admin/reservations" className="text-sm text-blue-600 hover:underline font-medium">
            Shiko te gjitha →
          </Link>
        </div>
        {recentReservations.length === 0 ? (
          <p className="text-gray-500 text-sm py-4">Nuk ka kerkesa ende.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Vetura</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Klienti</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Statusi</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase pb-3">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {recentReservations.map((r: any) => {
                  const car = r.carData as any;
                  const { total } = getTotalPrice(car.price);
                  const st = statusMap[r.status] || statusMap.pending;
                  return (
                    <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <img src={car.image} alt="" className="w-12 h-9 object-cover rounded" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {translateManufacturer(car.manufacturer)} {translateModel(car.model)}
                            </p>
                            <p className="text-xs text-blue-600 font-semibold">{formatEur(total)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 pr-4">
                        <p className="text-sm text-gray-900">{r.user?.name || "—"}</p>
                        <p className="text-xs text-gray-500">{r.user?.email}</p>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${st.color}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-gray-500">
                        {new Date(r.createdAt).toLocaleDateString("sq-AL", {
                          day: "numeric",
                          month: "short",
                        })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { label: string; value: number; icon: string; color: string }) {
  const colors: Record<string, { bg: string; icon: string }> = {
    blue: { bg: "bg-blue-50", icon: "text-blue-600" },
    purple: { bg: "bg-purple-50", icon: "text-purple-600" },
    yellow: { bg: "bg-yellow-50", icon: "text-yellow-600" },
    green: { bg: "bg-green-50", icon: "text-green-600" },
  };

  const icons: Record<string, JSX.Element> = {
    users: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />,
    calendar: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />,
    clock: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />,
    check: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
  };

  const c = colors[color];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow cursor-pointer group">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 ${c.bg}`}>
        <svg className={`w-5 h-5 ${c.icon}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          {icons[icon]}
        </svg>
      </div>
      <p className="text-2xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  );
}
