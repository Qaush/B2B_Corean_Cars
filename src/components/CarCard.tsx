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
  const isLowKm = car.Mileage < 30000;

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
      className="group bg-white rounded-2xl shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
        <img
          src={imageUrl}
          alt={`${translateManufacturer(car.Manufacturer)} ${translateModel(car.Model)}`}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Price on image */}
        <div className="absolute bottom-3 left-3">
          <span className="text-white text-xl font-bold drop-shadow-lg">
            {formatEur(total)}
          </span>
          <span className="text-white/70 text-xs block">me transport</span>
        </div>

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-1.5">
          {car.Condition?.includes("Inspection") && (
            <span className="bg-green-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Inspektuar
            </span>
          )}
          {isLowKm && (
            <span className="bg-amber-500 text-white text-[10px] font-semibold px-2 py-0.5 rounded-md">
              Km te uleta
            </span>
          )}
        </div>

        {/* Wishlist */}
        <div className="absolute top-3 right-3">
          <WishlistButton carId={String(car.Id)} carData={carData} />
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 text-base leading-tight mb-1 group-hover:text-red-600 transition-colors">
          {translateManufacturer(car.Manufacturer)} {translateModel(car.Model)}
        </h3>
        <p className="text-sm text-gray-400 mb-3 line-clamp-1">
          {translateBadge(car.Badge || "")} {translateBadge(car.BadgeDetail || "")}
        </p>

        {/* Specs - single line */}
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <span>{car.FormYear}</span>
          <span className="text-gray-300">|</span>
          <span>{formatMileage(car.Mileage)}</span>
          <span className="text-gray-300">|</span>
          <span>{translateFuelType(car.FuelType)}</span>
          <span className="text-gray-300">|</span>
          <span>{translateTransmission(car.Transmission)}</span>
        </div>
      </div>
    </Link>
  );
}
