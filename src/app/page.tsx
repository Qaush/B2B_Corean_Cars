import Link from "next/link";
import CarCard from "@/components/CarCard";
import HeroSearch from "@/components/HeroSearch";
import TrustSection from "@/components/TrustSection";
import {
  EncarSearchResult,
} from "@/lib/encar";

async function getFeaturedCars(): Promise<EncarSearchResult | null> {
  try {
    const res = await fetch(
      "https://api.encar.com/search/car/list/premium?count=true&q=(And.Hidden.N.)&sr=|ModifiedDate|0|8",
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          Accept: "application/json",
        },
        next: { revalidate: 600 },
      }
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export default async function Home() {
  const data = await getFeaturedCars();
  const cars = data?.SearchResults || [];

  return (
    <div>
      {/* Hero Section — Clean, centered, premium */}
      <section className="relative bg-white overflow-hidden">
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-radial from-gray-100 via-white to-white" />

        <div className="max-w-7xl mx-auto px-4 pt-16 pb-20 md:pt-24 md:pb-28 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <p className="text-sm font-medium text-red-600 tracking-wide uppercase mb-4">
              Import direkt nga Korea e Jugut
            </p>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Gjeni veturen ideale<br />
              <span className="text-gray-400">me cmimin me te mire</span>
            </h1>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Zgjidhni nga mijera vetura te inspektuara. Cmime transparente, transport i perfshire.
            </p>
          </div>

          {/* Search Bar */}
          <HeroSearch />
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">
                {data?.Count ? Math.floor(data.Count / 1000) + "K+" : "140K+"}
              </div>
              <div className="text-sm text-gray-500 mt-1">Vetura te disponueshme</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">70+</div>
              <div className="text-sm text-gray-500 mt-1">Marka te ndryshme</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">1,500€</div>
              <div className="text-sm text-gray-500 mt-1">Transport i perfshire</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-gray-900">3-5</div>
              <div className="text-sm text-gray-500 mt-1">Jave dergim</div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section */}
      <section className="py-14 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
            Markat e disponueshme
          </h2>
          <p className="text-gray-400 text-center mb-10">70+ marka koreane, europiane, amerikane dhe japoneze</p>

          <div className="flex flex-wrap justify-center gap-2 md:gap-3">
            {[
              { name: "현대", label: "Hyundai" },
              { name: "기아", label: "Kia" },
              { name: "제네시스", label: "Genesis" },
              { name: "BMW", label: "BMW" },
              { name: "벤츠", label: "Mercedes-Benz" },
              { name: "아우디", label: "Audi" },
              { name: "테슬라", label: "Tesla" },
              { name: "포르쉐", label: "Porsche" },
              { name: "볼보", label: "Volvo" },
              { name: "도요타", label: "Toyota" },
              { name: "렉서스", label: "Lexus" },
              { name: "랜드로버", label: "Land Rover" },
              { name: "폭스바겐", label: "Volkswagen" },
              { name: "포드", label: "Ford" },
              { name: "혼다", label: "Honda" },
              { name: "지프", label: "Jeep" },
            ].map((brand) => (
              <Link
                key={brand.name}
                href={`/cars?manufacturer=${encodeURIComponent(brand.name)}`}
                className="bg-white border border-gray-200 hover:border-red-300 hover:text-red-600 rounded-full px-5 py-2.5 text-sm font-medium text-gray-600 transition-all"
              >
                {brand.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      {cars.length > 0 && (
        <section className="py-14 md:py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Veturat me te reja
                </h2>
                <p className="text-gray-400 mt-1">Listime te reja cdo dite</p>
              </div>
              <Link
                href="/cars"
                className="text-red-600 hover:text-red-700 font-medium flex items-center gap-1 text-sm"
              >
                Shiko te gjitha
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {cars.slice(0, 8).map((car) => (
                <CarCard key={car.Id} car={car} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Trust Section */}
      <TrustSection />

      {/* Import Calculator Teaser */}
      <section className="py-14 md:py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Kalkuloni koston e importit
          </h2>
          <p className="text-gray-500 mb-8">
            Zbuloni koston totale te importit te vetures tuaj nga Korea ne Kosove — dogana, TVSH, transport, dhe me shume.
          </p>
          <Link
            href="/calculator"
            className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-8 py-4 rounded-xl font-semibold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Hap Kalkulatorin
          </Link>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-900 py-16 md:py-20">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Gati per te gjetur veturen tuaj?
          </h2>
          <p className="text-gray-400 mb-8 text-lg">
            Na kontaktoni sot dhe filloni procesin e importit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cars"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Eksploro Katalogun
            </Link>
            <a
              href="https://wa.me/38344647559"
              target="_blank"
              rel="noopener noreferrer"
              className="border border-gray-700 hover:border-gray-500 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Na Kontakto
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
