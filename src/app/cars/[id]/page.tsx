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
  translatePartName,
  translateResultCode,
  translateInspectionPart,
  translateInspectionStatus,
  TRANSPORT_COST,
} from "@/lib/encar";
import { getWhatsAppNumber } from "@/lib/settings";
import PhotoGallery from "@/components/PhotoGallery";
import CarBodyDiagram from "@/components/CarBodyDiagram";
import ReserveButton from "@/components/ReserveButton";

// Encar standard option codes mapping (Albanian)
const OPTION_MAP: Record<string, string> = {
  "001": "Cati e hapur", "002": "Cati panoramike", "003": "Cati me hene",
  "004": "Drita LED", "005": "Sensoret e parkimit", "006": "Kamera mbrapa",
  "007": "Klima automatike", "008": "Celesi inteligjent", "009": "Ndezje me buton",
  "010": "Navigacion", "011": "Bluetooth", "012": "Port USB",
  "013": "AUX", "014": "Ulse te ngrohta", "015": "Ulse te ventiluara",
  "016": "Ulse me memorie", "017": "Ulse lekure", "018": "Ulse elektrike",
  "019": "Tempomat", "020": "Drita automatike", "021": "Sensor shiu",
  "022": "Fshires mbrapa", "023": "Drita mjegulle", "024": "Disqe aliazhi",
  "025": "Mbajtese catie", "026": "Xhama te errsuara", "027": "Pasqyra palosese",
  "028": "Pasqyra te ngrohta", "029": "Pasqyre anti-verbuese",
  "030": "Paralajmerim per korsi", "031": "Paralajmerim per perplasje",
  "032": "Paralajmerim per pike te verbera", "033": "Tempomat adaptiv",
  "034": "Monitor rrethues", "035": "Ekran ne xham (HUD)",
  "036": "Karikim wireless", "037": "Apple CarPlay", "038": "Android Auto",
  "039": "Kamera 360°", "040": "Bagazh elektrik", "041": "Bagazh pa duar",
  "042": "Ndezje ne distance", "043": "Timon i ngrohte",
  "044": "Menyra e timonit", "045": "Menyra e vozitjes",
  "046": "Frena parkimi elektronike", "047": "Auto Hold",
  "048": "Ndihmese per nisje ne perpjete", "049": "Kontroll per zbritje",
  "050": "4WD", "051": "Suspension ajrore", "052": "Suspension sportive",
  "053": "Tingull aktiv", "054": "Sistem premium zanor", "055": "Sensoret para",
  "056": "Sensoret mbrapa", "057": "Ndihmese parkimi", "058": "Parkim automatik",
  "059": "Pasqyre ECM", "060": "Ndricim ambiental",
  "061": "Klima e dyfishte", "062": "Klima per mbrapa",
  "063": "Pastrues ajri", "064": "Ventilim ulsesh mbrapa",
  "065": "Argetim per mbrapa", "066": "Pasqyra palosese elektrike",
  "067": "Drita ditore (DRL)", "068": "Drita kthese", "069": "Drita adaptive",
  "070": "Matrix LED", "071": "Drita laser",
  "072": "Frenim emergjent", "073": "Detektor kembesore",
  "074": "Njohje e shenjave rrugore", "075": "Ndihmese per mbajtje korsi",
  "076": "Ndihmese per autostrade", "077": "Parkim ne distance",
  "078": "Pamje rrethore", "079": "Paralajmerim per vemendje",
  "080": "Alert per trafik mbrapa", "081": "Paralajmerim per dalje te sigurte",
  "082": "Frenim multi-perplasjesh", "083": "eCall",
  "084": "Monitor i presionit te gomave", "085": "ESC", "086": "Airbag 6+",
  "087": "Airbag 8+", "088": "ISOFIX", "089": "Kufizues shpejtesie",
  "090": "Fshirese automatike", "091": "Levize ne timon", "092": "Modalitet sport",
  "093": "Modalitet eko", "094": "Pasqyra palosese elektrike", "095": "Drita mireseardhje",
  "096": "Drita mbrapa LED", "097": "Sinjale sekuenciale",
};

interface CarDetailPageProps {
  params: { id: string };
}

interface DetailData {
  car: EncarCar;
  detail: any;
  accidentSummary: any;
  inspectionSummary: any;
  diagnosis: any;
  performanceData: Record<string, string[] | null> | null;
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

