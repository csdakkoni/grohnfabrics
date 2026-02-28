import { cookies } from 'next/headers';
import { Eye, X } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value || 'tr';
    const isEn = locale === 'en';

    return {
        title: isEn ? 'Inspiration Gallery - Grohn Fabrics' : 'İlham Galerisi - Grohn Fabrics',
        description: isEn
            ? 'Get inspired by real homes featuring Grohn Fabrics curtains and textiles. Browse our gallery of beautifully styled rooms.'
            : 'Grohn Fabrics perde ve tekstilleriyle döşenmiş gerçek evlerden ilham alın. Güzelce dekore edilmiş odalarımızı inceleyin.',
    };
}

// Gallery items with CSS-generated illustrations (placeholders until real photos are added)
const galleryItems = [
    { id: 1, category: 'living', colorFrom: '#E8E4DB', colorTo: '#D4CEBD', accent: '#7A9B76' },
    { id: 2, category: 'bedroom', colorFrom: '#E4E0EC', colorTo: '#D0CCDB', accent: '#9B76A8' },
    { id: 3, category: 'dining', colorFrom: '#E8DDD4', colorTo: '#D4C9BD', accent: '#C9967E' },
    { id: 4, category: 'living', colorFrom: '#DBE8E0', colorTo: '#C8D5CC', accent: '#6B9B6B' },
    { id: 5, category: 'bedroom', colorFrom: '#E0E4E8', colorTo: '#CCD0D4', accent: '#7B9BC4' },
    { id: 6, category: 'office', colorFrom: '#E8E6DB', colorTo: '#D4D2C0', accent: '#8B7355' },
    { id: 7, category: 'kids', colorFrom: '#E8E0DB', colorTo: '#F0E8E0', accent: '#C4A87B' },
    { id: 8, category: 'dining', colorFrom: '#DBE4E8', colorTo: '#C8D0D4', accent: '#769B9B' },
    { id: 9, category: 'living', colorFrom: '#E4E8DB', colorTo: '#D0D4BD', accent: '#9B9B76' },
];

export default async function GalleryPage() {
    const cookieStore = await cookies();
    const locale = (cookieStore.get('locale')?.value || 'tr') as 'tr' | 'en';
    const isEn = locale === 'en';
    const t = (tr: string, en: string) => (isEn ? en : tr);

    const categoryLabels: Record<string, string> = {
        living: t('Oturma Odası', 'Living Room'),
        bedroom: t('Yatak Odası', 'Bedroom'),
        dining: t('Yemek Odası', 'Dining Room'),
        office: t('Ofis', 'Office'),
        kids: t('Çocuk Odası', 'Kids Room'),
    };

    return (
        <div className="py-12 md:py-20">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--brand-primary)]/10 mb-6">
                        <Eye className="w-8 h-8 text-[var(--brand-primary)]" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light mb-4">{t('İlham Galerisi', 'Inspiration Gallery')}</h1>
                    <p className="text-lg text-[var(--foreground-muted)] max-w-xl mx-auto">
                        {t(
                            'Grohn kumaşlarıyla döşenmiş mekanlardan ilham alın. Evinizi hayal etmeye başlayın.',
                            'Get inspired by spaces styled with Grohn fabrics. Start envisioning your home.'
                        )}
                    </p>
                </div>

                {/* Masonry Grid */}
                <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
                    {galleryItems.map((item, index) => {
                        const heights = ['aspect-[3/4]', 'aspect-[4/5]', 'aspect-square', 'aspect-[3/4]', 'aspect-[5/4]'];
                        const aspectClass = heights[index % heights.length];

                        return (
                            <div
                                key={item.id}
                                className={`group relative rounded-2xl overflow-hidden break-inside-avoid ${aspectClass} cursor-pointer`}
                                style={{
                                    background: `linear-gradient(135deg, ${item.colorFrom}, ${item.colorTo})`,
                                }}
                            >
                                {/* Room illustration */}
                                <div className="absolute inset-0 p-6 flex flex-col justify-end">
                                    {/* Window with curtains */}
                                    <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[45%] h-[40%]">
                                        {/* Rod */}
                                        <div className="absolute -top-1 left-[-10%] right-[-10%] h-[2px] rounded-full" style={{ backgroundColor: item.accent }} />
                                        {/* Window */}
                                        <div className="w-full h-full border-4 rounded-sm bg-gradient-to-b from-[#C5DEF0]/50 to-[#A8C8E8]/50" style={{ borderColor: `${item.accent}80` }}>
                                            <div className="grid grid-cols-2 grid-rows-2 gap-0.5 h-full p-1">
                                                <div className="bg-white/20 rounded-sm" />
                                                <div className="bg-white/20 rounded-sm" />
                                                <div className="bg-white/15 rounded-sm" />
                                                <div className="bg-white/15 rounded-sm" />
                                            </div>
                                        </div>
                                        {/* Left curtain */}
                                        <div
                                            className="absolute top-0 left-[-10%] w-[22%] h-[105%] rounded-b-sm opacity-60"
                                            style={{
                                                background: `linear-gradient(90deg, ${item.accent}CC, ${item.accent}80)`,
                                                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.1) 6px, rgba(255,255,255,0.1) 8px)',
                                            }}
                                        />
                                        {/* Right curtain */}
                                        <div
                                            className="absolute top-0 right-[-10%] w-[22%] h-[105%] rounded-b-sm opacity-60"
                                            style={{
                                                background: `linear-gradient(-90deg, ${item.accent}CC, ${item.accent}80)`,
                                                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(255,255,255,0.1) 6px, rgba(255,255,255,0.1) 8px)',
                                            }}
                                        />
                                    </div>

                                    {/* Category label */}
                                    <div className="relative z-10">
                                        <span className="inline-block px-3 py-1 text-xs font-medium rounded-full text-white/90" style={{ backgroundColor: `${item.accent}CC` }}>
                                            {categoryLabels[item.category]}
                                        </span>
                                    </div>
                                </div>

                                {/* Hover overlay */}
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg">
                                            <Eye className="w-5 h-5 text-[var(--foreground)]" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA */}
                <div className="text-center mt-16">
                    <div className="p-8 bg-[var(--background-secondary)] rounded-2xl max-w-lg mx-auto">
                        <h3 className="text-xl font-medium mb-3">{t('Kendi Mekanınızı Görmek İster Misiniz?', 'Want to See Your Space?')}</h3>
                        <p className="text-sm text-[var(--foreground-muted)] mb-5">
                            {t(
                                'Ücretsiz tasarım hizmetimizle pencerenizin nasıl görüneceğini önceden görün',
                                'Preview how your window will look with our free design service'
                            )}
                        </p>
                        <a href="/design-service" className="btn btn-primary">
                            {t('Ücretsiz Tasarım Talebi', 'Free Design Request')}
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
