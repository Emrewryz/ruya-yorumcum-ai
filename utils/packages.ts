// utils/packages.ts

export type CreditPackage = {
  id: 'starter' | 'explorer' | 'master';
  name: string;
  price: number;
  credits: number;
  description: string;
  popular?: boolean;
};

export const PACKAGES: CreditPackage[] = [
  {
    id: 'starter',
    name: 'Başlangıç Paketi',
    price: 39,
    credits: 5,
    description: 'Denemek isteyenler için ideal.',
  },
  {
    id: 'explorer',
    name: 'Keşif Paketi',
    price: 129,
    credits: 20,
    description: 'Düzenli analizler için en çok tercih edilen.',
    popular: true,
  },
  {
    id: 'master',
    name: 'Kahin Paketi',
    price: 249,
    credits: 50,
    description: 'Tüm mistik kapıları aralayan tam güç.',
  }
];

// Helper: Tutar'a göre kaç kredi verileceğini bulur (Webhook için)
export const getCreditsByAmount = (amount: number): number => {
  const paid = Number(amount);
  
  // Fiyat aralıklarına göre kredi belirleme (Kuruş farklarını tolere etmek için >= kullanıyoruz)
  if (paid >= 240) return 50; // 249 TL paketi
  if (paid >= 120) return 20; // 129 TL paketi
  if (paid >= 35) return 5;   // 39 TL paketi
  
  return 0; // Tanımsız tutar
};