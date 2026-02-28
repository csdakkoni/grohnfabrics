import Link from 'next/link';
import { Ruler, Palette, Scissors, Wrench } from 'lucide-react';

interface SupportHubProps {
    locale?: 'tr' | 'en';
}

export default function SupportHub({ locale = 'tr' }: SupportHubProps) {
    const isEn = locale === 'en';
    const t = (tr: string, en: string) => (isEn ? en : tr);

    const cards = [
        {
            icon: <Ruler className="w-7 h-7" />,
            title: t('Ölçü Hesaplayıcı', 'Measurement Tool'),
            desc: t('Doğru perde ölçüsünü kolayca hesaplayın', 'Easily calculate the right curtain size'),
            href: '/measurement-tool',
            cta: t('Hesapla', 'Calculate'),
            color: 'from-[#7A9B76] to-[#5C7A58]',
        },
        {
            icon: <Palette className="w-7 h-7" />,
            title: t('Ücretsiz Tasarım', 'Free Design'),
            desc: t('Uzman tasarım desteği alın', 'Get expert design assistance'),
            href: '/design-service',
            cta: t('Tasarım Al', 'Get Design'),
            color: 'from-[#C9967E] to-[#A67560]',
        },
        {
            icon: <Scissors className="w-7 h-7" />,
            title: t('Ücretsiz Numune', 'Free Swatches'),
            desc: t('Kumaşları elinizde hissedin', 'Feel the fabrics in person'),
            href: '/products',
            cta: t('Numune İste', 'Order Swatches'),
            color: 'from-[#7B9BC4] to-[#5A7BA4]',
        },
        {
            icon: <Wrench className="w-7 h-7" />,
            title: t('Aksesuar & Korniz', 'Hardware & Rods'),
            desc: t('Perdenizi tamamlayacak aparatlar', 'Accessories to complete your curtains'),
            href: '/products?type=accessories',
            cta: t('Keşfet', 'Explore'),
            color: 'from-[#8B7355] to-[#6B5335]',
        },
    ];

    return (
        <section className="py-20 bg-[var(--background-secondary)]">
            <div className="container">
                <div className="text-center mb-12">
                    <span className="inline-block px-3 py-1 mb-4 text-xs font-medium bg-[var(--brand-primary)]/10 text-[var(--brand-primary)] rounded-full">
                        {t('Hepsi Bir Arada', 'All-in-One')}
                    </span>
                    <h2 className="text-3xl font-light mb-4">{t('Perde Desteği', 'Curtain Support')}</h2>
                    <p className="text-[var(--foreground-muted)] max-w-lg mx-auto">
                        {t(
                            'Doğru ölçümden tasarıma, numuneden aksesuara — ihtiyacınız olan her şey burada',
                            'From measurement to design, swatches to hardware — everything you need is here'
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    {cards.map((card, i) => (
                        <Link
                            key={i}
                            href={card.href}
                            className="group bg-[var(--card-bg)] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all hover:-translate-y-1"
                        >
                            <div className={`bg-gradient-to-br ${card.color} p-6 text-white`}>
                                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    {card.icon}
                                </div>
                                <h3 className="text-lg font-medium mb-1">{card.title}</h3>
                                <p className="text-sm text-white/75">{card.desc}</p>
                            </div>
                            <div className="p-4 flex items-center justify-between">
                                <span className="text-sm font-medium text-[var(--brand-primary)] group-hover:underline">{card.cta}</span>
                                <span className="text-[var(--brand-primary)] group-hover:translate-x-1 transition-transform">→</span>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
