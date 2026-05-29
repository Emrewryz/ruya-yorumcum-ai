"use client";

import { useState, useTransition, useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  User, Coins, Check, Pencil, X,
  Loader2, ArrowLeft, CheckCircle
} from "lucide-react";
import {
  getProfile, savePersonalization, updateProfileName,
  type UserProfile, type PersonalizationData
} from "@/app/actions/profile-actions";
import CreditModal from "@/components/CreditModal";
import AppSidebar from "@/components/AppSidebar";
import GlobalMobileNav from "@/components/GlobalMobileNav";

// ─── Soru meta verisi ─────────────────────────────────────────────────────────

const QUESTION_META: Record<string, { label: string; options: Record<string, string> }> = {
  yasam_evreni: {
    label: "Yaşam Evresi",
    options: {
      egitim: "Eğitim & Öğrencilik",
      kariyer: "Kariyer & İş İnşası",
      aile: "Aile & İlişki Odaklı",
      "rölanti": "Kendi Halimde",
    },
  },
  buyuk_degisim: {
    label: "Son 6 Ay",
    options: {
      evet_radikal: "Radikal değişim yaşandı",
      hayir_rutin: "Her şey rutin",
      bekliyor: "Değişim yaklaşıyor",
    },
  },
  ruh_hali: {
    label: "Ruh Hali",
    options: {
      huzurlu: "Huzurlu & Sakin",
      kaygilar: "Kaygılı & Stresli",
      yorgun: "Yorgun & Tükenmiş",
      heyecanli: "Gelecek İçin Heyecanlı",
    },
  },
  zihin_mesgul: {
    label: "Zihin Meşguliyeti",
    options: {
      gelecek_maddi: "Gelecek & Maddiyat",
      gecmis_baglar: "Geçmiş & Pişmanlıklar",
      "kanıtlama": "Kendimi Kanıtlama",
      an: "Anı Yaşıyorum",
    },
  },
};

// ─── Bölüm başlığı ────────────────────────────────────────────────────────────

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="mb-5">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      {subtitle && <p className="mt-0.5 text-sm text-zinc-400">{subtitle}</p>}
    </div>
  );
}

// ─── Profil Kartı ─────────────────────────────────────────────────────────────

function AccountSection({
  profile,
  onCreditClick,
}: {
  profile: UserProfile;
  onCreditClick: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(profile.full_name ?? "");
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);

  function handleSave() {
    startTransition(async () => {
      const res = await updateProfileName(name);
      if (res.success) {
        setSaved(true);
        setEditing(false);
        setTimeout(() => setSaved(false), 2000);
      }
    });
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-base font-bold text-white">
            {(profile.full_name?.charAt(0) || profile.email?.charAt(0) || "U").toUpperCase()}
          </div>
          <div>
            {editing ? (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSave();
                    if (e.key === "Escape") setEditing(false);
                  }}
                  className="rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-zinc-900/10"
                />
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="flex h-7 w-7 items-center justify-center rounded-lg bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
                >
                  {isPending
                    ? <Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} />
                    : <Check className="h-3.5 w-3.5" strokeWidth={2} />
                  }
                </button>
                <button
                  onClick={() => setEditing(false)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-zinc-200 text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  <X className="h-3.5 w-3.5" strokeWidth={2} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-zinc-900">
                  {profile.full_name || "İsim girilmemiş"}
                </p>
                {saved && <CheckCircle className="h-3.5 w-3.5 text-emerald-500" strokeWidth={1.5} />}
                <button
                  onClick={() => setEditing(true)}
                  className="text-zinc-300 hover:text-zinc-500 transition-colors"
                  aria-label="İsim düzenle"
                >
                  <Pencil className="h-3 w-3" strokeWidth={1.5} />
                </button>
              </div>
            )}
            <p className="text-xs text-zinc-400 mt-0.5">{profile.email ?? "—"}</p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-1.5">
            <Coins className="h-3.5 w-3.5 text-zinc-400" strokeWidth={1.5} />
            <span className="text-sm font-semibold text-zinc-900">{profile.credits}</span>
            <span className="text-xs text-zinc-400">kredi</span>
          </div>
          <button
            onClick={onCreditClick}
            className="rounded-lg bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 transition-colors"
          >
            Kredi Yükle
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Algoritma Ayarları ───────────────────────────────────────────────────────

