"use client";

import Link from "next/link";
import { useState } from "react";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-red-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">KC</span>
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900">Korean Cars</span>
              <span className="hidden sm:block text-xs text-gray-500">Import direkt nga Korea</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Ballina
            </Link>
            <Link href="/cars" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Veturat
            </Link>
            <Link href="/cars?sort=PriceAsc" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">
              Ofertat
            </Link>
            <a
              href="https://wa.me/38344123456"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.789 23.492a.5.5 0 00.611.611l4.458-1.495A11.952 11.952 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-2.386 0-4.592-.842-6.313-2.243l-.44-.362-2.894.97.97-2.894-.362-.44C1.842 15.592 1 13.386 1 11 1 5.477 5.477 1 11 1c5.523 0 10 4.477 10 10s-4.477 10-10 10z" />
              </svg>
              Na Kontakto
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {menuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t">
            <nav className="flex flex-col gap-2 pt-4">
              <Link
                href="/"
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Ballina
              </Link>
              <Link
                href="/cars"
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Veturat
              </Link>
              <Link
                href="/cars?sort=PriceAsc"
                className="text-gray-700 hover:text-blue-600 font-medium py-2 px-3 rounded-lg hover:bg-gray-50"
                onClick={() => setMenuOpen(false)}
              >
                Ofertat
              </Link>
              <a
                href="https://wa.me/38344123456"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 text-white py-2 px-3 rounded-lg font-medium text-center"
              >
                Na Kontakto ne WhatsApp
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
