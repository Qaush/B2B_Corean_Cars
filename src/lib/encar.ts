export interface EncarPhoto {
  type: string;
  location: string;
  updatedDate: string;
  ordering: number;
}

export interface EncarCar {
  Id: string;
  Manufacturer: string;
  Model: string;
  Badge: string;
  BadgeDetail: string;
  Year: number;
  FormYear: string;
  Mileage: number;
  Price: number; // in 만원 (10,000 KRW)
  Transmission: string;
  FuelType: string;
  Photo: string;
  Photos: EncarPhoto[];
  OfficeCityState: string;
  ServiceCopyCar: string;
  Condition: string[];
  Trust: string[];
}

export interface EncarSearchResult {
  Count: number;
  SearchResults: EncarCar[];
}

// KRW to EUR exchange rate (approximate, updated periodically)
const KRW_TO_EUR = 0.000573; // ~1 EUR = 1,744 KRW (March 2026)
const MARKUP = 1.05; // 5% profit margin
export const TRANSPORT_COST = 1500; // Transport Korea → Durres/Prishtine

export function convertPriceToEur(priceInManWon: number): number {
  const krw = priceInManWon * 10000;
  const eur = krw * KRW_TO_EUR * MARKUP;
  return Math.round(eur);
}

export function getTotalPrice(priceInManWon: number): { carPrice: number; transport: number; total: number } {
  const carPrice = convertPriceToEur(priceInManWon);
  return { carPrice, transport: TRANSPORT_COST, total: carPrice + TRANSPORT_COST };
}

export function formatEur(eur: number): string {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(eur);
}

export function getImageUrl(photo: string): string {
  if (!photo) return "/placeholder-car.svg";
  return `https://ci.encar.com${photo}`;
}

export function getMainImageUrl(car: EncarCar): string {
  if (car.Photos && car.Photos.length > 0) {
    return getImageUrl(car.Photos[0].location);
  }
  if (car.Photo) {
    return getImageUrl(car.Photo + "001.jpg");
  }
  return "/placeholder-car.svg";
}

export function getAllPhotoUrls(car: EncarCar): string[] {
  if (!car.Photo) {
    return car.Photos?.map((p) => getImageUrl(p.location)) || [];
  }
  // Generate URLs for 001-030 from the base Photo path
  const urls: string[] = [];
  for (let i = 1; i <= 30; i++) {
    const num = i.toString().padStart(3, "0");
    urls.push(getImageUrl(`${car.Photo}${num}.jpg`));
  }
  return urls;
}

export function translateTransmission(t: string): string {
  const map: Record<string, string> = {
    "오토": "Automatic",
    "수동": "Manual",
    "CVT": "CVT",
    "세미오토": "Semi-Auto",
  };
  return map[t] || t;
}

export function translateFuelType(f: string): string {
  const map: Record<string, string> = {
    "가솔린": "Benzine",
    "디젤": "Diesel",
    "가솔린+전기": "Hybrid",
    "전기": "Elektrike",
    "LPG": "LPG",
    "수소": "Hidrogjen",
    "가솔린+LPG": "Benzine+LPG",
  };
  return map[f] || f;
}

export function translateManufacturer(m: string): string {
  const map: Record<string, string> = {
    // Korean domestic
    "현대": "Hyundai",
    "기아": "Kia",
    "제네시스": "Genesis",
    "쉐보레(GM대우)": "Chevrolet",
    "르노코리아(삼성)": "Renault Korea",
    "KG모빌리티(쌍용)": "KG Mobility",
    // Imported
    "벤츠": "Mercedes-Benz",
    "아우디": "Audi",
    "포르쉐": "Porsche",
    "미니": "MINI",
    "폭스바겐": "Volkswagen",
    "랜드로버": "Land Rover",
    "볼보": "Volvo",
    "지프": "Jeep",
    "포드": "Ford",
    "테슬라": "Tesla",
    "렉서스": "Lexus",
    "도요타": "Toyota",
    "링컨": "Lincoln",
    "혼다": "Honda",
    "마세라티": "Maserati",
    "푸조": "Peugeot",
    "재규어": "Jaguar",
    "캐딜락": "Cadillac",
    "인피니티": "Infiniti",
    "벤틀리": "Bentley",
    "닛산": "Nissan",
    "페라리": "Ferrari",
    "롤스로이스": "Rolls-Royce",
    "람보르기니": "Lamborghini",
    "시트로엥/DS": "Citroen/DS",
    "쉐보레": "Chevrolet",
    "폴스타": "Polestar",
    "피아트": "Fiat",
    "크라이슬러": "Chrysler",
    "닷지": "Dodge",
    "맥라렌": "McLaren",
    "스즈키": "Suzuki",
    "애스턴마틴": "Aston Martin",
    "스마트": "Smart",
    "험머": "Hummer",
    "로터스": "Lotus",
    "미쯔비시": "Mitsubishi",
    "스바루": "Subaru",
    "마쯔다": "Mazda",
    "알파 로메오": "Alfa Romeo",
    "마이바흐": "Maybach",
    "부가티": "Bugatti",
    "이네오스": "INEOS",
  };
  return map[m] || m;
}

