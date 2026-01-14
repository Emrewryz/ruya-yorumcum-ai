// utils/moon.ts

export type MoonPhase = {
  date?: string; // Hangi gün olduğu (Gelecek günler için)
  phase: string;
  icon: string;
  description: string;
  dreamEffect: string; 
  percentage: number; 
  age: number; 
};

// Tek bir günün ayını hesaplar
export const getMoonPhase = (date: Date = new Date()): MoonPhase => {
  let year = date.getFullYear();
  let month = date.getMonth() + 1;
  let day = date.getDate();

  if (month < 3) {
    year--;
    month += 12;
  }

  ++month;
  
  // Astronomik Jülyen Günü Hesabı
  let c = 365.25 * year;
  let e = 30.6 * month;
  let jd = c + e + day - 694039.09; 
  jd /= 29.5305882; 
  let b = parseInt(jd.toString()); 
  jd -= b; 
  b = Math.round(jd * 8); 

  if (b >= 8) b = 0; 

  // Mistik ve Detaylı Açıklamalar
  switch (b) {
    case 0:
      return {
        phase: "Yeni Ay",
        icon: "🌑",
        description: "Gökyüzü karanlık, zihin berrak. Geçmişi geride bırakıp yeni niyet tohumları ekmenin tam zamanı. Evren fısıltılarını dinle.",
        dreamEffect: "Bilinçaltının en derin, karanlık ve gizemli mesajları yüzeye çıkar. Rüyalar sembolik ve şifrelidir.",
        percentage: 0,
        age: 1
      };
    case 1:
      return {
        phase: "Yeni Hilal",
        icon: "🌒",
        description: "Ufukta beliren ince ışık, umudun habercisidir. Başladığın işlerde ilk adımı atma ve cesaret bulma enerjisi taşırsın.",
        dreamEffect: "Geleceğe dair planlar ve ilham verici fikirler rüyalarına misafir olur.",
        percentage: 25,
        age: 4
      };
    case 2:
      return {
        phase: "İlk Dördün",
        icon: "🌓",
        description: "Işık ve gölge dengede. Karşına çıkan engelleri aşmak için iradeni ortaya koyman gereken eylem zamanı.",
        dreamEffect: "Çatışmalı, aksiyon dolu, kaçma-kovalama içeren rüyalar görülebilir.",
        percentage: 50,
        age: 7
      };
    case 3:
      return {
        phase: "Büyüyen Ay",
        icon: "🌔",
        description: "Dolunaya giden yolda son viraj. Enerjin yükseliyor, olaylar netleşiyor. Hasat öncesi son hazırlıkları yap.",
        dreamEffect: "Rüyalar çok detaylı, renkli ve hikaye kurgusu karmaşık olabilir.",
        percentage: 75,
        age: 11
      };
    case 4:
      return {
        phase: "Dolunay",
        icon: "🌕",
        description: "Enerjinin zirve noktası! Gizli kalan her şey aydınlanır. Duygular şelale gibidir, mantık geri planda kalır. Dönüşüm kaçınılmazdır.",
        dreamEffect: "Aşırı canlı, gerçekçi, bazen uykusuzluk yapan veya uyanınca bile etkisinden çıkamadığın rüyalar.",
        percentage: 100,
        age: 15
      };
    case 5:
      return {
        phase: "Küçülen Ay",
        icon: "🌖",
        description: "Işık azalmaya başlarken paylaşma ve şükretme zamanı. Fazlalıklardan arın, öğrendiklerini başkalarına aktar.",
        dreamEffect: "Bilge figürlerin, öğretmenlerin veya rehberlerin görüldüğü öğretici rüyalar.",
        percentage: 75,
        age: 19
      };
    case 6:
      return {
        phase: "Son Dördün",
        icon: "🌗",
        description: "Veda zamanı. Seni aşağı çeken alışkanlıkları, insanları veya düşünceleri serbest bırak. Affet ve hafifle.",
        dreamEffect: "Geçmiş hesaplaşmalar, eski arkadaşlar veya çocukluk evinin görüldüğü nostaljik rüyalar.",
        percentage: 50,
        age: 22
      };
    case 7:
      return {
        phase: "Son Hilal",
        icon: "🌘",
        description: "Döngü tamamlanıyor. İçe dönme, dinlenme ve ruhsal pillerini şarj etme vakti. Sessizliğin tadını çıkar.",
        dreamEffect: "Durgun, huzurlu, şifalı ve ruhsal onarım sağlayan sakin rüyalar.",
        percentage: 25,
        age: 26
      };
    default:
      return {
        phase: "Dolunay",
        icon: "🌕",
        description: "Enerji yüksek.",
        dreamEffect: "Canlı rüyalar.",
        percentage: 100,
        age: 15
      };
  }
};

// Gelecek günleri hesaplayan yeni fonksiyon
export const getNextDaysPhases = (daysCount: number = 14): MoonPhase[] => {
  const phases: MoonPhase[] = [];
  
  for (let i = 1; i <= daysCount; i++) {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + i); // Her döngüde 1 gün ekle
    
    const phaseData = getMoonPhase(futureDate);
    
    // Tarihi formatla (örn: 14 Ocak Çarşamba)
    const formattedDate = futureDate.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', weekday: 'long' });
    
    phases.push({ ...phaseData, date: formattedDate });
  }
  
  return phases;
};