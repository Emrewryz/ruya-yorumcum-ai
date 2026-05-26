"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Loader2 } from "lucide-react";
import { savePersonalization, type PersonalizationData } from "@/app/actions/profile-actions";

// ─── Soru Verileri ────────────────────────────────────────────────────────────

const QUESTIONS = [
  {
    id: "yasam_evreni" as keyof PersonalizationData,
    title: "Şu anki yaşam evreninizi nasıl tanımlarsınız?",
    subtitle: "Analizlerinizi hayat döngünüze göre kişiselleştireceğiz.",
    options: [
      { value: "egitim", label: "Eğitim & Öğrencilik", desc: "Gelişim, sınav, kariyer kaygısı" },
      { value: "kariyer", label: "Kariyer & İş İnşası", desc: "Hedefler, başarı, rekabet" },
      { value: "aile", label: "Aile & İlişki Odaklı", desc: "Bağlar, sorumluluk, sevgi" },
      { value: "rölanti", label: "Kendi Halimde", desc: "Durgunluk, arayış, dinlenme" },
    ],
  },
  {
    id: "buyuk_degisim" as keyof PersonalizationData,
    title: "Son 6 ayda hayatınızda sarsıcı bir değişim yaşadınız mı?",
    subtitle: "Büyük geçişler, rüyaların dilini doğrudan etkiler.",
    options: [
      { value: "evet_radikal", label: "Evet, radikal bir değişim oldu", desc: "Yeni bir sayfa açıldı" },
      { value: "hayir_rutin", label: "Hayır, her şey rutin", desc: "Sakin ve öngörülebilir bir dönem" },
      { value: "bekliyor", label: "Yakında büyük bir değişiklik var", desc: "Eşikte hissediyorum" },
    ],
  },
  {
    id: "ruh_hali" as keyof PersonalizationData,
    title: "Şu anki genel ruh haliniz nasıl?",
    subtitle: "Duygusal durum, sembol yorumunu doğrudan biçimlendirir.",
    options: [
      { value: "huzurlu", label: "Huzurlu & Sakin", desc: "İç dinginlik, denge" },
      { value: "kaygilar", label: "Kaygılı & Stresli", desc: "Yoğun düşünceler, endişe" },
      { value: "yorgun", label: "Yorgun & Tükenmiş", desc: "Düşük enerji, bıkkınlık" },
      { value: "heyecanli", label: "Gelecek İçin Heyecanlı", desc: "Motivasyon, umut" },
    ],
  },
  {
    id: "zihin_mesgul" as keyof PersonalizationData,
    title: "Zihninizi şu sıralar en çok ne meşgul ediyor?",
    subtitle: "Bilinçaltının işlediği yük, rüyalarda sembollere dönüşür.",
    options: [
      { value: "gelecek_maddi", label: "Gelecek & Maddiyat", desc: "Para, güvence, planlama" },
      { value: "gecmis_baglar", label: "Geçmiş & Pişmanlıklar", desc: "Eski ilişkiler, kırgınlıklar" },
      { value: "kanıtlama", label: "Kendimi Kanıtlama", desc: "Başarı, onay alma isteği" },
      { value: "an", label: "Hiçbiri — Anı Yaşıyorum", desc: "Şimdi ve burada" },
    ],
  },
] as const;

// ─── Radio Card Bileşeni ──────────────────────────────────────────────────────

function RadioCard({
  option,
  selected,
  onSelect,
}: {
  option: { value: string; label: string; desc: string };
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`
        group relative w-full rounded-xl border px-4 py-3.5 text-left
        transition-all duration-150
        ${selected
          ? "border-zinc-900 bg-zinc-900 text-white shadow-sm"
          : "border-zinc-200 bg-white text-zinc-700 hover:border-zinc-400 hover:bg-zinc-50"
        }
      `}
    >
      {/* Seçim ikonu */}
      <div className={`
        absolute right-3.5 top-3.5 flex h-5 w-5 items-center justify-center rounded-full border transition-all
        ${selected
          ? "border-white bg-white"
          : "border-zinc-300 bg-transparent group-hover:border-zinc-400"
        }
      `}>
        {selected && <Check className="h-3 w-3 text-zinc-900" strokeWidth={2.5} />}
      </div>

      <p className={`pr-7 text-sm font-semibold ${selected ? "text-white" : "text-zinc-900"}`}>
        {option.label}
      </p>
      <p className={`mt-0.5 text-xs ${selected ? "text-white/65" : "text-zinc-400"}`}>
        {option.desc}
      </p>
    </button>
  );
}

