import Link from "next/link";
import {
  EncarCar,
  getTotalPrice,
  formatEur,
  formatMileage,
  getMainImageUrl,
  translateFuelType,
  translateManufacturer,
  translateTransmission,
  translateModel,
  translateBadge,
} from "@/lib/encar";
import WishlistButton from "./WishlistButton";

interface CarCardProps {
  car: EncarCar;
}

export default function CarCard({ car }: CarCardProps) {
  const { total } = getTotalPrice(car.Price);
  const imageUrl = getMainImageUrl(car);

  const carData = {
    manufacturer: car.Manufacturer,
    model: car.Model,
    badge: car.Badge,
    price: car.Price,
    image: imageUrl,
    year: car.FormYear,
    mileage: car.Mileage,
    fuelType: car.FuelType,
  };

  return (
    <Link
      href={`/cars/${car.Id}`}
      className="group bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={`${translateManufacturer(car.Manufacturer)} ${translateModel(car.Model)}`}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        {car.Condition?.includes("Inspection") && (
          <span className="absolute top-2 left-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded-md">
            Inspektuar
          </span>
        )}
        {car.Trust?.includes("Warranty") && (
          <span className="absolute top-2 right-2 bg-blue-500 text-white text-xs font-semibold px-2 py-1 rounded-md mr-10">
            Garanci
          </span>
        )}
        {/* Wishlist button */}
        <div className="absolute top-2 right-2">
          <WishlistButton carId={String(car.Id)} carData={carData} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">
          {translateManufacturer(car.Manufacturer)} {translateModel(car.Model)}
        </h3>
        <p className="text-sm text-gray-500 mb-3 line-clamp-1">
          {translateBadge(car.Badge || "")} {translateBadge(car.BadgeDetail || "")}
        </p>

        {/* Specs */}
        <div className="flex flex-wrap gap-2 mb-3">
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {car.FormYear}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            {translateFuelType(car.FuelType)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatMileage(car.Mileage)}
          </span>
          <span className="inline-flex items-center gap-1 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md">
            {translateTransmission(car.Transmission)}
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <span className="text-2xl font-bold text-blue-600">
            {formatEur(total)}
          </span>
          <span className="text-xs text-gray-400">
            Me transport
          </span>
        </div>
      </div>
    </Link>
  );
}
