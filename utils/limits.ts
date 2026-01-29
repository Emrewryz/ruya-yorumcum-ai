// utils/limits.ts

export type Tier = 'free' | 'pro' | 'elite';

// 'numerology' buraya eklendi
export type Feature = 'dream_analysis' | 'tarot_reading' | 'image_generation' | 'chat' | 'numerology';

interface LimitConfig {
  daily_limit: number;
  reset_type: 'daily' | 'weekly';
  included: boolean;
}

export const TIER_LIMITS: Record<Tier, Record<Feature, LimitConfig>> = {
  free: {
    dream_analysis: { daily_limit: 1, reset_type: 'daily', included: true },
    tarot_reading: { daily_limit: 0, reset_type: 'daily', included: false }, 
    image_generation: { daily_limit: 0, reset_type: 'daily', included: false },
    chat: { daily_limit: 0, reset_type: 'daily', included: false },
    numerology: { daily_limit: 0, reset_type: 'daily', included: false }, // Free'de kapalı
  },
  pro: {
    dream_analysis: { daily_limit: 3, reset_type: 'daily', included: true },
    tarot_reading: { daily_limit: 3, reset_type: 'daily', included: true },
    image_generation: { daily_limit: 1, reset_type: 'daily', included: true },
    chat: { daily_limit: 0, reset_type: 'daily', included: false },
    numerology: { daily_limit: 5, reset_type: 'daily', included: true }, // Günde 5 hak
  },
  elite: {
    dream_analysis: { daily_limit: 999, reset_type: 'daily', included: true },
    tarot_reading: { daily_limit: 10, reset_type: 'daily', included: true },
    image_generation: { daily_limit: 10, reset_type: 'daily', included: true },
    chat: { daily_limit: 999, reset_type: 'daily', included: true },
    numerology: { daily_limit: 999, reset_type: 'daily', included: true }, // Sınırsız
  }
};