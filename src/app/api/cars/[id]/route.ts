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

  // Fetch detailed info by scraping the detail page's __PRELOADED_STATE__
  let detail = null;
  let debugInfo: any = {};
  try {
    const pageRes = await fetch(
      `https://fem.encar.com/cars/detail/${carId}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7",
        },
        next: { revalidate: 300 },
      }
    );
    debugInfo.status = pageRes.status;
    debugInfo.contentType = pageRes.headers.get("content-type");
    if (pageRes.ok) {
      const html = await pageRes.text();
      debugInfo.htmlLength = html.length;
      debugInfo.hasPreloaded = html.includes('__PRELOADED_STATE__');
      debugInfo.htmlSnippet = html.substring(0, 300);

      const stateStart = html.indexOf('__PRELOADED_STATE__');
      debugInfo.stateStart = stateStart;
      if (stateStart !== -1) {
        // Get context around the match
        debugInfo.context = html.substring(stateStart, stateStart + 100);
        const eqSign = html.indexOf('=', stateStart);
        if (eqSign !== -1) {
          const jsonStart = html.indexOf('{', eqSign);
          debugInfo.jsonStart_pos = jsonStart;
          if (jsonStart !== -1) {
            const scriptEnd = html.indexOf('</script>', jsonStart);
            debugInfo.scriptEnd_pos = scriptEnd;
            if (scriptEnd !== -1) {
              let jsonStr = html.substring(jsonStart, scriptEnd).trim();
              if (jsonStr.endsWith(';')) jsonStr = jsonStr.slice(0, -1);
              debugInfo.jsonLength = jsonStr.length;
              debugInfo.jsonPreview = jsonStr.substring(0, 200);
              debugInfo.jsonEnd = jsonStr.substring(jsonStr.length - 50);
              try {
                detail = JSON.parse(jsonStr);
              } catch (e: any) {
                debugInfo.parseError = e.message;
              }
            }
          }
        }
      }
    }
  } catch (e: any) {
    debugInfo.fetchError = e.message;
  }

  return NextResponse.json({ car, detail, debugInfo });
}