function AlgorithmSection({ profile }: { profile: UserProfile }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [answers, setAnswers] = useState<PersonalizationData>(
    profile.personalization_data ?? {}
  );
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  function handleSelect(key: keyof PersonalizationData, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
    setSaved(false);
  }

  function handleSave() {
    setError(null);
    startTransition(async () => {
      const res = await savePersonalization(answers);
      if (res.success) {
        setSaved(true);
        setHasChanges(false);
        setTimeout(() => setSaved(false), 2500);
      } else {
        setError(res.error);
      }
    });
  }

  const isEmpty = !profile.personalization_data?.completed_at;

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6">
      <div className="mb-5 flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-zinc-900">Rüya Algoritması Ayarları</h2>
          <p className="mt-0.5 text-sm text-zinc-400">
            {isEmpty
              ? "Henüz profil oluşturulmamış. Aşağıdan ayarlayın."
              : "Yanıtlarınıza göre analizleriniz kişiselleştirilir."}
          </p>
        </div>
        {isEmpty && (
          <button
            onClick={() => router.push("/onboarding")}
            className="shrink-0 rounded-lg border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-500 hover:border-zinc-300 hover:text-zinc-700 transition-colors"
          >
            Anketi Doldur
          </button>
        )}
      </div>

      <div className="space-y-5">
        {Object.entries(QUESTION_META).map(([key, meta]) => {
          const currentValue = answers[key as keyof PersonalizationData];
          return (
            <div key={key}>
              <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-zinc-400">
                {meta.label}
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(meta.options).map(([val, label]) => {
                  const isSelected = currentValue === val;
                  return (
                    <button
                      key={val}
                      onClick={() => handleSelect(key as keyof PersonalizationData, val)}
                      className={`
                        rounded-lg border px-3.5 py-2 text-xs font-medium transition-all duration-150
                        ${isSelected
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-400 hover:text-zinc-900"
                        }
                      `}
                    >
                      {isSelected && <Check className="mr-1.5 inline h-3 w-3" strokeWidth={2.5} />}
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

      {hasChanges && (
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex items-center gap-2 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-zinc-700 disabled:opacity-50"
          >
            {isPending
              ? <><Loader2 className="h-3.5 w-3.5 animate-spin" strokeWidth={1.5} /> Kaydediliyor...</>
              : "Değişiklikleri Kaydet"
            }
          </button>
        </div>
      )}

      {saved && (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-100 bg-emerald-50 px-4 py-2.5 animate-in fade-in duration-300">
          <CheckCircle className="h-4 w-4 shrink-0 text-emerald-500" strokeWidth={1.5} />
          <p className="text-xs font-medium text-emerald-700">Değişiklikler kaydedildi.</p>
        </div>
      )}
    </div>
  );
}

// ─── Ana İçerik ───────────────────────────────────────────────────────────────

function ProfileContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditModalOpen, setCreditModalOpen] = useState(false);

  useEffect(() => {
    getProfile().then((res) => {
      if (res.success) setProfile(res.data);
      else router.push("/auth");
      setLoading(false);
    });
  }, [router]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-zinc-300" strokeWidth={1.5} />
      </div>
    );
  }

  if (!profile) return null;

  return (
    <>
      <CreditModal
        open={creditModalOpen}
        onClose={() => setCreditModalOpen(false)}
        reason="NO_CREDIT"
      />

      <div
        className="flex-1 overflow-y-auto"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Mobil header boşluğu */}
        <div
          className="md:hidden shrink-0"
          style={{ height: "calc(3.5rem + env(safe-area-inset-top))" }}
        />

        <div className="mx-auto max-w-2xl px-6 py-8 pb-10">
          <button
            onClick={() => router.push("/")}
            className="group mb-7 flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-700 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" strokeWidth={1.5} />
            Ana sayfaya dön
          </button>

          <div className="mb-8">
            <h1 className="text-xl font-semibold text-zinc-900">Profil</h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Hesap bilgilerinizi ve analiz tercihlerinizi yönetin.
            </p>
          </div>

          <div className="space-y-6">
            <AccountSection profile={profile} onCreditClick={() => setCreditModalOpen(true)} />
            <AlgorithmSection profile={profile} />
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sayfa ────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter();

  return (
    <div className="flex overflow-hidden bg-white" style={{ height: "100dvh" }}>

      {/* Desktop Sidebar */}
      <AppSidebar
        activeChatId={null}
        onSelectChat={(id) => router.push(`/?chat=${id}`)}
        onNewChat={() => router.push("/")}
        refreshTrigger={0}
      />

      {/* Mobil Header + Drawer */}
      <GlobalMobileNav />

      <main className="flex flex-1 flex-col overflow-hidden bg-white">
        <Suspense fallback={
          <div className="flex h-full items-center justify-center">
            <Loader2 className="h-5 w-5 animate-spin text-zinc-300" strokeWidth={1.5} />
          </div>
        }>
          <ProfileContent />
        </Suspense>
      </main>
    </div>
  );
}