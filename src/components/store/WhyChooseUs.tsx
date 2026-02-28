'use client';

import { Check, X } from 'lucide-react';

interface WhyChooseUsProps {
    locale?: 'tr' | 'en';
}

export default function WhyChooseUs({ locale = 'tr' }: WhyChooseUsProps) {
    const isEn = locale === 'en';
    const t = (tr: string, en: string) => (isEn ? en : tr);

    const features = [
        { label: t('Özel Ölçü Üretim', 'Custom Size Production'), us: true, them: false },
        { label: t('%100 Doğal Lifler', '100% Natural Fibers'), us: true, them: false },
        { label: t('Ücretsiz Kargo', 'Free Shipping'), us: true, them: false },
        { label: t('Ücretsiz Numune', 'Free Swatches'), us: true, them: false },
        { label: t('Ücretsiz Tasarım Hizmeti', 'Free Design Service'), us: true, them: false },
        { label: t('El İşçiliği', 'Handcrafted'), us: true, them: false },
        { label: t('Sürdürülebilir Üretim', 'Sustainable Production'), us: true, them: false },
        { label: t('Ölçü Hesaplama Aracı', 'Measurement Tool'), us: true, them: false },
        { label: t('B2B / Toptan Seçenekleri', 'B2B / Wholesale Options'), us: true, them: true },
        { label: t('Online Sipariş', 'Online Ordering'), us: true, them: true },
    ];

    return (
        <section className="py-20 bg-white">
            <div className="container">
                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full">
                        {t('Farkımız', 'Our Difference')}
                    </span>
                    <h2 className="text-3xl font-light mb-4">{t('Neden Grohn?', 'Why Choose Grohn?')}</h2>
                    <p className="text-[var(--foreground-muted)] max-w-lg mx-auto">
                        {t(
                            'Premium perde hizmetimizi geleneksel seçeneklerle karşılaştırın ve Grohn farkını keşfedin',
                            'Compare our premium curtain service with traditional options and discover the Grohn difference'
                        )}
                    </p>
                </div>

                <div className="max-w-2xl mx-auto">
                    {/* Table Header */}
                    <div className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] gap-2 mb-2">
                        <div />
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center px-3 py-2 bg-[var(--brand-primary)] text-white text-sm font-semibold rounded-xl w-full">
                                Grohn
                            </div>
                        </div>
                        <div className="text-center">
                            <div className="inline-flex items-center justify-center px-3 py-2 bg-[var(--background-secondary)] text-[var(--foreground-muted)] text-sm font-medium rounded-xl w-full">
                                {t('Diğerleri', 'Others')}
                            </div>
                        </div>
                    </div>

                    {/* Table Body */}
                    <div className="space-y-1">
                        {features.map((feature, i) => (
                            <div
                                key={i}
                                className="grid grid-cols-[1fr_100px_100px] md:grid-cols-[1fr_140px_140px] gap-2 items-center p-3 rounded-xl hover:bg-[var(--background-secondary)] transition-colors"
                            >
                                <span className="text-sm md:text-base font-medium">{feature.label}</span>
                                <div className="flex justify-center">
                                    <div className="w-8 h-8 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                                        <Check className="w-4 h-4 text-[var(--success)]" />
                                    </div>
                                </div>
                                <div className="flex justify-center">
                                    {feature.them ? (
                                        <div className="w-8 h-8 rounded-full bg-[var(--success-light)] flex items-center justify-center">
                                            <Check className="w-4 h-4 text-[var(--success)]" />
                                        </div>
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-[var(--error-light)] flex items-center justify-center">
                                            <X className="w-4 h-4 text-[var(--error)]" />
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
