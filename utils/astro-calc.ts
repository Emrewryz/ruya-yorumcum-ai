import * as Astronomy from 'astronomy-engine';

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

// Yardımcı Fonksiyon: Dereceyi Burca Çevir
function getSignFromLongitude(longitude: number) {
  let normalized = longitude % 360;
  if (normalized < 0) normalized += 360;
  const index = Math.floor(normalized / 30);
  return ZODIAC_SIGNS[index];
}

// Yardımcı Fonksiyon: Gezegen Pozisyonu Hesapla
function getPlanetPosition(body: string, date: Date) {
  try {
    // Kütüphane string olarak gezegen isimlerini ("Sun", "Moon" vb.) kabul eder.
    // TypeScript uyarısını aşmak için 'as any' kullanıyoruz.
    const vec = Astronomy.GeoVector(body as any, date, true);
    
    if (!vec) return "Bilinmiyor";
    
    const ecliptic = Astronomy.Ecliptic(vec);
    return getSignFromLongitude(ecliptic.elon);
  } catch (e) {
    console.error(`${body} hesaplama hatası:`, e);
    return "Bilinmiyor";
  }
}

// --- MOBİL ÇÖKME SORUNUNU ÇÖZEN YÜKSELEN HESABI (DÜZELTİLDİ) ---
function calculateAscendant(date: Date, lat: number, lng: number): string {
  try {
      // DÜZELTME: Astronomy.Time sınıfı yerine direkt Date objesi kullanıyoruz.
      // Astronomy.SiderealTime doğrudan JS Date objesini kabul eder.
      
      // 1. Greenwich Mean Sidereal Time (Saat cinsinden)
      const gmst = Astronomy.SiderealTime(date);
      
      // 2. Local Sidereal Time (LST) Hesabı (Dereceye çeviriyoruz)
      // GMST (saat) + Boylam/15 = LST (saat) -> * 15 = Derece
      const lst = (gmst + lng / 15.0) * 15.0; 
      
      // 3. Radyana çevirim
      const ramc = lst * (Math.PI / 180);
      const eps = 23.4392911 * (Math.PI / 180); // Ecliptic obliquity (Yaklaşık sabit)
      const phi = lat * (Math.PI / 180); // Enlem

      // 4. Yükselen Formülü (Ascendant)
      // Asc = atan2(cos(RAMC), -sin(RAMC)*cos(eps) - tan(phi)*sin(eps))
      const num = Math.cos(ramc);
      const den = -Math.sin(ramc) * Math.cos(eps) - Math.tan(phi) * Math.sin(eps);
      
      let asc = Math.atan2(num, den) * (180 / Math.PI);
      
      return getSignFromLongitude(asc);
  } catch (e) {
      console.error("Yükselen hesaplanamadı:", e);
      // Hata olursa varsayılan dön (Uygulama çökmesin)
      return "Koç"; 
  }
}

// --- ANA FONKSİYON: NATAL HARİTA ---
export function calculateNatalChart(date: Date, lat: number, lng: number): NatalChartOutput {
  // Tarih kontrolü
  if (!date || isNaN(date.getTime())) {
      console.error("Geçersiz tarih:", date);
      throw new Error("Geçersiz tarih formatı.");
  }

  const chart: any = {};
  
  PLANETS.forEach(planet => {
    chart[planet.toLowerCase()] = getPlanetPosition(planet, date);
  });

  chart.ascendant = calculateAscendant(date, lat, lng);
  
  return chart as NatalChartOutput;
}

// --- ANA FONKSİYON: TRANSİT HARİTA ---
export function calculateTransitChart(date: Date = new Date()): TransitChartOutput {
  if (isNaN(date.getTime())) throw new Error("Geçersiz tarih.");
  
  const transits: any = {};
  
  ["Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn"].forEach(planet => {
    transits[`transit_${planet.toLowerCase()}`] = getPlanetPosition(planet, date);
  });
  
  return transits as TransitChartOutput;
}