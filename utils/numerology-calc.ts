// utils/numerology-calc.ts

// Pisagor Numeroloji Sistemi Harf Değerleri (Türkçe Karakter Destekli)
const LETTER_VALUES: Record<string, number> = {
  // 1 Grubu
  a: 1, j: 1, s: 1, ş: 1,
  // 2 Grubu
  b: 2, k: 2, t: 2,
  // 3 Grubu
  c: 3, ç: 3, l: 3, u: 3, ü: 3,
  // 4 Grubu
  d: 4, m: 4, v: 4,
  // 5 Grubu
  e: 5, n: 5, w: 5,
  // 6 Grubu
  f: 6, o: 6, ö: 6, x: 6,
  // 7 Grubu
  g: 7, ğ: 7, p: 7, y: 7,
  // 8 Grubu
  h: 8, q: 8, z: 8,
  // 9 Grubu
  i: 9, ı: 9, r: 9
};

/**
 * Sayıyı numerolojik olarak tek haneye düşürür.
 * Kural: Master Sayılar (11, 22, 33) indirgenmez, olduğu gibi döner.
 * Diğer sayılar toplanarak tek haneye inene kadar işlem devam eder.
 */
function reduceNumber(num: number): number {
  // Master Sayılar kontrolü
  if (num === 11 || num === 22 || num === 33) return num;
  
  // Tek hane kontrolü (0-9 arası)
  if (num < 10) return num;
  
  // Rakamları topla
  const sum = num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  
  // Rekürsif olarak tekrar kontrol et (Örn: 99 -> 18 -> 9)
  return reduceNumber(sum);
}

/**
 * İsim ve Doğum Tarihine göre Numeroloji Profilini hesaplar.
 * @param fullName Kullanıcının tam adı
 * @param birthDate Kullanıcının doğum tarihi (YYYY-MM-DD formatında string)
 */
export function calculateNumerologyProfile(fullName: string, birthDate: string) {
  // 1. YAŞAM YOLU (Life Path) - Doğum Tarihinden
  // input: "1990-05-25" -> "19900525" (Tireleri ve diğer karakterleri temizle)
  const cleanDate = birthDate.replace(/\D/g, ''); 
  
  let lifePathSum = 0;
  for (const char of cleanDate) {
    lifePathSum += parseInt(char);
  }
  const lifePath = reduceNumber(lifePathSum);

  // 2. KADER SAYISI (Expression/Destiny) - İsimden
  // Türkçe locale ile küçük harfe çevir ve harf olmayan her şeyi temizle
  const cleanName = fullName.toLocaleLowerCase('tr').replace(/[^a-zçğışüöı]/g, '');
  
  let destinySum = 0;
  for (const char of cleanName) {
    // Harf tablosunda varsa değerini ekle, yoksa 0 (Güvenlik)
    destinySum += LETTER_VALUES[char] || 0;
  }
  const destiny = reduceNumber(destinySum);

  return { lifePath, destiny };
}