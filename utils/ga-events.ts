// ─────────────────────────────────────────────────────────────────────────────
// GA4 Custom Event Örnekleri
// Bu kodu mevcut component'larınıza entegre edin
// ─────────────────────────────────────────────────────────────────────────────

"use client";

import { sendGAEvent } from "@next/third-parties/google";

// ─── 1. Rüya Analizi Başlatma ────────────────────────────────────────────────
// HomeClient.tsx içindeki handleAnalyze fonksiyonuna ekleyin

export function trackDreamAnalysis(dreamLength: number) {
  sendGAEvent("event", "dream_analysis_started", {
    category:    "analysis",
    label:       "dream_analysis",
    text_length: dreamLength,
  });
}

// ─── 2. Kredi Harcama (PaywallCard) ─────────────────────────────────────────
// PaywallCard.tsx içindeki doUnlock fonksiyonuna ekleyin

export function trackCreditSpend(target: "islami" | "psikolojik" | "ikisi") {
  sendGAEvent("event", "credit_spent", {
    category:      "monetization",
    label:         target,
    analysis_type: target,
  });
}

// ─── 3. Kredi Satın Alma Tıklaması ───────────────────────────────────────────
// CreditModal.tsx içindeki Shopier linklerine ekleyin

export function trackPurchaseClick(packageName: string, price: number) {
  sendGAEvent("event", "purchase_intent", {
    category:     "monetization",
    label:        packageName,
    value:        price,
    currency:     "TRY",
  });
}

// ─── 4. Haftalık Analiz ──────────────────────────────────────────────────────
// oruntu-analizi/page.tsx handleAnalyze fonksiyonuna ekleyin

export function trackWeeklyAnalysis(dreamCount: number) {
  sendGAEvent("event", "weekly_analysis_started", {
    category:    "analysis",
    label:       "weekly_oruntu",
    dream_count: dreamCount,
  });
}

// ─── Kullanım Örneği ─────────────────────────────────────────────────────────
//
// HomeClient.tsx içinde:
//
// import { trackDreamAnalysis } from "@/utils/ga-events";
//
// async function handleAnalyze() {
//   trackDreamAnalysis(dreamText.length); // ← buraya ekle
//   const res = await analyzeDream(dreamText);
//   ...
// }
//
// PaywallCard.tsx içinde:
//
// import { trackCreditSpend } from "@/utils/ga-events";
//
// async function doUnlock(target: "islami" | "psikolojik") {
//   trackCreditSpend(target); // ← buraya ekle
//   const result = await spendAnalysisCredit(dreamId);
//   ...
// }
//
// CreditModal.tsx içinde Shopier linkine:
//
// <a
//   href={pkg.href}
//   target="_blank"
//   onClick={() => trackPurchaseClick(pkg.name, pkg.price)}
// >