// Imported brands need 'general' endpoint with CarType.N
const IMPORTED_MANUFACTURERS = new Set([
  "BMW", "벤츠", "아우디", "포르쉐", "미니", "폭스바겐", "랜드로버", "볼보",
  "지프", "포드", "테슬라", "렉서스", "도요타", "링컨", "혼다", "마세라티",
  "푸조", "재규어", "캐딜락", "인피니티", "벤틀리", "닛산", "페라리",
  "롤스로이스", "람보르기니", "시트로엥/DS", "쉐보레", "폴스타", "피아트",
  "크라이슬러", "닷지", "GMC", "맥라렌", "스즈키", "애스턴마틴", "스마트",
  "험머", "로터스", "미쯔비시", "스바루", "마쯔다", "알파 로메오", "마이바흐",
  "부가티", "이네오스",
]);

export function isImportedBrand(manufacturer: string): boolean {
  return IMPORTED_MANUFACTURERS.has(manufacturer);
}

export function getApiEndpoint(manufacturer?: string): string {
  if (manufacturer && isImportedBrand(manufacturer)) {
    return "https://api.encar.com/search/car/list/general";
  }
  return "https://api.encar.com/search/car/list/premium";
}

export function buildSearchQueryWithType(filters: {
  manufacturer?: string;
  model?: string;
  badge?: string;
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
}): string {
  const isImported = filters.manufacturer && isImportedBrand(filters.manufacturer);
  let conditions = ["Hidden.N"];

  if (isImported) {
    conditions.push("CarType.N");
  }

  if (filters.manufacturer) {
    conditions.push(`Manufacturer.${filters.manufacturer}`);
  }
  if (filters.model) {
    conditions.push(`ModelGroup.${filters.model}`);
  }
  if (filters.badge) {
    conditions.push(`Badge.${filters.badge}`);
  }
  if (filters.fuelType) {
    conditions.push(`FuelType.${filters.fuelType}`);
  }
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice || "";
    const max = filters.maxPrice || "";
    conditions.push(`Price.range(${min}..${max})`);
  }
  if (filters.minYear || filters.maxYear) {
    const min = filters.minYear ? `${filters.minYear}00` : "";
    const max = filters.maxYear ? `${filters.maxYear}12` : "";
    conditions.push(`Year.range(${min}..${max})`);
  }
  if (filters.maxMileage) {
    conditions.push(`Mileage.range(..${filters.maxMileage})`);
  }

  return `(And.${conditions.join("._.")}.)`;
}

export function formatMileage(km: number): string {
  return new Intl.NumberFormat("de-DE").format(km) + " km";
}

// --- Korean to English translations for models, badges, trims ---

