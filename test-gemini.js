// test-gemini.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// BURAYA YENİ ALDIĞIN ANAHTARI YAPIŞTIR
const apiKey = "AIzaSyAiRMdIsPyV8VyR7X3iwyh_MVEBac2q9_g"; 

const genAI = new GoogleGenerativeAI(apiKey);

async function run() {
  try {
    console.log("1. Bağlantı deneniyor...");
const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    console.log("2. Mesaj gönderiliyor...");
    const result = await model.generateContent("Bana sadece 'Merhaba Dünya' yaz.");
    const response = await result.response;
    const text = response.text();
    
    console.log("3. BAŞARILI! Cevap:", text);
  } catch (error) {
    console.error("!!! HATA OLUŞTU !!!");
    console.error(error.message);
  }
}

run();