  // Fetch all additional data in parallel
  const [detailResult, accidentResult, inspectionResult, diagnosisResult] = await Promise.allSettled([
    fetch(`https://fem.encar.com/cars/detail/${id}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate: 300 },
    }),
    fetch(`https://api.encar.com/v1/readside/record/vehicle/${id}/summary`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    }),
    fetch(`https://api.encar.com/v1/readside/inspection/vehicle/${id}/summary`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    }),
    fetch(`https://api.encar.com/v1/readside/diagnosis/vehicle/${id}`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    }),
  ]);

  let detail = null;
  if (detailResult.status === "fulfilled" && detailResult.value.ok) {
    try {
      const html = await detailResult.value.text();
      const stateStart = html.indexOf('__PRELOADED_STATE__');
      if (stateStart !== -1) {
        const eqSign = html.indexOf('=', stateStart);
        const jsonStart = html.indexOf('{', eqSign);
        const scriptEnd = html.indexOf('</script>', jsonStart);
        if (jsonStart !== -1 && scriptEnd !== -1) {
          let jsonStr = html.substring(jsonStart, scriptEnd).trim();
          if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
          detail = JSON.parse(jsonStr);
        }
      }
    } catch {}
  }

  let accidentSummary = null;
  if (accidentResult.status === "fulfilled" && accidentResult.value.ok) {
    try { accidentSummary = await accidentResult.value.json(); } catch {}
  }

  let inspectionSummary = null;
  if (inspectionResult.status === "fulfilled" && inspectionResult.value.ok) {
    try { inspectionSummary = await inspectionResult.value.json(); } catch {}
  }

  let diagnosis = null;
  if (diagnosisResult.status === "fulfilled" && diagnosisResult.value.ok) {
    try { diagnosis = await diagnosisResult.value.json(); } catch {}
  }

  // For DUPLICATION cars, report APIs may 404 with the listing ID.
  // Try to find the original car ID from photo paths and retry.
  let effectiveId = id;
  if (!accidentSummary || !inspectionSummary || !diagnosis) {
    const photos = detail?.cars?.base?.photos || [];
    const photoPath = photos[0]?.path || "";
    const origMatch = photoPath.match(/\/pic\d+\/(\d+)_/);
    const origId = origMatch?.[1];
    if (origId && origId !== id) {
      effectiveId = origId;
      const retries = await Promise.allSettled([
        !accidentSummary ? fetch(`https://api.encar.com/v1/readside/record/vehicle/${origId}/summary`, { headers: HEADERS, next: { revalidate: 300 } }) : Promise.resolve(null),
        !inspectionSummary ? fetch(`https://api.encar.com/v1/readside/inspection/vehicle/${origId}/summary`, { headers: HEADERS, next: { revalidate: 300 } }) : Promise.resolve(null),
        !diagnosis ? fetch(`https://api.encar.com/v1/readside/diagnosis/vehicle/${origId}`, { headers: HEADERS, next: { revalidate: 300 } }) : Promise.resolve(null),
      ]);
      if (!accidentSummary && retries[0].status === "fulfilled") {
        const res = retries[0].value;
        if (res && 'ok' in res && res.ok) { try { accidentSummary = await res.json(); } catch {} }
      }
      if (!inspectionSummary && retries[1].status === "fulfilled") {
        const res = retries[1].value;
        if (res && 'ok' in res && res.ok) { try { inspectionSummary = await res.json(); } catch {} }
      }
      if (!diagnosis && retries[2].status === "fulfilled") {
        const res = retries[2].value;
        if (res && 'ok' in res && res.ok) { try { diagnosis = await res.json(); } catch {} }
      }
    }
  }

  // Fetch detailed accident data with costs using the 'open' endpoint
  if (accidentSummary?.carNo) {
    try {
      const openRes = await fetch(
        `https://api.encar.com/v1/readside/record/vehicle/${effectiveId}/open?vehicleNo=${encodeURIComponent(accidentSummary.carNo)}`,
        { headers: HEADERS, next: { revalidate: 300 } }
      );
      if (openRes.ok) {
        const openData = await openRes.json();
        if (openData?.openData) {
          accidentSummary = openData;
        }
      }
    } catch {}
  }

  // Fetch inspection page HTML to extract performanceCheck data (damage diagram)
  let performanceData: Record<string, string[] | null> | null = null;
  try {
    const inspPageRes = await fetch(
      `https://www.encar.com/md/sl/mdsl_regcar.do?method=inspectionViewNew&carid=${effectiveId}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html",
        },
        next: { revalidate: 300 },
      }
    );
    if (inspPageRes.ok) {
      const inspHtml = await inspPageRes.text();
      const match = inspHtml.match(/performanceCheck\.init\(\{\s*data\s*:\s*(\{[^}]+\})/);
      if (match) {
        performanceData = JSON.parse(match[1]);
      }
    }
  } catch {}

  return { car, detail, accidentSummary, inspectionSummary, diagnosis, performanceData };
}

export default async function CarDetailPage({ params }: CarDetailPageProps) {
  const [data, whatsappNumber] = await Promise.all([getCarData(params.id), getWhatsAppNumber()]);

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Vetura nuk u gjet</h1>
        <p className="text-gray-500 mb-6">
          Kjo veture mund te jete shitur ose hequr nga lista.
        </p>
        <Link
          href="/cars"
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Kthehu te veturat
        </Link>
      </div>
    );
  }

  const { car, detail, accidentSummary, inspectionSummary, diagnosis, performanceData } = data;
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
    allPhotos = sorted.map((p: any) => getImageUrl(p.path, "detail"));
  } else {
    // Fallback: generate from Photo base path
    if (car.Photo) {
      for (let i = 1; i <= 30; i++) {
        allPhotos.push(getImageUrl(`${car.Photo}${i.toString().padStart(3, "0")}.jpg`, "detail"));
      }
    } else {
      allPhotos = car.Photos?.map((p) => getImageUrl(p.location, "detail")) || [];
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
        <Link href="/" className="hover:text-red-600">Ballina</Link>
        <span>/</span>
        <Link href="/cars" className="hover:text-red-600">Veturat</Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{carName}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Images & Details */}
        <div className="lg:col-span-2">
          <PhotoGallery photos={allPhotos} carName={carName} />

          {/* Specifications */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">Specifikacionet</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2">
                <DetailRow label="Marka" value={category?.manufacturerEnglishName || translateManufacturer(car.Manufacturer)} />
                <DetailRow label="Modeli" value={translateModel(category?.modelName || car.Model)} />
                <DetailRow label="Varianti" value={gradeName} />
                <DetailRow label="Viti" value={car.FormYear} />
                <DetailRow label="Km" value={formatMileage(car.Mileage)} />
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

          {/* Insurance / Accident History */}
          <div className="mt-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Historiku i sigurimit & aksidenteve</h2>
            <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
              {accidentSummary ? (
                <>
                  {/* Accident counts */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className={`rounded-lg p-3 text-center ${
                      accidentSummary.myAccidentCnt === 0 ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}>
                      <div className={`text-2xl font-bold ${accidentSummary.myAccidentCnt === 0 ? "text-green-600" : "text-red-600"}`}>
                        {accidentSummary.myAccidentCnt}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Aksidente (dami im)</div>
                      {accidentSummary.myAccidentCost > 0 && (
                        <div className="text-xs font-semibold text-red-500 mt-0.5">
                          ~{Math.round(accidentSummary.myAccidentCost * 0.000573).toLocaleString("de-DE")} €
                        </div>
                      )}
                    </div>
                    <div className={`rounded-lg p-3 text-center ${
                      accidentSummary.otherAccidentCnt === 0 ? "bg-green-50 border border-green-200" : "bg-orange-50 border border-orange-200"
                    }`}>
                      <div className={`text-2xl font-bold ${accidentSummary.otherAccidentCnt === 0 ? "text-green-600" : "text-orange-600"}`}>
                        {accidentSummary.otherAccidentCnt}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Aksidente (nga te tjeret)</div>
                      {accidentSummary.otherAccidentCost > 0 && (
                        <div className="text-xs font-semibold text-orange-500 mt-0.5">
                          ~{Math.round(accidentSummary.otherAccidentCost * 0.000573).toLocaleString("de-DE")} €
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg p-3 text-center bg-gray-50 border border-gray-200">
                      <div className="text-2xl font-bold text-gray-700">{accidentSummary.ownerChangeCnt}</div>
                      <div className="text-xs text-gray-600 mt-1">Ndryshime pronari</div>
                    </div>
                    <div className={`rounded-lg p-3 text-center ${
                      accidentSummary.totalLossCnt === 0 && accidentSummary.floodTotalLossCnt === 0
                        ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
                    }`}>
                      <div className={`text-2xl font-bold ${
                        accidentSummary.totalLossCnt === 0 && accidentSummary.floodTotalLossCnt === 0 ? "text-green-600" : "text-red-600"
                      }`}>
                        {accidentSummary.totalLossCnt + accidentSummary.floodTotalLossCnt}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">Humbje totale / Permbytje</div>
                    </div>
                  </div>

                  {/* Accident details list */}
                  {accidentSummary.accidents && accidentSummary.accidents.length > 0 && (
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2 text-sm">Detajet e aksidenteve</h3>
                      <div className="space-y-2">
                        {accidentSummary.accidents.map((acc: any, idx: number) => {
                          const totalKrw = (acc.partCost || 0) + (acc.laborCost || 0) + (acc.paintingCost || 0);
                          const totalEur = Math.round(totalKrw * 0.000573);
                          return (
                            <div key={idx} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-gray-900">
                                  {acc.type === "2" ? "Dami im" : acc.type === "3" ? "Dami nga te tjeret" : `Tipi ${acc.type}`}
                                </span>
                                <span className="text-xs text-gray-500">{acc.date}</span>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-xs">
                                <div>
                                  <span className="text-gray-500">Pjese</span>
                                  <div className="font-medium">{Math.round((acc.partCost || 0) * 0.000573)} €</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Punishtri</span>
                                  <div className="font-medium">{Math.round((acc.laborCost || 0) * 0.000573)} €</div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Ngjyrosje</span>
                                  <div className="font-medium">{Math.round((acc.paintingCost || 0) * 0.000573)} €</div>
                                </div>
                              </div>
                              <div className="mt-2 pt-2 border-t border-gray-200 flex justify-between">
                                <span className="text-xs font-semibold text-gray-700">Totali i riparimit</span>
                                <span className="text-sm font-bold text-red-600">~{totalEur.toLocaleString("de-DE")} €</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Additional details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Regjistrimi i pare</span>
                      <span className="font-medium text-gray-900">{accidentSummary.firstDate || "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Perdorimi</span>
                      <span className="font-medium text-gray-900">{accidentSummary.use === "2" ? "Personal" : accidentSummary.use === "1" ? "Biznes" : "N/A"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Vjedhje</span>
                      <span className={`font-medium ${accidentSummary.robberCnt === 0 ? "text-green-600" : "text-red-600"}`}>
                        {accidentSummary.robberCnt === 0 ? "Asnjehere" : `${accidentSummary.robberCnt} here`}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-100">
                      <span className="text-gray-600">Peng</span>
                      <span className={`font-medium ${accidentSummary.loan === 0 ? "text-green-600" : "text-yellow-600"}`}>
                        {accidentSummary.loan === 0 ? "Jo" : `${accidentSummary.loan} aktive`}
                      </span>
                    </div>
                  </div>
                </>
              ) : (
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    advertisement?.oneLineText?.includes("NO PIANT") ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
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
                        : "Nuk ka te dhena per aksidente"}
                    </div>
                  </div>
                </div>
              )}

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

          {/* Performance Check / Diagnosis */}
          {(diagnosis || inspectionSummary || performanceData) && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Inspektimi i performances</h2>
              <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-5">
                {/* Car Body Diagram */}
                <CarBodyDiagram performanceData={performanceData} />

                {/* Diagnosis items - panel check results */}
                {diagnosis?.items && diagnosis.items.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Kontrolli i paneleve te jashtme</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {diagnosis.items
                        .filter((item: any) => item.resultCode && item.resultCode !== null && item.name !== "CHECKER_COMMENT" && item.name !== "OUTER_PANEL_COMMENT")
                        .map((item: any) => {
                          const result = translateResultCode(item.resultCode);
                          const colorClasses: Record<string, string> = {
                            green: "bg-green-50 text-green-700 border-green-200",
                            red: "bg-red-50 text-red-700 border-red-200",
                            orange: "bg-orange-50 text-orange-700 border-orange-200",
                            yellow: "bg-yellow-50 text-yellow-700 border-yellow-200",
                            blue: "bg-blue-50 text-blue-700 border-blue-200",
                            purple: "bg-purple-50 text-purple-700 border-purple-200",
                            gray: "bg-gray-50 text-gray-700 border-gray-200",
                          };
                          return (
                            <div key={item.code} className={`flex items-center justify-between px-3 py-2 rounded-lg border ${colorClasses[result.color] || colorClasses.gray}`}>
                              <span className="text-sm">{translatePartName(item.name)}</span>
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                item.resultCode === "NORMAL" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                              }`}>
                                {result.label}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                  </div>
                )}

                {/* Inspector name */}
                {inspectionSummary?.inspName && (
                  <div className="text-xs text-gray-400 text-right">
                    Inspektori: {inspectionSummary.inspName}
                  </div>
                )}
              </div>
            </div>
          )}

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

              <div className="bg-gray-900 rounded-xl p-5 mb-6">
                <div className="text-sm text-gray-400 font-medium mb-1">Cmimi total</div>
                <div className="text-4xl font-bold text-white">
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
                <ReserveButton
                  carId={String(car.Id)}
                  carData={{
                    manufacturer: car.Manufacturer,
                    model: car.Model,
                    badge: car.Badge,
                    price: car.Price,
                    image: allPhotos[0] || getImageUrl(car.Photo),
                    year: car.FormYear,
                    mileage: car.Mileage,
                    fuelType: car.FuelType,
                  }}
                />
                <a
                  href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-3.5 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                  </svg>
                  Porosit permes WhatsApp
                </a>
              </div>
            </div>

            {/* Original listing */}
            <a
              href={`https://fem.encar.com/cars/detail/${params.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-center text-sm text-gray-500 hover:text-red-600 transition-colors py-2"
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
    <div className="flex justify-between items-center py-1.5 border-b border-gray-100 last:border-0">
      <span className="text-xs text-gray-500">{label}</span>
      <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
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
