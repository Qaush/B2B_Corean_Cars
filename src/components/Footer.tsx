import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">KC</span>
              </div>
              <span className="text-xl font-bold">Korean Cars</span>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Import i veturave direkt nga Korea e Jugut. Cmime konkurruese,
              cilesi e larte, garanci dhe transparence e plote.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Linqet e shpejta</h3>
            <nav className="flex flex-col gap-2">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Ballina
              </Link>
              <Link href="/cars" className="text-gray-400 hover:text-white transition-colors">
                Te gjitha veturat
              </Link>
              <Link href="/cars?manufacturer=현대" className="text-gray-400 hover:text-white transition-colors">
                Hyundai
              </Link>
              <Link href="/cars?manufacturer=기아" className="text-gray-400 hover:text-white transition-colors">
                Kia
              </Link>
              <Link href="/cars?manufacturer=제네시스" className="text-gray-400 hover:text-white transition-colors">
                Genesis
              </Link>
              <Link href="/cars?manufacturer=BMW" className="text-gray-400 hover:text-white transition-colors">
                BMW
              </Link>
              <Link href="/cars?manufacturer=벤츠" className="text-gray-400 hover:text-white transition-colors">
                Mercedes-Benz
              </Link>
              <Link href="/cars?manufacturer=테슬라" className="text-gray-400 hover:text-white transition-colors">
                Tesla
              </Link>
            </nav>
          </div>

          {/* Social Media */}
          <div>
            <h3 className="font-semibold text-lg mb-4">Na ndiqni</h3>
            <div className="flex flex-col gap-3">
              <a
                href="https://wa.me/38344647559"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 text-gray-400 hover:text-green-400 transition-colors"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                </svg>
                WhatsApp
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Korean Cars. Te gjitha te drejtat e rezervuara.</p>
        </div>
      </div>
    </footer>
  );
}