const MODEL_TRANSLATIONS: Record<string, string> = {
  // Hyundai
  "쏘나타": "Sonata", "아반떼": "Avante", "투싼": "Tucson", "산타페": "Santa Fe",
  "그랜저": "Grandeur", "팰리세이드": "Palisade", "코나": "Kona", "베뉴": "Venue",
  "아이오닉": "Ioniq", "스타리아": "Staria", "캐스퍼": "Casper", "넥쏘": "Nexo",
  "포터": "Porter", "쏠라티": "Solati", "엑센트": "Accent", "벨로스터": "Veloster",
  "i30": "i30", "i40": "i40", "엘란트라": "Elantra", "싼타크루즈": "Santa Cruz",
  "싼타페": "Santa Fe", "스타렉스": "Starex", "제네시스": "Genesis", "에쿠스": "Equus",
  "아이오닉5": "Ioniq5", "아이오닉6": "Ioniq6", "아이오닉9": "Ioniq9",
  "맥스크루즈": "MaxCruze", "베라크루즈": "Veracruz", "아슬란": "Aslan",
  "갤로퍼": "Galloper", "테라칸": "Terracan", "투스카니": "Tuscani",
  "다이너스티": "Dynasty", "베르나": "Verna", "티뷰론": "Tiburon",
  "트라제 XG": "Trajet XG", "마르샤": "Marcia", "포니": "Pony",
  "산타모": "Santamo", "엑셀": "Excel", "아토스": "Atos",
  "클릭": "Click", "프레스토": "Presto",
  "더 뉴 투싼": "New Tucson", "디 올 뉴 투싼": "All New Tucson",
  "더 뉴 산타페": "New Santa Fe", "디 올 뉴 산타페": "All New Santa Fe",
  "더 뉴 그랜저": "New Grandeur", "디 올 뉴 그랜저": "All New Grandeur",
  "더 뉴 아반떼": "New Avante", "디 올 뉴 아반떼": "All New Avante",
  "더 뉴 코나": "New Kona", "디 올 뉴 코나": "All New Kona",
  // Kia
  "스포티지": "Sportage", "셀토스": "Seltos", "쏘렌토": "Sorento",
  "모하비": "Mohave", "카니발": "Carnival", "레이": "Ray", "모닝": "Morning",
  "니로": "Niro", "스팅어": "Stinger", "EV6": "EV6", "EV9": "EV9", "EV3": "EV3", "EV4": "EV4", "EV5": "EV5",
  "쏘울": "Soul", "프라이드": "Pride", "카렌스": "Carens", "스토닉": "Stonic",
  "타스만": "Tasman", "포르테": "Forte", "오피러스": "Opirus", "로체": "Lotze",
  "PV5": "PV5", "엘란": "Elan", "포텐샤": "Potentia", "레토나": "Retona",
  "봉고III 미니버스": "Bongo III Minibus", "엔터프라이즈": "Enterprise",
  "스펙트라": "Spectra", "쎄라토": "Cerato", "아벨라": "Avella",
  "캐피탈": "Capital", "크레도스": "Credos", "리갈": "Regal",
  "카스타": "Carstar", "타우너": "Towner",
  "더 뉴 셀토스": "New Seltos", "더 뉴 스포티지": "New Sportage",
  "더 뉴 쏘렌토": "New Sorento", "더 뉴 카니발": "New Carnival",
  "더 K9": "K9", "더 뉴 K5": "New K5",
  // Genesis
  "G70": "G70", "G80": "G80", "G90": "G90", "GV60": "GV60",
  "GV70": "GV70", "GV80": "GV80",
  // Chevrolet/GM
  "스파크": "Spark", "트래버스": "Traverse", "트랙스": "Trax",
  "이쿼녹스": "Equinox", "말리부": "Malibu", "크루즈": "Cruze",
  "올란도": "Orlando", "임팔라": "Impala", "카마로": "Camaro",
  "콜로라도": "Colorado", "볼트": "Bolt",
  "트레일블레이저": "Trailblazer", "캡티바": "Captiva", "아베오": "Aveo",
  "알페온": "Alpheon", "라보": "Labo", "볼트 EV": "Bolt EV", "마티즈": "Matiz",
  "다마스": "Damas", "볼트 EUV": "Bolt EUV", "타호": "Tahoe",
  "라세티": "Lacetti", "윈스톰": "Winstorm", "티코": "Tico",
  "볼트(Volt)": "Volt", "아카디아": "Acadia", "에스페로": "Espero",
  "스테이츠맨": "Statesman", "토스카": "Tosca", "라노스": "Lanos",
  "레조": "Rezzo", "르망": "Le Mans", "매그너스": "Magnus",
  "젠트라": "Gentra", "프린스": "Prince",
  // Renault/Samsung
  "SM6": "SM6", "QM6": "QM6", "XM3": "XM3", "SM3": "SM3", "SM5": "SM5",
  "SM7": "SM7", "QM3": "QM3", "QM5": "QM5", "클리오": "Clio",
  "트위지": "Twizy", "조에": "Zoe", "아르카나": "Arkana",
  "그랑 콜레오스": "Grand Koleos", "마스터": "Master", "캡처": "Captur",
  "세닉": "Scenic", "필랑트": "Fluence",
  // SsangYong/KG
  "토레스": "Torres", "코란도": "Korando", "티볼리": "Tivoli",
  "렉스턴": "Rexton", "무쏘": "Musso", "액티언": "Actyon",
  "체어맨": "Chairman", "로디우스": "Rodius",
  "카이런": "Kyron", "이스타나": "Istana",
  // BMW
  "1시리즈": "1 Series", "2시리즈": "2 Series", "3시리즈": "3 Series",
  "4시리즈": "4 Series", "5시리즈": "5 Series", "6시리즈": "6 Series",
  "7시리즈": "7 Series", "8시리즈": "8 Series",
  "그란투리스모": "Gran Turismo",
  "그란투리스모 (GT)": "Gran Turismo (GT)",
  // Mercedes
  "S클래스": "S-Class", "E클래스": "E-Class", "C클래스": "C-Class",
  "A클래스": "A-Class", "B클래스": "B-Class", "G클래스": "G-Class",
  "CLA클래스": "CLA-Class", "CLS클래스": "CLS-Class",
  "GLA클래스": "GLA-Class", "GLB클래스": "GLB-Class",
  "GLC클래스": "GLC-Class", "GLE클래스": "GLE-Class",
  "GLS클래스": "GLS-Class", "GL클래스": "GL-Class",
  "SL클래스": "SL-Class", "SLK클래스": "SLK-Class",
  "AMG GT": "AMG GT", "마이바흐": "Maybach",
};

