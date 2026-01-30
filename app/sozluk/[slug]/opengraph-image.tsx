import { ImageResponse } from 'next/og'
import { createClient } from '@/utils/supabase/server'

export const runtime = 'edge'
export const alt = 'Rüya Yorumu ve Analizi'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  
  // Sadece term değil, category bilgisini de çekiyoruz
  const { data: item } = await supabase
    .from('dream_dictionary')
    .select('term, category')
    .eq('slug', params.slug)
    .single()

  const title = item?.term || 'Rüya Tabirleri'
  const category = item?.category || 'Rüya Sözlüğü'

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#020617', // Site arka planın
          backgroundImage: 'radial-gradient(circle at center, #1e293b 0%, #020617 100%)',
          fontFamily: 'serif', // Fontunu serif yaptık, daha mistik durur
          position: 'relative',
        }}
      >
        {/* Arka Plan Işık Efektleri (Mistisizm katar) */}
        <div
          style={{
            position: 'absolute',
            top: '-150px',
            left: '-150px',
            width: '500px',
            height: '500px',
            backgroundColor: '#fbbf24', // Altın Sarısı
            filter: 'blur(180px)',
            opacity: 0.15,
            borderRadius: '100%',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-150px',
            right: '-150px',
            width: '500px',
            height: '500px',
            backgroundColor: '#8b5cf6', // Mor (Psikoloji)
            filter: 'blur(180px)',
            opacity: 0.15,
            borderRadius: '100%',
          }}
        />

        {/* Üst Marka Logosu */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '40px',
            padding: '10px 25px',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '50px',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fbbf24',
            fontSize: 16,
            letterSpacing: '4px',
            textTransform: 'uppercase',
          }}
        >
          RÜYAYORUMCUM.COM.TR
        </div>

        {/* Ana Başlık (Rüya Adı) */}
        <div
          style={{
            fontSize: 72,
            fontWeight: 900,
            color: 'white',
            textAlign: 'center',
            lineHeight: 1.1,
            padding: '0 60px',
            marginBottom: '30px',
            textShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          {title}
        </div>

        {/* Alt Bilgi Çubuğu */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px',
            fontSize: 24,
            color: '#94a3b8',
          }}
        >
           <span style={{ color: '#fbbf24' }}>İslami Kaynaklar</span>
           <span>•</span>
           <span style={{ color: '#a78bfa' }}>Psikolojik Analiz</span>
        </div>

        {/* Kategori Etiketi (En altta) */}
        {category && (
            <div
                style={{
                    position: 'absolute',
                    bottom: '50px',
                    fontSize: 14,
                    color: '#475569',
                    textTransform: 'uppercase',
                    letterSpacing: '6px',
                }}
            >
                {category.toUpperCase()}
            </div>
        )}
      </div>
    ),
    { ...size }
  )
}