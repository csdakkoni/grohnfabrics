'use client';

import { useState, useRef } from 'react';
import { Upload, X, Send, Loader2, CheckCircle } from 'lucide-react';

interface DesignServiceFormProps {
    locale?: 'tr' | 'en';
}

export default function DesignServiceForm({ locale = 'tr' }: DesignServiceFormProps) {
    const isEn = locale === 'en';
    const t = (tr: string, en: string) => (isEn ? en : tr);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [roomType, setRoomType] = useState('');
    const [stylePreference, setStylePreference] = useState('');
    const [colorPreference, setColorPreference] = useState('');
    const [budget, setBudget] = useState('');
    const [notes, setNotes] = useState('');
    const [photos, setPhotos] = useState<File[]>([]);
    const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState('');

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (photos.length + files.length > 3) {
            setError(t('En fazla 3 fotoğraf yükleyebilirsiniz', 'Maximum 3 photos allowed'));
            return;
        }
        setError('');
        const newPhotos = [...photos, ...files].slice(0, 3);
        setPhotos(newPhotos);

        // Generate previews
        const newPreviews = [...photoPreviews];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                setPhotoPreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removePhoto = (index: number) => {
        setPhotos(photos.filter((_, i) => i !== index));
        setPhotoPreviews(photoPreviews.filter((_, i) => i !== index));
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
        if (photos.length + files.length > 3) {
            setError(t('En fazla 3 fotoğraf yükleyebilirsiniz', 'Maximum 3 photos allowed'));
            return;
        }
        setError('');
        const newPhotos = [...photos, ...files].slice(0, 3);
        setPhotos(newPhotos);

        const newPreviews = [...photoPreviews];
        files.forEach((file) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                newPreviews.push(reader.result as string);
                setPhotoPreviews([...newPreviews]);
            };
            reader.readAsDataURL(file);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name || !email) {
            setError(t('Ad ve e-posta alanları zorunludur', 'Name and email are required'));
            return;
        }

        setIsSubmitting(true);
        setError('');

        try {
            const formData = new FormData();
            formData.append('name', name);
            formData.append('email', email);
            formData.append('phone', phone);
            formData.append('roomType', roomType);
            formData.append('stylePreference', stylePreference);
            formData.append('colorPreference', colorPreference);
            formData.append('budget', budget);
            formData.append('notes', notes);
            photos.forEach((photo) => formData.append('photos', photo));

            const res = await fetch('/api/design-service', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) throw new Error('Failed to submit');

            setIsSubmitted(true);
        } catch {
            setError(t('Bir hata oluştu. Lütfen tekrar deneyin.', 'An error occurred. Please try again.'));
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 bg-[var(--success-light)] rounded-full flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-[var(--success)]" />
                </div>
                <h3 className="text-2xl font-medium mb-3">{t('Talebiniz Alındı!', 'Request Received!')}</h3>
                <p className="text-[var(--foreground-muted)] max-w-md mx-auto mb-6">
                    {t(
                        'Tasarım ekibimiz fotoğraflarınızı inceleyecek ve 5 iş günü içinde size özel tasarım önerilerini e-posta ile gönderecektir.',
                        'Our design team will review your photos and send custom design suggestions via email within 5 business days.'
                    )}
                </p>
                <button
                    onClick={() => {
                        setIsSubmitted(false);
                        setName('');
                        setEmail('');
                        setPhone('');
                        setRoomType('');
                        setStylePreference('');
                        setColorPreference('');
                        setBudget('');
                        setNotes('');
                        setPhotos([]);
                        setPhotoPreviews([]);
                    }}
                    className="btn btn-outline"
                >
                    {t('Yeni Talep Oluştur', 'Create New Request')}
                </button>
            </div>
        );
    }

    const roomTypes = [
        { value: 'living', label: t('Oturma Odası', 'Living Room') },
        { value: 'bedroom', label: t('Yatak Odası', 'Bedroom') },
        { value: 'dining', label: t('Yemek Odası', 'Dining Room') },
        { value: 'kids', label: t('Çocuk Odası', 'Kids Room') },
        { value: 'office', label: t('Ofis / Çalışma', 'Office / Study') },
        { value: 'other', label: t('Diğer', 'Other') },
    ];

    const styles = [
        { value: 'modern', label: t('Modern / Minimalist', 'Modern / Minimalist') },
        { value: 'classic', label: t('Klasik / Zarif', 'Classic / Elegant') },
        { value: 'bohemian', label: t('Bohem / Doğal', 'Bohemian / Natural') },
        { value: 'scandinavian', label: t('İskandinav', 'Scandinavian') },
        { value: 'rustic', label: t('Rustik / Kırsal', 'Rustic / Farmhouse') },
        { value: 'unsure', label: t('Emin Değilim', 'Not Sure') },
    ];

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            {/* Photo Upload */}
            <div className="mb-8">
                <label className="label text-base">{t('📸 Pencere / Oda Fotoğrafı', '📸 Window / Room Photo')}</label>
                <p className="text-sm text-[var(--foreground-muted)] mb-3">
                    {t(
                        'Pencere ve duvarın ön cepheden net bir fotoğrafını yükleyin. Tavan ve zemin de görünürse harika olur.',
                        'Upload a clear front-view photo of your window and wall. Including the ceiling and floor is ideal.'
                    )}
                </p>
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--brand-primary)]/50 hover:bg-[var(--brand-primary)]/2 transition-colors"
                >
                    <Upload className="w-10 h-10 mx-auto mb-3 text-[var(--foreground-light)]" />
                    <p className="text-sm font-medium">{t('Sürükle & Bırak veya Tıkla', 'Drag & Drop or Click')}</p>
                    <p className="text-xs text-[var(--foreground-light)] mt-1">{t('En fazla 3 fotoğraf, max 10MB', 'Up to 3 photos, max 10MB each')}</p>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleFileChange}
                    />
                </div>

                {/* Photo Previews */}
                {photoPreviews.length > 0 && (
                    <div className="flex gap-3 mt-4">
                        {photoPreviews.map((preview, i) => (
                            <div key={i} className="relative w-24 h-24 rounded-lg overflow-hidden border border-[var(--border)]">
                                <img src={preview} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removePhoto(i)}
                                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                                >
                                    <X className="w-3 h-3" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="form-group">
                    <label className="label">{t('Ad Soyad *', 'Full Name *')}</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="input" required placeholder={t('Adınızı girin', 'Enter your name')} />
                </div>
                <div className="form-group">
                    <label className="label">{t('E-posta *', 'Email *')}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="input" required placeholder={t('ornek@email.com', 'example@email.com')} />
                </div>
                <div className="form-group">
                    <label className="label">{t('Telefon', 'Phone')}</label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="input" placeholder={t('+90 5XX XXX XX XX', '+1 (555) 000-0000')} />
                </div>
                <div className="form-group">
                    <label className="label">{t('Oda Tipi', 'Room Type')}</label>
                    <select value={roomType} onChange={(e) => setRoomType(e.target.value)} className="input">
                        <option value="">{t('Seçiniz', 'Select')}</option>
                        {roomTypes.map((r) => (
                            <option key={r.value} value={r.value}>{r.label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Preferences */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="form-group">
                    <label className="label">{t('Stil Tercihi', 'Style Preference')}</label>
                    <select value={stylePreference} onChange={(e) => setStylePreference(e.target.value)} className="input">
                        <option value="">{t('Seçiniz', 'Select')}</option>
                        {styles.map((s) => (
                            <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                    </select>
                </div>
                <div className="form-group">
                    <label className="label">{t('Renk Tercihi', 'Color Preference')}</label>
                    <input type="text" value={colorPreference} onChange={(e) => setColorPreference(e.target.value)} className="input" placeholder={t('Ör: Bej, Krem, Yeşil tonları', 'E.g: Beige, Cream, Green tones')} />
                </div>
            </div>

            <div className="form-group mb-6">
                <label className="label">{t('Ek Notlar', 'Additional Notes')}</label>
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="input"
                    rows={3}
                    placeholder={t(
                        'Özel isteklerinizi yazın: kumaş tercihi, fonksiyon (karartma, tül, vb.), bütçe...',
                        'Write your special requests: fabric preference, function (blackout, sheer, etc.), budget...'
                    )}
                />
            </div>

            {error && (
                <div className="p-3 mb-4 bg-[var(--error-light)] text-[var(--error)] text-sm rounded-lg">
                    {error}
                </div>
            )}

            <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-lg w-full">
                {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> {t('Gönderiliyor...', 'Submitting...')}</>
                ) : (
                    <><Send className="w-5 h-5" /> {t('Tasarım Talebi Gönder', 'Submit Design Request')}</>
                )}
            </button>
        </form>
    );
}
