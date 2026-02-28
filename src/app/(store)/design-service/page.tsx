import DesignServiceForm from '@/components/store/DesignServiceForm';
import { cookies } from 'next/headers';
import { Palette, Camera, MessageSquare, Mail } from 'lucide-react';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const locale = cookieStore.get('locale')?.value || 'tr';
    const isEn = locale === 'en';

    return {
        title: isEn ? 'Free Design Service - Grohn Fabrics' : 'Ücretsiz Tasarım Hizmeti - Grohn Fabrics',
        description: isEn
            ? 'Submit a photo of your window and share your preferences. Our designers will create custom curtain suggestions tailored for you, completely free.'
            : 'Pencere fotoğrafınızı gönderin ve tercihlerinizi paylaşın. Tasarımcılarımız size özel perde önerileri hazırlasın, tamamen ücretsiz.',
    };
}

export default async function DesignServicePage() {
    const cookieStore = await cookies();
    const locale = (cookieStore.get('locale')?.value || 'tr') as 'tr' | 'en';
    const isEn = locale === 'en';
    const t = (tr: string, en: string) => (isEn ? en : tr);

    return (
        <div className="py-12 md:py-20">
            <div className="container">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-[var(--accent)]/10 mb-6">
                        <Palette className="w-8 h-8 text-[var(--accent)]" />
                    </div>
                    <h1 className="text-3xl md:text-4xl font-light mb-4">
                        {t('Ücretsiz Tasarım Hizmeti', 'Free Design Service')}
                    </h1>
                    <p className="text-lg text-[var(--foreground-muted)] max-w-xl mx-auto">
                        {t(
                            'Pencere fotoğrafınızı gönderin, tasarımcılarımız size özel perde önerileri hazırlasın. Tamamen ücretsiz!',
                            'Submit your window photo, our designers will create custom curtain suggestions just for you. Completely free!'
                        )}
                    </p>
                </div>

                {/* How It Works */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 max-w-3xl mx-auto">
                    {[
                        {
                            icon: <Camera className="w-6 h-6" />,
                            step: '1',
                            title: t('Fotoğraf Çekin', 'Snap a Photo'),
                            desc: t('Pencerenizin ön cepheden net bir fotoğrafını çekin', 'Capture a clear front-view photo of your window'),
                        },
                        {
                            icon: <MessageSquare className="w-6 h-6" />,
                            step: '2',
                            title: t('Tercihlerinizi Paylaşın', 'Share Preferences'),
                            desc: t('Renk, stil ve kumaş tercihlerinizi belirtin', 'Specify your color, style, and fabric preferences'),
                        },
                        {
                            icon: <Mail className="w-6 h-6" />,
                            step: '3',
                            title: t('Tasarımı Alın', 'Receive Design'),
                            desc: t('5 iş günü içinde özel tasarım önerileriniz e-posta ile gelir', 'Custom design suggestions arrive via email within 5 business days'),
                        },
                    ].map((item) => (
                        <div key={item.step} className="text-center">
                            <div className="relative inline-flex items-center justify-center w-14 h-14 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] mb-4">
                                {item.icon}
                                <span className="absolute -top-1 -right-1 w-6 h-6 bg-[var(--accent)] text-white text-xs font-bold rounded-full flex items-center justify-center">
                                    {item.step}
                                </span>
                            </div>
                            <h3 className="font-medium mb-2">{item.title}</h3>
                            <p className="text-sm text-[var(--foreground-muted)]">{item.desc}</p>
                        </div>
                    ))}
                </div>

                {/* Divider */}
                <div className="max-w-2xl mx-auto mb-12">
                    <div className="h-px bg-[var(--border)]" />
                </div>

                {/* Form */}
                <DesignServiceForm locale={locale} />
            </div>
        </div>
    );
}
