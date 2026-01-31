// utils/limits.ts

export type Tier = 'free' | 'pro' | 'elite';



// 'astrology' özelliğini ekledik
export type Feature = 'dream_analysis' | 'tarot_reading' | 'image_generation' | 'chat' | 'numerology' | 'astrology'| 'daily_horoscope';

interface LimitConfig {
  daily_limit: number;
  reset_type: 'daily' | 'weekly';
  included: boolean;
}

export const TIER_LIMITS: Record<Tier, Record<Feature, LimitConfig>> = {
  free: {
    daily_horoscope: { daily_limit: 1, reset_type: 'daily', included: true },
    dream_analysis: { daily_limit: 1, reset_type: 'daily', included: true },
    tarot_reading: { daily_limit: 0, reset_type: 'daily', included: false },
    image_generation: { daily_limit: 0, reset_type: 'daily', included: false },
    chat: { daily_limit: 0, reset_type: 'daily', included: false },
    numerology: { daily_limit: 0, reset_type: 'daily', included: false },
    // Free kullanıcı doğum haritası analizi yapamaz, sadece hesaplanmış veriyi görür.
    astrology: { daily_limit: 0, reset_type: 'daily', included: false }, 
  },
  pro: {
    daily_horoscope: { daily_limit: 1, reset_type: 'daily', included: true },
    dream_analysis: { daily_limit: 3, reset_type: 'daily', included: true },
    tarot_reading: { daily_limit: 3, reset_type: 'daily', included: true },
    image_generation: { daily_limit: 1, reset_type: 'daily', included: true },
    chat: { daily_limit: 0, reset_type: 'daily', included: false },
    numerology: { daily_limit: 5, reset_type: 'daily', included: true },
    // Pro kullanıcı günde 1 kez detaylı AI yorumu alabilir
    astrology: { daily_limit: 1, reset_type: 'daily', included: true }, 
  },
  elite: {
    daily_horoscope: { daily_limit: 1, reset_type: 'daily', included: true },
    dream_analysis: { daily_limit: 999, reset_type: 'daily', included: true },
    tarot_reading: { daily_limit: 10, reset_type: 'daily', included: true },
    image_generation: { daily_limit: 10, reset_type: 'daily', included: true },
    chat: { daily_limit: 999, reset_type: 'daily', included: true },
    numerology: { daily_limit: 999, reset_type: 'daily', included: true },
    // Elite kullanıcı daha özgür
    astrology: { daily_limit: 3, reset_type: 'daily', included: true },
  }
};