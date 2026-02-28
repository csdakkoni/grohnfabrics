import MeasurementTool from '@/components/store/MeasurementTool';
import { cookies } from 'next/headers';
import { Ruler } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value || 'tr';
    const isEn = locale === 'en';

    return {
        title: isEn ? 'Measurement Tool - Grohn Fabrics' : 'Ölçü Hesaplayıcı - Grohn Fabrics',
        description: isEn
            ? 'Use our easy measurement tool to find the perfect curtain size for your windows. Step-by-step guidance for accurate measurements.'
            : 'Kolay ölçü hesaplayıcımızla pencereleriniz için mükemmel perde ölçüsünü bulun. Adım adım rehberlik ile doğru ölçüm.',
    };
}

export default async function MeasurementToolPage() {
    const cookieStore = await cookies();
    const locale = (cookieStore.get('locale')?.value || 'tr') as 'tr' | 'en';
    const isEn = locale === 'en';
    const t = (tr: string, en: string) => (isEn ? en : tr);

    return (
        <div className="py-12 md:py-20">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--brand-primary)]/10 mb-6">
                        <Ruler className="w-8 h-8 text-[var(--brand-primary)]" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light mb-4">
                        {t('Perde Ölçü Hesaplayıcı', 'Curtain Measurement Tool')}
                    </h1>
                    <p className="text-lg text-[var(--foreground-muted)] max-w-xl mx-auto">
                        {t(
                            'Birkaç basit adımla pencereniz için gereken perde ölçülerini ve kumaş miktarını hesaplayın.',
                            'Calculate the curtain dimensions and fabric amount needed for your window in a few simple steps.'
                        )}
                    </p>
                </div>

                {/* Tool */}
                <MeasurementTool locale={locale} />
            </div>
        </div>
    );
}