// ─── Ana Bileşen ──────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<Partial<PersonalizationData>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAnswered = Object.keys(answers).filter(
    (k) => answers[k as keyof PersonalizationData]
  ).length;
  const progress = (totalAnswered / QUESTIONS.length) * 100;
  const allAnswered = totalAnswered === QUESTIONS.length;

  function handleSelect(questionId: keyof PersonalizationData, value: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  function handleSkip() {
    router.push("/");
  }

  function handleSubmit() {
    setSaving(true);
    setError(null);

    startTransition(async () => {
      const result = await savePersonalization(answers as PersonalizationData);
      if (result.success) {
        router.push("/");
      } else {
        setError(result.error);
        setSaving(false);
      }
    });
  }

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-0.5 bg-zinc-200">
        <div
          className="h-full bg-zinc-900 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Atla butonu */}
      <div className="fixed top-4 right-5 z-50">
        <button
          onClick={handleSkip}
          className="rounded-lg px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-200/60 hover:text-zinc-700 transition-colors"
        >
          Şimdilik Atla
        </button>
      </div>

      {/* İçerik */}
      <div className="mx-auto max-w-lg px-5 pb-24 pt-14">

        {/* Başlık */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Kişisel Rüya Profili
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Daha derin bir analiz için
            <br />
            sizi tanımamıza izin verin.
          </h1>
          <p className="mt-2.5 text-sm text-zinc-400">
            Yanıtlarınız yalnızca rüya analizlerinizi kişiselleştirmek için kullanılır.
          </p>
        </div>

        {/* Sorular */}
        <div className="space-y-10">
          {QUESTIONS.map((q, qi) => (
            <div key={q.id}>
              {/* Soru başlığı */}
              <div className="mb-4">
                <div className="mb-1 flex items-center gap-2">
                  <span className="text-xs font-bold tabular-nums text-zinc-300">
                    {String(qi + 1).padStart(2, "0")}
                  </span>
                  <div className="h-px flex-1 bg-zinc-200" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900">{q.title}</h2>
                <p className="mt-0.5 text-sm text-zinc-400">{q.subtitle}</p>
              </div>

              {/* Seçenekler */}
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {q.options.map((opt) => (
                  <RadioCard
                    key={opt.value}
                    option={opt}
                    selected={answers[q.id] === opt.value}
                    onSelect={() => handleSelect(q.id, opt.value)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Hata */}
        {error && (
          <p className="mt-6 text-center text-sm text-red-500">{error}</p>
        )}

        {/* Kaydet butonu */}
        <div className="mt-10">
          <button
            onClick={handleSubmit}
            disabled={!allAnswered || saving || isPending}
            className="
              flex w-full items-center justify-center gap-2
              rounded-xl bg-zinc-900 px-6 py-3.5
              text-sm font-semibold text-white
              transition-all hover:bg-zinc-800
              active:scale-[0.99]
              disabled:opacity-35 disabled:cursor-not-allowed
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-50
            "
          >
            {saving || isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                Kaydediliyor...
              </>
            ) : (
              <>
                Profilimi Tamamla
                <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </>
            )}
          </button>

          {!allAnswered && (
            <p className="mt-2.5 text-center text-xs text-zinc-400">
              Devam etmek için tüm soruları yanıtlayın
              ({totalAnswered}/{QUESTIONS.length} tamamlandı)
            </p>
          )}
        </div>
      </div>
    </div>
  );
}