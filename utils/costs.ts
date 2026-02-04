// utils/costs.ts

export type ServiceType = 
  | 'dream_analysis' 
  | 'tarot_reading' 
  | 'image_generation' 
  | 'chat_message' 
  | 'numerology'
  | 'astrology_chart'   // Natal Harita (Pahalı)
  | 'daily_horoscope';  // Günlük Burç (Ucuz)

export const SERVICE_COSTS: Record<ServiceType, number> = {
  dream_analysis: 1,
  tarot_reading: 2,
  image_generation: 3,
  chat_message: 1,
  numerology: 2,
  astrology_chart: 5,     // Detaylı analiz olduğu için 5 kredi
  daily_horoscope: 1      // Günlük motivasyon olduğu için 1 kredi
};

export const getServiceCost = (service: ServiceType) => SERVICE_COSTS[service];