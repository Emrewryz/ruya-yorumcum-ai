import Astronomy from "astronomy-engine";

export const ZODIAC_SIGNS = [
  "Koç", "Boğa", "İkizler", "Yengeç", "Aslan", "Başak",
  "Terazi", "Akrep", "Yay", "Oğlak", "Kova", "Balık"
];

const PLANETS = [
  "Sun", "Moon", "Mercury", "Venus", "Mars", 
  "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"
];

// TypeScript Interface
export interface NatalChartOutput {
  sun: string;
  moon: string;
  mercury: string;
  venus: string;
  mars: string;
  jupiter: string;
  saturn: string;
  uranus: string;
  neptune: string;
  pluto: string;
  ascendant: string;
  [key: string]: string;
}

export interface TransitChartOutput {
  transit_sun: string;
  transit_moon: string;
  [key: string]: string;
}

function getSignFromLongitude(longitude: number) {
  let normalized = longitude % 360;
  if (normalized < 0) normalized += 360;
  const index = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[index];
}

function getPlanetPosition(body: string, date: Date) {
  try {
    // DÜZELTME 1: 'body as any' diyerek TypeScript'i susturuyoruz.
    // Kütüphane "Sun" | "Moon" bekliyor, biz string gönderiyoruz.
    const vec = Astronomy.GeoVector(body as any, date, true);
    
    if (!vec) return "Bilinmiyor";
    const ecliptic = Astronomy.Ecliptic(vec);
    return getSignFromLongitude(ecliptic.elon);
  } catch (e) {
    return "Bilinmiyor";
  }
}

function calculateAscendant(date: Date, lat: number, lng: number): string {
  try {
      // DÜZELTME 2: Astronomy.DayValue yerine Manuel Jülyen Tarihi (JD) Hesabı
      // Bu formül standart astronomi formülüdür.
      const jd = (date.getTime() / 86400000) + 2440587.5;
      
      const T = (jd - 2451545.0) / 36525.0;
      let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + T * T * (0.000387933 - T / 38710000.0);
      
      gmst = gmst % 360;
      if (gmst < 0) gmst += 360;

      let lst = gmst + lng;
      lst = lst % 360;
      if (lst < 0) lst += 360;

      const eps = 23.4392911; 
      const rad = Math.PI / 180;
      const lstRad = lst * rad;
      const epsRad = eps * rad;
      const latRad = lat * rad;

      const num = Math.cos(lstRad);
      const den = - (Math.sin(epsRad) * Math.tan(latRad) + Math.cos(epsRad) * Math.sin(lstRad));
      
      let asc = Math.atan2(num, den) / rad;
      asc = asc % 360;
      if (asc < 0) asc += 360;

      return getSignFromLongitude(asc);
  } catch (e) {
      console.error("Ascendant Error:", e);
      return "Bilinmiyor";
  }
}

// NATAL HARİTA
export function calculateNatalChart(date: Date, lat: number, lng: number): NatalChartOutput {
  if (isNaN(date.getTime())) throw new Error("Geçersiz tarih.");

  const chart: any = {};
  
  PLANETS.forEach(planet => {
    chart[planet.toLowerCase()] = getPlanetPosition(planet, date);
  });

  chart.ascendant = calculateAscendant(date, lat, lng);

  return chart as NatalChartOutput;
}

// TRANSIT HARİTA
export function calculateTransitChart(date: Date = new Date()): TransitChartOutput {
   if (isNaN(date.getTime())) throw new Error("Geçersiz tarih.");

  const transits: any = {};
  
  // Sadece önemli gezegenleri alalım performans için
  ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].forEach(planet => {
    transits[`transit_${planet.toLowerCase()}`] = getPlanetPosition(planet, date);
  });

  return transits as TransitChartOutput;
}