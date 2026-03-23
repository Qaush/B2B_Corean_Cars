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
  // Volkswagen
  "티구안": "Tiguan", "골프": "Golf", "아테온": "Arteon", "제타": "Jetta",
  "파사트": "Passat", "투아렉": "Touareg", "비틀": "Beetle", "티록": "T-Roc",
  "시로코": "Scirocco", "폴로": "Polo", "페이톤": "Phaeton", "아틀라스": "Atlas",
  "기타": "Other", "업": "Up!", "리알타": "Rialta", "벤토": "Vento",
  "사란": "Sharan", "코라도": "Corrado", "트랜스포터": "Transporter",
  "마이크로버스": "Microbus", "멀티밴": "Multivan", "보라": "Bora",
  // Volvo
  "XC90": "XC90", "XC60": "XC60", "XC40": "XC40",
  "S90": "S90", "S60": "S60", "V90": "V90", "V60": "V60", "V40": "V40",
  "C40": "C40", "C30": "C30", "EX30": "EX30", "EX90": "EX90",
  // Audi
  "A3": "A3", "A4": "A4", "A5": "A5", "A6": "A6", "A7": "A7", "A8": "A8",
  "Q2": "Q2", "Q3": "Q3", "Q4": "Q4", "Q5": "Q5", "Q7": "Q7", "Q8": "Q8",
  "TT": "TT", "R8": "R8", "e-트론": "e-tron", "e-트론 GT": "e-tron GT",
  // Porsche
  "카이엔": "Cayenne", "마칸": "Macan", "파나메라": "Panamera",
  "타이칸": "Taycan", "박스터": "Boxster", "카이맨": "Cayman",
  // Land Rover
  "레인지로버": "Range Rover", "디스커버리": "Discovery", "디펜더": "Defender",
  "이보크": "Evoque", "벨라": "Velar", "프리랜더": "Freelander",
  "레인지로버 스포츠": "Range Rover Sport",
  // Jaguar
  "XE": "XE", "XF": "XF", "XJ": "XJ", "F-PACE": "F-PACE",
  "E-PACE": "E-PACE", "I-PACE": "I-PACE", "F-TYPE": "F-TYPE",
  // Ford
  "익스플로러": "Explorer", "머스탱": "Mustang", "브롱코": "Bronco",
  "이스케이프": "Escape", "엣지": "Edge", "토러스": "Taurus",
  "포커스": "Focus", "퓨전": "Fusion",
  // Jeep
  "그랜드체로키": "Grand Cherokee", "체로키": "Cherokee",
  "랭글러": "Wrangler", "컴패스": "Compass", "레니게이드": "Renegade",
  "글래디에이터": "Gladiator",
  // Tesla
  "모델3": "Model 3", "모델Y": "Model Y", "모델S": "Model S", "모델X": "Model X",
  // Toyota
  "캠리": "Camry", "라브4": "RAV4", "프리우스": "Prius", "하이랜더": "Highlander",
  "시에나": "Sienna", "수프라": "Supra", "크라운": "Crown",
  "랜드크루저": "Land Cruiser", "아발론": "Avalon",
  // Lexus
  "ES": "ES", "RX": "RX", "NX": "NX", "UX": "UX", "IS": "IS",
  "LS": "LS", "GX": "GX", "LX": "LX", "LC": "LC", "RC": "RC",
  // Honda
  "어코드": "Accord", "시빅": "Civic", "CR-V": "CR-V", "HR-V": "HR-V",
  "파일럿": "Pilot", "오딧세이": "Odyssey",
  // MINI
  "쿠퍼": "Cooper", "컨트리맨": "Countryman", "클럽맨": "Clubman",
  "페이스맨": "Paceman",
  // Peugeot
  "3008": "3008", "5008": "5008", "2008": "2008", "308": "308", "508": "508",
  // Lincoln
  "에비에이터": "Aviator", "노틸러스": "Nautilus", "커세어": "Corsair",
  "네비게이터": "Navigator", "컨티넨탈": "Continental", "MKZ": "MKZ",
  // Cadillac
  "에스컬레이드": "Escalade", "CT5": "CT5", "CT4": "CT4", "XT5": "XT5",
  "XT4": "XT4", "XT6": "XT6", "리릭": "LYRIQ",
  // Nissan
  "알티마": "Altima", "맥시마": "Maxima", "로그": "Rogue",
  "무라노": "Murano", "패스파인더": "Pathfinder",
  // Infiniti
  "Q50": "Q50", "Q60": "Q60", "QX50": "QX50", "QX60": "QX60", "QX80": "QX80",
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
  "투어링": "Touring",
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

// --- Inspection / Diagnosis translations ---

