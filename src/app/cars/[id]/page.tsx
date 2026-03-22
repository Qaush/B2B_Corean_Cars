import Link from "next/link";
import {
  EncarCar,
  getTotalPrice,
  formatEur,
  formatMileage,
  getImageUrl,
  translateFuelType,
  translateManufacturer,
  translateTransmission,
  translateModel,
  translateBadge,
  translateKorean,
  TRANSPORT_COST,
} from "@/lib/encar";
import PhotoGallery from "@/components/PhotoGallery";

// Encar standard option codes mapping
const OPTION_MAP: Record<string, string> = {
  "001": "Sunroof", "002": "Panoramic Sunroof", "003": "Moonroof",
  "004": "LED Headlights", "005": "Parking Sensors", "006": "Rear Camera",
  "007": "Auto A/C", "008": "Smart Key", "009": "Push Start",
  "010": "Navigation", "011": "Bluetooth", "012": "USB Port",
  "013": "AUX", "014": "Heated Seats", "015": "Ventilated Seats",
  "016": "Memory Seats", "017": "Leather Seats", "018": "Power Seats",
  "019": "Cruise Control", "020": "Auto Headlights", "021": "Rain Sensor",
  "022": "Rear Wiper", "023": "Fog Lights", "024": "Alloy Wheels",
  "025": "Roof Rails", "026": "Tinted Windows", "027": "Side Mirror Folding",
  "028": "Side Mirror Heating", "029": "Auto Dimming Mirror",
  "030": "Lane Departure Warning", "031": "Forward Collision Warning",
  "032": "Blind Spot Warning", "033": "Adaptive Cruise Control",
  "034": "Around View Monitor", "035": "Head-Up Display",
  "036": "Wireless Charging", "037": "Apple CarPlay", "038": "Android Auto",
  "039": "360 Camera", "040": "Power Trunk", "041": "Hands-free Trunk",
  "042": "Remote Start", "043": "Heated Steering Wheel",
  "044": "Steering Mode Select", "045": "Drive Mode Select",
  "046": "Electronic Parking Brake", "047": "Auto Hold",
  "048": "Hill Start Assist", "049": "Hill Descent Control",
  "050": "4WD", "051": "Air Suspension", "052": "Sport Suspension",
  "053": "Active Sound", "054": "Premium Sound", "055": "Front Parking Sensors",
  "056": "Rear Parking Sensors", "057": "Parking Assist", "058": "Auto Parking",
  "059": "ECM Mirror", "060": "Ambient Lighting",
  "061": "Dual Zone Climate", "062": "Rear Climate Control",
  "063": "Air Purifier", "064": "Seat Ventilation Rear",
  "065": "Rear Entertainment", "066": "Power Folding Mirrors",
  "067": "DRL", "068": "Cornering Lights", "069": "Adaptive Lights",
  "070": "Matrix LED", "071": "Laser Headlights",
  "072": "Emergency Braking", "073": "Pedestrian Detection",
  "074": "Traffic Sign Recognition", "075": "Lane Keep Assist",
  "076": "Highway Drive Assist", "077": "Remote Parking",
  "078": "Surround View", "079": "Driver Attention Warning",
  "080": "Rear Cross Traffic Alert", "081": "Safe Exit Warning",
  "082": "Multi-Collision Brake", "083": "eCall",
  "084": "Tire Pressure Monitor", "085": "ESC", "086": "Airbags 6+",
  "087": "Airbags 8+", "088": "ISOFIX", "089": "Speed Limiter",
  "090": "Auto Wipers", "091": "Paddle Shifters", "092": "Sport Mode",
  "093": "Eco Mode", "094": "Electric Folding Mirrors", "095": "Welcome Lights",
  "096": "LED Tail Lights", "097": "Sequential Turn Signals",
};

interface CarDetailPageProps {
  params: { id: string };
}

interface DetailData {
  car: EncarCar;
  detail: any;
}

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
};

