"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  formatEur,
  formatMileage,
  getTotalPrice,
  translateManufacturer,
  translateModel,
  translateFuelType,
} from "@/lib/encar";

interface CarSnapshot {
  manufacturer: string;
  model: string;
  badge?: string;
  price: number;
  image: string;
  year: string;
  mileage: number;
  fuelType: string;
}

interface WishlistItem {
  id: string;
  carId: string;
  carData: CarSnapshot;
  createdAt: string;
}

interface ReservationItem {
  id: string;
  carId: string;
  carData: CarSnapshot;
  status: string;
  notes?: string;
  createdAt: string;
}

const statusMap: Record<string, { label: string; color: string }> = {
  pending: { label: "Ne pritje", color: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Konfirmuar", color: "bg-green-100 text-green-800" },
  cancelled: { label: "Anulluar", color: "bg-red-100 text-red-800" },
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
  const [reservations, setReservations] = useState<ReservationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      Promise.all([
        fetch("/api/wishlist").then((r) => r.json()),
        fetch("/api/reservations").then((r) => r.json()),
      ])
        .then(([w, r]) => {
          if (Array.isArray(w)) setWishlist(w);
          if (Array.isArray(r)) setReservations(r);
        })
        .finally(() => setLoading(false));
    }
  }, [session]);

  if (status === "loading" || loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-32 bg-gray-200 rounded-xl" />
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="h-48 bg-gray-200 rounded-xl" />
            <div className="h-48 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!session?.user) return null;

  const removeFromWishlist = async (carId: string) => {
    setWishlist((prev) => prev.filter((w) => w.carId !== carId));
    await fetch("/api/wishlist", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ carId }),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* User info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-4">
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-16 h-16 rounded-full border-2 border-gray-200"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center">
              <span className="text-white text-2xl font-bold">
                {session.user.name?.[0]?.toUpperCase() || "?"}
              </span>
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold text-gray-900">{session.user.name}</h1>
            <p className="text-gray-500">{session.user.email}</p>
          </div>
        </div>
      </div>

      {/* Wishlist */}
      <section id="wishlist" className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Veturat e preferuara ({wishlist.length})
        </h2>

        {wishlist.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-3">Nuk keni vetura te preferuara ende.</p>
            <Link href="/cars" className="text-blue-600 hover:underline font-medium">
              Shfleto veturat
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {wishlist.map((item) => (
              <WishlistCard
                key={item.id}
                item={item}
                onRemove={() => removeFromWishlist(item.carId)}
              />
            ))}
          </div>
        )}
      </section>

      {/* Reservations */}
      <section id="reservations">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Rezervimet ({reservations.length})
        </h2>

        {reservations.length === 0 ? (
          <div className="bg-gray-50 rounded-xl p-8 text-center">
            <p className="text-gray-500 mb-3">Nuk keni rezervime ende.</p>
            <Link href="/cars" className="text-blue-600 hover:underline font-medium">
              Shfleto veturat
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => (
              <ReservationCard key={res.id} reservation={res} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function WishlistCard({
  item,
  onRemove,
}: {
  item: WishlistItem;
  onRemove: () => void;
}) {
  const car = item.carData;
  const { total } = getTotalPrice(car.price);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group">
      <Link href={`/cars/${item.carId}`}>
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={car.image}
            alt={`${translateManufacturer(car.manufacturer)} ${translateModel(car.model)}`}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>
      </Link>
      <div className="p-3">
        <Link href={`/cars/${item.carId}`}>
          <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
            {translateManufacturer(car.manufacturer)} {translateModel(car.model)}
          </h3>
        </Link>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>{car.year}</span>
          <span>·</span>
          <span>{formatMileage(car.mileage)}</span>
          <span>·</span>
          <span>{translateFuelType(car.fuelType)}</span>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-lg font-bold text-blue-600">{formatEur(total)}</span>
          <button
            onClick={onRemove}
            className="text-xs text-red-500 hover:text-red-700 transition-colors"
          >
            Hiq
          </button>
        </div>
      </div>
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: ReservationItem }) {
  const car = reservation.carData;
  const { total } = getTotalPrice(car.price);
  const st = statusMap[reservation.status] || statusMap.pending;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex gap-4">
      <Link href={`/cars/${reservation.carId}`} className="shrink-0">
        <img
          src={car.image}
          alt=""
          className="w-24 h-18 object-cover rounded-lg"
          loading="lazy"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <Link href={`/cars/${reservation.carId}`}>
            <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
              {translateManufacturer(car.manufacturer)} {translateModel(car.model)}
            </h3>
          </Link>
          <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${st.color}`}>
            {st.label}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
          <span>{car.year}</span>
          <span>·</span>
          <span>{formatMileage(car.mileage)}</span>
          <span>·</span>
          <span className="font-semibold text-blue-600">{formatEur(total)}</span>
        </div>
        {reservation.notes && (
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{reservation.notes}</p>
        )}
        <p className="text-xs text-gray-400 mt-2">
          {new Date(reservation.createdAt).toLocaleDateString("sq-AL", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
