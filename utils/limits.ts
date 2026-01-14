// utils/limits.ts

export const TIER_LIMITS = {
  free: {
    dream_analysis: 1, // Günde 1 Rüya
    tarot_reading: 0,  // Tarot Yok
    image_generation: 0, // Görsel Yok
    chat: 0,
  },
  pro: { // Kaşif
    dream_analysis: 5, // Günde 5 Rüya
    tarot_reading: 1,  // HAFTADA 1 Tarot (Özel kontrol gerekir)
    image_generation: 1,
    chat: 0,
  },
  elite: { // Kahin
    dream_analysis: 100, // Sınırsız (teknik olarak 100 diyelim)
    tarot_reading: 5,    // GÜNDE 1 Tarot
    image_generation: 5,
    chat: 100,
  }
};