// Common Korean words found in badge/trim descriptions
const KOREAN_WORD_MAP: Record<string, string> = {
  // Fuel/Engine
  "가솔린": "Gasoline", "디젤": "Diesel", "전기": "Electric",
  "하이브리드": "Hybrid", "수소": "Hydrogen", "터보": "Turbo",
  "슈퍼차저": "Supercharger",
  // Drivetrain
  "사륜": "4WD", "이륜": "2WD", "전륜": "FWD", "후륜": "RWD",
  // Trim levels
  "프리미엄": "Premium", "럭셔리": "Luxury", "프레스티지": "Prestige",
  "노블레스": "Noblesse", "인스퍼레이션": "Inspiration", "캘리그래피": "Calligraphy",
  "익스클루시브": "Exclusive", "모던": "Modern", "스마트": "Smart",
  "트렌디": "Trendy", "시그니처": "Signature", "익스트림": "Extreme",
  "스페셜": "Special", "클래식": "Classic", "에디션": "Edition",
  "스포츠": "Sports", "스포티": "Sporty", "어드밴스": "Advance",
  "셀렉션": "Selection", "컴포트": "Comfort", "엘레강스": "Elegance",
  "그래비티": "Gravity", "얼티밋": "Ultimate",
  // Body
  "세단": "Sedan", "왜건": "Wagon", "쿠페": "Coupe", "컨버터블": "Convertible",
  "해치백": "Hatchback", "리무진": "Limousine", "밴": "Van", "픽업": "Pickup",
  "카브리올레": "Cabriolet",
  // Seating
  "인승": "Seats", "시트": "Seat",
  // Features
  "파노라마": "Panorama", "네비게이션": "Navigation", "에어백": "Airbag",
  "썬루프": "Sunroof", "가죽": "Leather", "전동": "Electric",
  "선루프": "Sunroof", "열선": "Heated",
  // Size
  "롱바디": "Long Body", "숏바디": "Short Body",
  "롱": "Long", "숏": "Short",
  // Korean descriptors
  "더 뉴": "New", "디 올 뉴": "All New", "올 뉴": "All New",
  "뉴": "New", "더": "The",
  // Numbers in Korean context
  "세대": "Gen", "페이스리프트": "Facelift",
  // Common
  "기본형": "Base", "고급형": "Premium", "최고급형": "Top",
  "일반": "Standard", "기본": "Base",
  // Door
  "도어": "Door",
  // Foreign brand terms in Korean
  "콰트로": "Quattro", "트론": "tron", "스포트백": "Sportback",
  "스파이더": "Spyder", "아방가르드": "Avant", "올로드": "Allroad",
  "그란쿠페": "Gran Coupe", "그란투리스모": "Gran Turismo",
  "로드스터": "Roadster", "카브리올렛": "Cabriolet",
  "투어링": "Touring", "리무진": "Limousine",
  "쿠페": "Coupe", "컨버터블": "Convertible",
  "어반": "Urban", "라인": "Line", "팩": "Pack",
  "플러스": "Plus", "프로": "Pro", "맥스": "Max",
  "시리즈": "Series",
  // City/Location names
  "서울": "Seoul", "경기": "Gyeonggi", "인천": "Incheon",
  "부산": "Busan", "대구": "Daegu", "대전": "Daejeon",
  "광주": "Gwangju", "울산": "Ulsan", "세종": "Sejong",
  "강원": "Gangwon", "충북": "Chungbuk", "충남": "Chungnam",
  "전북": "Jeonbuk", "전남": "Jeonnam", "경북": "Gyeongbuk",
  "경남": "Gyeongnam", "제주": "Jeju",
};

