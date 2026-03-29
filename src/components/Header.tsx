"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { useSiteSettings } from "./SiteSettingsProvider";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { data: session } = useSession();
  const { whatsappNumber } = useSiteSettings();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="bg-white/80 backdrop-blur-xl border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Drive<span className="text-red-600">Sphere</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              Ballina
            </Link>
            <Link href="/cars" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              Veturat
            </Link>
            <Link href="/cars?sort=PriceAsc" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              Ofertat
            </Link>
            <Link href="/calculator" className="text-gray-500 hover:text-gray-900 text-sm font-medium transition-colors">
              Kalkulator
            </Link>
            <a
              href={`https://wa.me/${whatsappNumber}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Na Kontakto
            </a>

            {/* Auth */}
            {session?.user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {session.user.image ? (
                    <img src={session.user.image} alt="" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                      <span className="text-white text-sm font-bold">{session.user.name?.[0]?.toUpperCase() || "?"}</span>
                    </div>
                  )}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    {(session.user as any).role === "ADMIN" && (
                      <Link href="/admin" className="block px-4 py-2 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                        Paneli Admin
                      </Link>
                    )}
                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                      Profili im
                    </Link>
                    <Link href="/profile#wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                      Te preferuarat
                    </Link>
                    <Link href="/profile#reservations" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setDropdownOpen(false)}>
                      Inspektimet
                    </Link>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => signOut({ callbackUrl: "/" })} className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors">
                      Dil nga llogaria
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button onClick={() => signIn()} className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
                Hyr
              </button>
            )}
          </nav>

          {/* Mobile */}
          <div className="flex items-center gap-3 md:hidden">
            {session?.user ? (
              <Link href="/profile">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-8 h-8 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
                    <span className="text-white text-sm font-bold">{session.user.name?.[0]?.toUpperCase() || "?"}</span>
                  </div>
                )}
              </Link>
            ) : (
              <button onClick={() => signIn()} className="bg-gray-900 text-white px-3 py-1.5 rounded-lg text-sm font-medium">
                Hyr
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg hover:bg-gray-100">
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? "max-h-96 pb-4" : "max-h-0"}`}>
          <nav className="flex flex-col gap-1 pt-2 border-t border-gray-100">
            <Link href="/" className="text-gray-700 hover:text-gray-900 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Ballina</Link>
            <Link href="/cars" className="text-gray-700 hover:text-gray-900 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Veturat</Link>
            <Link href="/cars?sort=PriceAsc" className="text-gray-700 hover:text-gray-900 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Ofertat</Link>
            <Link href="/calculator" className="text-gray-700 hover:text-gray-900 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Kalkulator</Link>
            {session?.user && (
              <>
                {(session.user as any).role === "ADMIN" && (
                  <Link href="/admin" className="text-red-600 font-medium py-2.5 px-3 rounded-lg hover:bg-red-50" onClick={() => setMenuOpen(false)}>Paneli Admin</Link>
                )}
                <Link href="/profile" className="text-gray-700 hover:text-gray-900 font-medium py-2.5 px-3 rounded-lg hover:bg-gray-50" onClick={() => setMenuOpen(false)}>Profili im</Link>
              </>
            )}
            <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer" className="bg-red-600 text-white py-2.5 px-3 rounded-lg font-medium text-center mt-1">Na Kontakto</a>
            {session?.user && (
              <button onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/" }); }} className="text-gray-500 font-medium py-2.5 px-3 rounded-lg text-left hover:bg-gray-50">Dil nga llogaria</button>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
