"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useWishlist } from "./Providers";

interface WishlistButtonProps {
  carId: string;
  carData: Record<string, unknown>;
  className?: string;
}

export default function WishlistButton({ carId, carData, className = "" }: WishlistButtonProps) {
  const { data: session } = useSession();
  const { wishlist, toggle } = useWishlist();
  const router = useRouter();
  const isWishlisted = wishlist.has(carId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!session?.user) {
      router.push("/login");
      return;
    }

    toggle(carId, carData);
  };

  return (
    <button
      onClick={handleClick}
      className={`p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white shadow-sm transition-all ${className}`}
      title={isWishlisted ? "Hiq nga te preferuarat" : "Shto ne te preferuarat"}
    >
      <svg
        className={`w-5 h-5 transition-colors ${
          isWishlisted ? "text-red-500 fill-red-500" : "text-gray-600"
        }`}
        viewBox="0 0 24 24"
        fill={isWishlisted ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    </button>
  );
}