// Strip any remaining Korean characters as a final fallback
function stripKorean(text: string): string {
  return text.replace(/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]+/g, "").replace(/\s+/g, " ").trim();
}

export function translateModel(model: string): string {
  // Check exact match first
  if (MODEL_TRANSLATIONS[model]) return MODEL_TRANSLATIONS[model];

  // Try to find the best matching translation
  let translated = model;
  // Sort by length descending to replace longer phrases first
  const sortedKeys = Object.keys(MODEL_TRANSLATIONS).sort((a, b) => b.length - a.length);
  for (const korean of sortedKeys) {
    if (translated.includes(korean)) {
      translated = translated.replace(korean, MODEL_TRANSLATIONS[korean]);
    }
  }

  // Replace remaining Korean words
  const sortedWords = Object.keys(KOREAN_WORD_MAP).sort((a, b) => b.length - a.length);
  for (const word of sortedWords) {
    if (translated.includes(word)) {
      translated = translated.replaceAll(word, KOREAN_WORD_MAP[word]);
    }
  }

  // Strip any remaining Korean characters
  return stripKorean(translated);
}

export function translateBadge(badge: string): string {
  let translated = badge;

  // Replace Korean words with English, longest first
  const sortedWords = Object.keys(KOREAN_WORD_MAP).sort((a, b) => b.length - a.length);
  for (const word of sortedWords) {
    if (translated.includes(word)) {
      translated = translated.replaceAll(word, KOREAN_WORD_MAP[word]);
    }
  }

  // Strip any remaining Korean characters
  return stripKorean(translated);
}

// Translate any Korean text - combines all translation maps
export function translateKorean(text: string): string {
  if (!text) return text;

  // Check if text contains Korean characters
  if (!/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/.test(text)) {
    return text; // No Korean characters, return as is
  }

  let translated = text;

  // Try model translations first (exact)
  if (MODEL_TRANSLATIONS[translated]) return MODEL_TRANSLATIONS[translated];

  // Try manufacturer translations
  const mfr = translateManufacturer(translated);
  if (mfr !== translated) return mfr;

  // Apply model translations (partial)
  const sortedModels = Object.keys(MODEL_TRANSLATIONS).sort((a, b) => b.length - a.length);
  for (const korean of sortedModels) {
    if (translated.includes(korean)) {
      translated = translated.replace(korean, MODEL_TRANSLATIONS[korean]);
    }
  }

  // Apply word-level translations
  const sortedWords = Object.keys(KOREAN_WORD_MAP).sort((a, b) => b.length - a.length);
  for (const word of sortedWords) {
    if (translated.includes(word)) {
      translated = translated.replaceAll(word, KOREAN_WORD_MAP[word]);
    }
  }

  // Strip any remaining Korean characters
  return stripKorean(translated);
}

export function buildSearchQuery(filters: {
  manufacturer?: string;
  fuelType?: string;
  minPrice?: number;
  maxPrice?: number;
  minYear?: number;
  maxYear?: number;
  maxMileage?: number;
}): string {
  let conditions = ["Hidden.N"];

  if (filters.manufacturer) {
    conditions.push(`Manufacturer.${filters.manufacturer}`);
  }
  if (filters.fuelType) {
    conditions.push(`FuelType.${filters.fuelType}`);
  }
  if (filters.minPrice || filters.maxPrice) {
    const min = filters.minPrice || "";
    const max = filters.maxPrice || "";
    conditions.push(`Price.range(${min}..${max})`);
  }
  if (filters.minYear || filters.maxYear) {
    const min = filters.minYear ? `${filters.minYear}00` : "";
    const max = filters.maxYear ? `${filters.maxYear}12` : "";
    conditions.push(`Year.range(${min}..${max})`);
  }
  if (filters.maxMileage) {
    conditions.push(`Mileage.range(..${filters.maxMileage})`);
  }

  return `(And.${conditions.join("._.")}.)`;
}
