"use client";

import { SessionProvider } from "next-auth/react";
import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

// Wishlist context
interface WishlistContextType {
  wishlist: Set<string>;
  toggle: (carId: string, carData: Record<string, unknown>) => Promise<void>;
  isLoading: boolean;
}

const WishlistContext = createContext<WishlistContextType>({
  wishlist: new Set(),
  toggle: async () => {},
  isLoading: false,
});

export const useWishlist = () => useContext(WishlistContext);

function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (session?.user) {
      fetch("/api/wishlist")
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) {
            setWishlist(new Set(data.map((w: { carId: string }) => w.carId)));
          }
        })
        .catch(() => {});
    } else {
      setWishlist(new Set());
    }
  }, [session]);

  const toggle = useCallback(
    async (carId: string, carData: Record<string, unknown>) => {
      if (!session?.user) return;

      const isWishlisted = wishlist.has(carId);

      // Optimistic update
      setWishlist((prev) => {
        const next = new Set(prev);
        if (isWishlisted) {
          next.delete(carId);
        } else {
          next.add(carId);
        }
        return next;
      });

      setIsLoading(true);
      try {
        if (isWishlisted) {
          await fetch("/api/wishlist", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ carId }),
          });
        } else {
          await fetch("/api/wishlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ carId, carData }),
          });
        }
      } catch {
        // Revert on error
        setWishlist((prev) => {
          const next = new Set(prev);
          if (isWishlisted) {
            next.add(carId);
          } else {
            next.delete(carId);
          }
          return next;
        });
      } finally {
        setIsLoading(false);
      }
    },
    [session, wishlist]
  );

  return (
    <WishlistContext.Provider value={{ wishlist, toggle, isLoading }}>
      {children}
    </WishlistContext.Provider>
  );
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WishlistProvider>{children}</WishlistProvider>
    </SessionProvider>
  );
}