const DIAGNOSIS_PART_NAMES: Record<string, string> = {
  HOOD: "Kapaku",
  FRONT_FENDER_LEFT: "Krahori i perp. majtas",
  FRONT_FENDER_RIGHT: "Krahori i perp. djathtas",
  FRONT_DOOR_LEFT: "Dera e perp. majtas",
  FRONT_DOOR_RIGHT: "Dera e perp. djathtas",
  BACK_DOOR_LEFT: "Dera e pasme majtas",
  BACK_DOOR_RIGHT: "Dera e pasme djathtas",
  TRUNK_LID: "Kapaku i bagazhit",
  ROOF_PANEL: "Paneli i catise",
  QUARTER_PANEL_LEFT: "Paneli i pasem majtas",
  QUARTER_PANEL_RIGHT: "Paneli i pasem djathtas",
  SIDE_SILL_LEFT: "Pragu majtas",
  SIDE_SILL_RIGHT: "Pragu djathtas",
  FRONT_PANEL: "Paneli i perp.",
  CROSS_MEMBER: "Traversa",
  INSIDE_PANEL_LEFT: "Paneli i brendshem majtas",
  INSIDE_PANEL_RIGHT: "Paneli i brendshem djathtas",
  REAR_PANEL: "Paneli i pasem",
  TRUNK_FLOOR: "Dyshemeja e bagazhit",
  FRONT_SIDE_MEMBER_LEFT: "Shasia e perp. majtas",
  FRONT_SIDE_MEMBER_RIGHT: "Shasia e perp. djathtas",
  REAR_SIDE_MEMBER_LEFT: "Shasia e pasme majtas",
  REAR_SIDE_MEMBER_RIGHT: "Shasia e pasme djathtas",
  FRONT_WHEEL_HOUSE_LEFT: "Arku i rrotes perp. majtas",
  FRONT_WHEEL_HOUSE_RIGHT: "Arku i rrotes perp. djathtas",
  REAR_WHEEL_HOUSE_LEFT: "Arku i rrotes pasme majtas",
  REAR_WHEEL_HOUSE_RIGHT: "Arku i rrotes pasme djathtas",
  PILLAR_A_LEFT: "Shtylla A majtas",
  PILLAR_A_RIGHT: "Shtylla A djathtas",
  PILLAR_B_LEFT: "Shtylla B majtas",
  PILLAR_B_RIGHT: "Shtylla B djathtas",
  PILLAR_C_LEFT: "Shtylla C majtas",
  PILLAR_C_RIGHT: "Shtylla C djathtas",
  PACKAGE_TRAY: "Rafti i pasem",
  DASH_PANEL: "Paneli i instrumenteve",
  FLOOR_PANEL: "Dyshemeja",
  CHECKER_COMMENT: "Komenti i inspektorit",
  OUTER_PANEL_COMMENT: "Komenti per panelet e jashtme",
};

const DIAGNOSIS_RESULT_CODES: Record<string, { label: string; color: string }> = {
  NORMAL: { label: "Normal", color: "green" },
  REPLACEMENT: { label: "Nderruar", color: "red" },
  SHEET_METAL: { label: "Llamarine", color: "orange" },
  CORROSION: { label: "Korrozion", color: "yellow" },
  SCRATCH: { label: "Gervishje", color: "blue" },
  UNEVEN: { label: "Siperfaqe e pabarabarte", color: "purple" },
  DAMAGE: { label: "Demtim", color: "red" },
};

// Inspection outer part codes (from inspection summary)
const INSPECTION_PART_CODES: Record<string, string> = {
  P001: "Kapaku",
  P002: "Krahori i perp. majtas",
  P003: "Krahori i perp. djathtas",
  P004: "Dera e perp. majtas",
  P005: "Dera e perp. djathtas",
  P006: "Dera e pasme majtas",
  P007: "Dera e pasme djathtas",
  P008: "Paneli i pasem majtas",
  P009: "Paneli i pasem djathtas",
  P010: "Pragu majtas",
  P011: "Pragu djathtas",
  P012: "Kapaku i bagazhit",
  P013: "Paneli i catise",
  P031: "Dera e perp. majtas",
  P032: "Dera e perp. djathtas",
  P033: "Dera e pasme majtas",
  P034: "Dera e pasme djathtas",
};

const INSPECTION_STATUS_CODES: Record<string, { label: string; color: string; icon: string }> = {
  X: { label: "Nderruar", color: "red", icon: "X" },
  W: { label: "Llamarine/Saldim", color: "orange", icon: "W" },
  C: { label: "Korrozion", color: "yellow", icon: "C" },
  A: { label: "Gervishje", color: "blue", icon: "A" },
  U: { label: "Siperfaqe e pabarabarte", color: "purple", icon: "U" },
  T: { label: "Demtim", color: "red", icon: "T" },
};

export function translatePartName(name: string): string {
  return DIAGNOSIS_PART_NAMES[name] || name;
}

export function translateResultCode(code: string): { label: string; color: string } {
  return DIAGNOSIS_RESULT_CODES[code] || { label: code, color: "gray" };
}

export function translateInspectionPart(code: string): string {
  return INSPECTION_PART_CODES[code] || code;
}

export function translateInspectionStatus(code: string): { label: string; color: string; icon: string } {
  return INSPECTION_STATUS_CODES[code] || { label: code, color: "gray", icon: code };
}
