// utils/numerology-calc.ts

// Pisagor Harf Tablosu
const LETTER_VALUES: Record<string, number> = {
  a: 1, j: 1, s: 1, 
  b: 2, k: 2, t: 2, 
  c: 3, l: 3, u: 3, 
  d: 4, m: 4, v: 4, 
  e: 5, n: 5, w: 5, 
  f: 6, o: 6, x: 6, 
  g: 7, p: 7, y: 7, 
  h: 8, q: 8, z: 8,
  ç: 3, ğ: 7, ı: 9, i: 9, ö: 6, ş: 1, ü: 3 // Türkçe karakter desteği
};

// Sayıyı tek haneye düşürme fonksiyonu (Örn: 1990 -> 28 -> 10 -> 1)
// Master Sayılar (11, 22, 33) düşürülmez.
function reduceNumber(num: number): number {
  if (num === 11 || num === 22 || num === 33) return num;
  if (num < 10) return num;
  
  const sum = num.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
  return reduceNumber(sum);
}

export function calculateNumerologyProfile(fullName: string, birthDate: string) {
  // 1. YAŞAM YOLU (Life Path) - Doğum Tarihinden
  // Format: YYYY-MM-DD
  const dateParts = birthDate.split('-').join(''); // 19900101
  let lifePathSum = 0;
  for (let char of dateParts) {
    lifePathSum += parseInt(char);
  }
  const lifePath = reduceNumber(lifePathSum);

  // 2. KADER SAYISI (Expression/Destiny) - İsimden
  const cleanName = fullName.toLowerCase().replace(/[^a-zxzçğışüö]/g, '');
  let destinySum = 0;
  for (let char of cleanName) {
    destinySum += LETTER_VALUES[char] || 0;
  }
  const destiny = reduceNumber(destinySum);

  return { lifePath, destiny };
}