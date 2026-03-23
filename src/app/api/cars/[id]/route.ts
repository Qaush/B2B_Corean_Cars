import { NextRequest, NextResponse } from "next/server";

const ENDPOINTS = [
  "https://api.encar.com/search/car/list/premium",
  "https://api.encar.com/search/car/list/general",
];

const HEADERS = {
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
  Accept: "application/json",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const carId = params.id;

  // Try both endpoints to find the car
  let car = null;
  for (const endpoint of ENDPOINTS) {
    const q = `(And.Hidden.N._.CarId.${carId}.)`;
    const url = `${endpoint}?count=true&q=${encodeURIComponent(q)}&sr=${encodeURIComponent("|ModifiedDate|0|1")}`;

    try {
      const res = await fetch(url, { headers: HEADERS, next: { revalidate: 300 } });
      if (res.ok) {
        const data = await res.json();
        if (data.SearchResults && data.SearchResults.length > 0) {
          car = data.SearchResults[0];
          break;
        }
      }
    } catch {}
  }

  if (!car) {
    return NextResponse.json({ error: "Car not found" }, { status: 404 });
  }

  // Fetch all data in parallel: detail page + accident + inspection + diagnosis
  const [detailResult, accidentResult, inspectionResult, diagnosisResult] = await Promise.allSettled([
    // Detail page scrape
    fetch(`https://fem.encar.com/cars/detail/${carId}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      next: { revalidate: 300 },
    }),
    // Accident/Insurance summary
    fetch(`https://api.encar.com/v1/readside/record/vehicle/${carId}/summary`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    }),
    // Inspection summary
    fetch(`https://api.encar.com/v1/readside/inspection/vehicle/${carId}/summary`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    }),
    // Diagnosis
    fetch(`https://api.encar.com/v1/readside/diagnosis/vehicle/${carId}`, {
      headers: HEADERS,
      next: { revalidate: 300 },
    }),
  ]);

  // Parse detail page
  let detail = null;
  let debugInfo: any = {};
  if (detailResult.status === "fulfilled") {
    const pageRes = detailResult.value;
    debugInfo.status = pageRes.status;
    if (pageRes.ok) {
      try {
        const html = await pageRes.text();
        const stateStart = html.indexOf('__PRELOADED_STATE__');
        if (stateStart !== -1) {
          const eqSign = html.indexOf('=', stateStart);
          if (eqSign !== -1) {
            const jsonStart = html.indexOf('{', eqSign);
            if (jsonStart !== -1) {
              const scriptEnd = html.indexOf('</script>', jsonStart);
              if (scriptEnd !== -1) {
                let jsonStr = html.substring(jsonStart, scriptEnd).trim();
                if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
                detail = JSON.parse(jsonStr);
              }
            }
          }
        }
      } catch (e: any) {
        debugInfo.parseError = e.message;
      }
    }
  }

  // Parse accident summary
  let accidentSummary = null;
  if (accidentResult.status === "fulfilled" && accidentResult.value.ok) {
    try { accidentSummary = await accidentResult.value.json(); } catch {}
  }

  // Parse inspection summary
  let inspectionSummary = null;
  if (inspectionResult.status === "fulfilled" && inspectionResult.value.ok) {
    try { inspectionSummary = await inspectionResult.value.json(); } catch {}
  }

  // Parse diagnosis
  let diagnosis = null;
  if (diagnosisResult.status === "fulfilled" && diagnosisResult.value.ok) {
    try { diagnosis = await diagnosisResult.value.json(); } catch {}
  }

  // For DUPLICATION cars, report APIs may 404 with the listing ID.
  // Try to find the original car ID from photo paths and retry.
  if (!accidentSummary || !inspectionSummary || !diagnosis) {
    const photos = detail?.cars?.base?.photos || [];
    const photoPath = photos[0]?.path || "";
    const origMatch = photoPath.match(/\/pic\d+\/(\d+)_/);
    const origId = origMatch?.[1];
    if (origId && origId !== carId) {
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

  return NextResponse.json({ car, detail, accidentSummary, inspectionSummary, diagnosis, debugInfo });
}
