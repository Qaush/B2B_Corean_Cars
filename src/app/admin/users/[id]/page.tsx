import { requireAdmin } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  formatEur,
  formatMileage,
  getTotalPrice,
  translateManufacturer,
  translateModel,
  translateFuelType,
} from "@/lib/encar";
import { notFound } from "next/navigation";

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Ne pritje", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Konfirmuar", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Anulluar", color: "bg-red-100 text-red-800" },
};

export default async function AdminUserDetailPage({ params }: { params: { id: string } }) {
  await requireAdmin();

  const user = await prisma.user.findUnique({
    where: { id: params.id },
    include: {
      reservations: { orderBy: { createdAt: "desc" } },
      wishlist: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!user) notFound();

  return (
    <div>
      <Link href="/admin/users" className="text-sm text-blue-600 hover:underline mb-4 inline-block">
        &larr; Kthehu te lista
      </Link>

      {/* User info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center gap-4">
          {user.image ? (
            <img src={user.image} alt="" className="w-16 h-16 rounded-full border-2 border-gray-200" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">{user.name?.[0]?.toUpperCase() || "?"}</span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{user.name || "Pa emer"}</h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                user.role === "ADMIN" ? "bg-purple-100 text-purple-800" : "bg-gray-100 text-gray-700"
              }`}>
                {user.role}
              </span>
              <span className="text-xs text-gray-400">
                Krijuar me {new Date(user.createdAt).toLocaleDateString("sq-AL", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Reservations */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Rezervimet ({user.reservations.length})</h2>
          {user.reservations.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500 text-sm">Nuk ka rezervime.</div>
          ) : (
            <div className="space-y-3">
              {user.reservations.map((r) => {
                const car = r.carData as any;
                const { total } = getTotalPrice(car.price);
                const st = statusMap[r.status] || statusMap.pending;
                return (
                  <div key={r.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
                    <img src={car.image} alt="" className="w-20 h-15 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link href={`/cars/${r.carId}`} className="text-sm font-bold text-gray-900 hover:text-blue-600">
                        {translateManufacturer(car.manufacturer)} {translateModel(car.model)}
                      </Link>
                      <p className="text-xs text-blue-600 font-semibold">{formatEur(total)}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${st.color}`}>{st.label}</span>
                        <span className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString("sq-AL")}
                        </span>
                      </div>
                      {r.notes && <p className="text-xs text-gray-500 mt-1">{r.notes}</p>}
                      {r.adminNotes && <p className="text-xs text-purple-600 mt-1">Admin: {r.adminNotes}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Wishlist */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Te preferuarat ({user.wishlist.length})</h2>
          {user.wishlist.length === 0 ? (
            <div className="bg-white rounded-xl p-6 text-center text-gray-500 text-sm">Nuk ka te preferuara.</div>
          ) : (
            <div className="space-y-3">
              {user.wishlist.map((w) => {
                const car = w.carData as any;
                const { total } = getTotalPrice(car.price);
                return (
                  <div key={w.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-3">
                    <img src={car.image} alt="" className="w-20 h-15 object-cover rounded-lg shrink-0" />
                    <div className="flex-1 min-w-0">
                      <Link href={`/cars/${w.carId}`} className="text-sm font-bold text-gray-900 hover:text-blue-600">
                        {translateManufacturer(car.manufacturer)} {translateModel(car.model)}
                      </Link>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span>{car.year}</span>
                        <span>·</span>
                        <span>{formatMileage(car.mileage)}</span>
                        <span>·</span>
                        <span>{translateFuelType(car.fuelType)}</span>
                      </div>
                      <p className="text-sm font-bold text-blue-600 mt-1">{formatEur(total)}</p>
                    </div>
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
