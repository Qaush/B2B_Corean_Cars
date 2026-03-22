import Link from "next/link";
import CarCard from "@/components/CarCard";
import {
  EncarSearchResult,
  translateManufacturer,
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
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRoLTJ2LTRoMnYtNGgydjRoNHYyaC00djR6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 py-20 md:py-32 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
              <span className="text-sm text-blue-200">Import direkt nga Korea e Jugut</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Vetura Koreane me{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">
                Cmime te Volitshme
              </span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-2xl">
              Zgjidhni nga mijera vetura te inspektuara ne Korea. Cmimet me te uleta,
              cilesia me e larte, garanci e plote dhe transparence ne cdo hap.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/cars"
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 text-center shadow-lg shadow-blue-600/30"
              >
                Shiko Veturat
              </Link>
              <a
                href="https://wa.me/38344123456"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all hover:scale-105 text-center flex items-center justify-center gap-2 shadow-lg shadow-green-500/30"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                Na Kontakto
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">{data?.Count ? Math.floor(data.Count / 1000) + "K+" : "140K+"}</div>
              <div className="text-sm text-gray-500 mt-1">Vetura te disponueshme</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">70+</div>
              <div className="text-sm text-gray-500 mt-1">Marka te ndryshme</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">10%</div>
              <div className="text-sm text-gray-500 mt-1">Marzha jone e ulte</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-blue-600">3-5</div>
              <div className="text-sm text-gray-500 mt-1">Jave dergim</div>
            </div>
          </div>
        </div>
      </section>

      {/* Brands Section - compact logos */}
      <section className="bg-gray-50 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-2">
            Markat e disponueshme
          </h2>
          <p className="text-gray-500 text-center mb-8">70+ marka koreane, europiane, amerikane dhe japoneze</p>

          {/* Top brands as compact links */}
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
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
                className="bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-blue-600 transition-all"
              >
                {brand.label}
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              href="/cars"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center justify-center gap-1"
            >
              Shiko te gjitha markat ne katalog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Cars */}
      {cars.length > 0 && (
        <section className="py-12 md:py-16">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                Veturat me te reja
              </h2>
              <Link
                href="/cars"
                className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
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

      {/* Why Us Section */}
      <section className="bg-white py-12 md:py-16 border-t">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-10">
            Pse te zgjidhni ne?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Inspektim i plote</h3>
              <p className="text-gray-600">
                Te gjitha veturat kalojne inspektim teknik te detajuar para se te listohen per shitje.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Cmime transparente</h3>
              <p className="text-gray-600">
                Vetem 10% marzhe mbi cmimin e tregut korean. Pa kosto te fshehura, pa surpriza.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-2xl flex items-center justify-center">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Mbeshtetje 24/7</h3>
              <p className="text-gray-600">
                Ekipi yne eshte gjithmone i gatshme per t{"'"}ju ndihmuar permes WhatsApp, Instagram dhe me shume.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-800 py-12 md:py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
            Gati per te gjetur veturen tuaj te endrrave?
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Na kontaktoni sot dhe filloni procesin e importit te vetures suaj nga Korea.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cars"
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg transition-colors"
            >
              Eksploro Katalogun
            </Link>
            <a
              href="https://wa.me/38344123456"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              WhatsApp
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