async function getCarData(id: string): Promise<DetailData | null> {
  let car: EncarCar | null = null;

  // Try both endpoints
  for (const endpoint of [
    "https://api.encar.com/search/car/list/premium",
    "https://api.encar.com/search/car/list/general",
  ]) {
    try {
      const q = encodeURIComponent(`(And.Hidden.N._.CarId.${id}.)`);
      const sr = encodeURIComponent("|ModifiedDate|0|1");
      const res = await fetch(`${endpoint}?count=true&q=${q}&sr=${sr}`, {
        headers: HEADERS,
        next: { revalidate: 300 },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.SearchResults?.length > 0) {
          car = data.SearchResults[0];
          break;
        }
      }
    } catch {}
  }

  if (!car) return null;

  // Fetch detail page for rich data
  let detail = null;
  try {
    const pageRes = await fetch(`https://fem.encar.com/cars/detail/${id}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate: 300 },
    });
    if (pageRes.ok) {
      const html = await pageRes.text();
      const stateStart = html.indexOf('__PRELOADED_STATE__');
      if (stateStart !== -1) {
        const eqSign = html.indexOf('=', stateStart);
        const jsonStart = html.indexOf('{', eqSign);
        const scriptEnd = html.indexOf('</script>', jsonStart);
        if (jsonStart !== -1 && scriptEnd !== -1) {
          let jsonStr = html.substring(jsonStart, scriptEnd).trim();
          if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
          try { detail = JSON.parse(jsonStr); } catch {}
        }
      }
    }
  } catch {}

  return { car, detail };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const data = await getCarData(params.id);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vetura nuk u gjet</h1>
        <p className="text-gray-500 mb-6">
          Kjo veture mund te jete shitur ose hequr nga lista.
        </p>
        <Link
          href="/cars"
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Kthehu te veturat
        </Link>
      </div>
    );
  }

  const { car, detail } = data;
  const carsData = detail?.cars;
  const category = carsData?.base?.category;
  const advertisement = carsData?.base?.advertisement;
  const spec = carsData?.base?.spec;
  const condition = carsData?.base?.condition;
  const warranty = category?.warranty;
  const options = carsData?.base?.options?.standard || [];
  const detailPhotos = carsData?.base?.photos || [];

  const { carPrice, transport, total } = getTotalPrice(car.Price);
  const carName = `${translateManufacturer(car.Manufacturer)} ${translateModel(car.Model)}`;
  const gradeName = category?.gradeEnglishName || `${translateBadge(car.Badge || "")} ${translateBadge(car.BadgeDetail || "")}`;

  // Build photo URLs - prefer detail photos (all 20+), fallback to search API
  let allPhotos: string[] = [];
  if (detailPhotos.length > 0) {
    // Sort: OUTER first, then INNER, then OPTION
    const sorted = [...detailPhotos].sort((a: any, b: any) => {
      const order: Record<string, number> = { OUTER: 0, INNER: 1, OPTION: 2 };
      return (order[a.type] ?? 3) - (order[b.type] ?? 3);
    });
    allPhotos = sorted.map((p: any) => getImageUrl(p.path));
  } else {
    // Fallback: generate from Photo base path
    if (car.Photo) {
      for (let i = 1; i <= 30; i++) {
        allPhotos.push(getImageUrl(`${car.Photo}${i.toString().padStart(3, "0")}.jpg`));
      }
    } else {
      allPhotos = car.Photos?.map((p) => getImageUrl(p.location)) || [];
    }
  }

  // Color translation
  const colorMap: Record<string, string> = {
    "검정색": "Black", "흰색": "White", "은색": "Silver", "회색": "Gray",
    "빨간색": "Red", "파란색": "Blue", "남색": "Navy", "녹색": "Green",
    "노란색": "Yellow", "주황색": "Orange", "갈색": "Brown", "베이지": "Beige",
    "금색": "Gold", "진주색": "Pearl", "쥐색": "Charcoal", "기타": "Other",
  };
  const color = colorMap[spec?.colorName] || translateKorean(spec?.colorName || "");

  const whatsappMessage = encodeURIComponent(
    `Pershendetje! Jam i interesuar per: ${carName} ${car.FormYear}, ${formatMileage(car.Mileage)}, Cmimi: ${formatEur(total)}. A mund te me jepni me shume informata?`
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Ballina</Link>
        <span>/</span>
        <Link href="/cars" className="hover:text-blue-600">Veturat</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{carName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images & Details */}
        <div className="lg:col-span-2">
          <PhotoGallery photos={allPhotos} carName={carName} />

          {/* Specifications */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Specifikacionet</h2>
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-y divide-gray-100">
                <DetailRow label="Marka" value={category?.manufacturerEnglishName || translateManufacturer(car.Manufacturer)} />
                <DetailRow label="Modeli" value={category?.modelName || translateModel(car.Model)} />
                <DetailRow label="Varianti" value={gradeName} />
                <DetailRow label="Viti" value={car.FormYear} />
                <DetailRow label="Kilometrazhi" value={formatMileage(car.Mileage)} />
                <DetailRow label="Karburanti" value={translateFuelType(car.FuelType)} />
                <DetailRow label="Transmisioni" value={translateTransmission(car.Transmission)} />
                {spec?.displacement && (
                  <DetailRow label="Motorri" value={`${new Intl.NumberFormat("de-DE").format(spec.displacement)} cc`} />
                )}
                {color && <DetailRow label="Ngjyra" value={color} />}
                {spec?.seatCount && <DetailRow label="Ulset" value={`${spec.seatCount} ulse`} />}
                {spec?.bodyName && <DetailRow label="Tipi" value={translateKorean(spec.bodyName)} />}
                <DetailRow label="Lokacioni" value={translateKorean(car.OfficeCityState || "Korea")} />
              </div>
            </div>
          </div>

          {/* Options */}
          {options.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Opsionet ({options.length})
              </h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {options.map((code: string) => (
                    <div
                      key={code}
                      className="flex items-center gap-2 text-sm text-gray-700"
                    >
                      <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {OPTION_MAP[code] || `Option ${code}`}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Condition & Accident History */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Gjendja e vetures</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              {/* Frame / Accident status */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  advertisement?.oneLineText?.includes("NO PIANT") || !condition?.accident
                    ? "bg-green-100 text-green-600"
                    : "bg-yellow-100 text-yellow-600"
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Historiku i aksidenteve</div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    {advertisement?.oneLineText?.includes("NO PIANT")
                      ? "Pa ngjyrosje, pa aksidente te raportuara"
                      : condition?.accident?.recordView
                      ? "Historiku i aksidenteve i disponueshem - shiko Encar per detaje"
                      : "Nuk ka te dhena per aksidente"}
                  </div>
                </div>
              </div>

              {/* Seizing / Pledge */}
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                  (condition?.seizing?.seizingCount === 0 && condition?.seizing?.pledgeCount === 0)
                    ? "bg-green-100 text-green-600"
                    : "bg-red-100 text-red-600"
                }`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-900">Statusi ligjor</div>
                  <div className="text-sm text-gray-600 mt-0.5">
                    Konfiskime: {condition?.seizing?.seizingCount ?? "N/A"} | Pengje: {condition?.seizing?.pledgeCount ?? "N/A"}
                  </div>
                </div>
              </div>

              {/* Diagnosis */}
              {advertisement?.diagnosisCar && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Diagnostikuar nga Encar</div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      Kjo veture eshte inspektuar dhe diagnostikuar nga Encar
                    </div>
                  </div>
                </div>
              )}

              {/* Seller note */}
              {advertisement?.oneLineText && (
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Shenime nga shitesi</div>
                    <div className="text-sm text-gray-600 mt-0.5">
                      {advertisement.oneLineText}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Warranty */}
          {warranty && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Garancia e prodhuesit</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Trupi & Shasia</div>
                      <div className="font-semibold text-gray-900">
                        {warranty.bodyMonth} muaj / {new Intl.NumberFormat("de-DE").format(warranty.bodyMileage)} km
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">Transmisioni</div>
                      <div className="font-semibold text-gray-900">
                        {warranty.transmissionMonth} muaj / {new Intl.NumberFormat("de-DE").format(warranty.transmissionMileage)} km
                      </div>
                    </div>
                  </div>
                </div>
                {warranty.companyName && (
                  <div className="text-xs text-gray-500 mt-3">
                    Ofruar nga: {translateKorean(warranty.companyName)}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Certifications */}
          {(car.Condition?.length > 0 || car.Trust?.length > 0) && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Certifikimet</h2>
              <div className="flex flex-wrap gap-2">
                {car.Condition?.includes("Inspection") && (
                  <CertBadge color="green" label="Inspektuar nga Encar" />
                )}
                {car.Condition?.includes("Record") && (
                  <CertBadge color="blue" label="Historik i plote" />
                )}
                {car.Trust?.includes("Warranty") && (
                  <CertBadge color="purple" label="Garanci" />
                )}
                {car.Trust?.includes("HomeService") && (
                  <CertBadge color="orange" label="Dergim ne shtepi" />
                )}
                {car.Trust?.includes("ExtendWarranty") && (
                  <CertBadge color="teal" label="Garanci e zgjeruar" />
                )}
                {advertisement?.preVerified && (
                  <CertBadge color="blue" label="Para-verifikuar" />
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Price & Contact */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 space-y-4">
            {/* Price card */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{carName}</h1>
              <p className="text-gray-500 text-sm mb-4">{gradeName}</p>

              <div className="bg-blue-50 rounded-xl p-5 mb-6">
                <div className="text-sm text-blue-600 font-medium mb-1">Cmimi total</div>
                <div className="text-4xl font-bold text-blue-700">
                  {formatEur(total)}
                </div>
                <div className="mt-3 space-y-1 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Cmimi i vetures</span>
                    <span>{formatEur(carPrice)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Transporti (Korea → Durres)</span>
                    <span>{formatEur(transport)}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-6 text-sm">
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-gray-500">Viti</div>
                  <div className="font-semibold text-gray-900">{car.FormYear}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-gray-500">Km</div>
                  <div className="font-semibold text-gray-900">{formatMileage(car.Mileage)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-gray-500">Karburanti</div>
                  <div className="font-semibold text-gray-900">{translateFuelType(car.FuelType)}</div>
                </div>
                <div className="bg-gray-50 rounded-lg p-3 text-center">
                  <div className="text-gray-500">Transmisioni</div>
                  <div className="font-semibold text-gray-900">{translateTransmission(car.Transmission)}</div>
                </div>
              </div>

              {/* View count */}
              {carsData?.base?.manage?.viewCount && (
                <div className="text-xs text-gray-400 text-center mb-4">
                  {new Intl.NumberFormat("de-DE").format(carsData.base.manage.viewCount)} shikime
                </div>
              )}

              {/* Contact buttons */}
              <div className="space-y-3">
                <a
                  href={`https://wa.me/38344647559?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  Porosit permes WhatsApp
                </a>
                <a
                  href="https://instagram.com/koreancars"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                  Na shkruani ne Instagram
                </a>
                <div className="flex gap-3">
                  <a
                    href="https://facebook.com/koreancars"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </a>
                  <a
                    href="https://tiktok.com/@koreancars"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-black hover:bg-gray-800 text-white py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-1 text-sm"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.48 6.3 6.3 0 001.86-4.49V8.76a8.26 8.26 0 004.85 1.56V6.79a4.84 4.84 0 01-1.13-.1z" />
                    </svg>
                    TikTok
                  </a>
                </div>
              </div>
            </div>

            {/* Original listing */}
            <a
              href={`https://fem.encar.com/cars/detail/${params.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-gray-500 hover:text-blue-600 transition-colors py-2"
            >
              Shiko listimin origjinal ne Encar.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className="font-medium text-gray-900">{value}</div>
    </div>
  );
}

function CertBadge({ color, label }: { color: string; label: string }) {
  const colorClasses: Record<string, string> = {
    green: "bg-green-100 text-green-700 border-green-200",
    blue: "bg-blue-100 text-blue-700 border-blue-200",
    purple: "bg-purple-100 text-purple-700 border-purple-200",
    orange: "bg-orange-100 text-orange-700 border-orange-200",
    teal: "bg-teal-100 text-teal-700 border-teal-200",
    gray: "bg-gray-100 text-gray-700 border-gray-200",
  };

  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium border ${colorClasses[color] || colorClasses.gray}`}>
      {label}
    </span>
  );
}
