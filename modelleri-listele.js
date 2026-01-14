// modelleri-listele.js

// BURAYA AZ ÖNCEKİ ÇALIŞAN API ANAHTARINI YAPIŞTIR
const apiKey = "AIzaSyAiRMdIsPyV8VyR7X3iwyh_MVEBac2q9_g"; 

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

async function listModels() {
  try {
    console.log("Modeller aranıyor...");
    // Node.js 18+ (Next.js 14 kullandığın için sende var) fetch destekler.
    const response = await fetch(url);
    const data = await response.json();
    
    if (data.models) {
      console.log("\n--- KULLANABİLECEĞİN MODELLER ---");
      data.models.forEach(model => {
        // Sadece içerik üretebilen modelleri filtreleyelim
        if (model.supportedGenerationMethods.includes("generateContent")) {
           console.log(`İsim: ${model.name}`); // Örn: models/gemini-1.5-flash
        }
      });
      console.log("---------------------------------\n");
    } else {
      console.log("Hata:", data);
    }
  } catch (error) {
    console.error("Bağlantı hatası:", error);
  }
}

listModels();