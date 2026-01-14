'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle } from 'lucide-react';

export default function ContactPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Bir hata oluştu');
      }

      setSuccess(true);
      setForm({ name: '', email: '', phone: '', subject: '', message: '' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="container py-20">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-semibold mb-4">Mesajınız Alındı!</h1>
          <p className="text-[var(--foreground-muted)] mb-8">
            En kısa sürede sizinle iletişime geçeceğiz. Teşekkür ederiz.
          </p>
          <button 
            onClick={() => setSuccess(false)}
            className="btn btn-primary"
          >
            Yeni Mesaj Gönder
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div className="bg-[var(--background-secondary)] py-16">
        <div className="container">
          <h1 className="text-3xl font-light mb-3">İletişim</h1>
          <p className="text-[var(--foreground-muted)] max-w-lg">
            Sorularınız, önerileriniz veya toptan satış talepleriniz için bizimle iletişime geçin.
          </p>
        </div>
      </div>

      <div className="container py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Contact Info */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-xl font-medium mb-6">İletişim Bilgileri</h2>
              
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-light)] flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">E-posta</p>
                    <a href="mailto:info@grohnfabrics.com" className="text-[var(--foreground-muted)] hover:text-[var(--brand-primary)]">
                      info@grohnfabrics.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-light)] flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Telefon</p>
                    <a href="tel:+902121234567" className="text-[var(--foreground-muted)] hover:text-[var(--brand-primary)]">
                      +90 (212) 123 45 67
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-light)] flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Adres</p>
                    <p className="text-[var(--foreground-muted)]">
                      Tekstilciler Cad. No:123<br />
                      Merter, Güngören<br />
                      İstanbul, Türkiye
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-[var(--brand-primary-light)] flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-[var(--brand-primary)]" />
                  </div>
                  <div>
                    <p className="font-medium mb-1">Çalışma Saatleri</p>
                    <p className="text-[var(--foreground-muted)]">
                      Pazartesi - Cuma: 09:00 - 18:00<br />
                      Cumartesi: 10:00 - 14:00<br />
                      Pazar: Kapalı
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Wholesale Info */}
            <div className="p-6 bg-[var(--brand-primary-light)] rounded-2xl">
              <h3 className="font-medium mb-2">Toptan Satış</h3>
              <p className="text-sm text-[var(--foreground-muted)] mb-4">
                İşletmeler için özel fiyatlandırma ve toplu sipariş avantajları sunuyoruz.
              </p>
              <a 
                href="mailto:wholesale@grohnfabrics.com" 
                className="text-sm font-medium text-[var(--brand-primary)]"
              >
                wholesale@grohnfabrics.com
              </a>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card">
              <div className="card-header">
                <h2 className="card-title">Mesaj Gönderin</h2>
                <p className="card-description">
                  Formu doldurun, en kısa sürede size dönüş yapalım.
                </p>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="card-body space-y-6">
                  {error && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="label">Ad Soyad *</label>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="input"
                        placeholder="Adınız Soyadınız"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">E-posta *</label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="input"
                        placeholder="ornek@email.com"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="form-group">
                      <label className="label">Telefon</label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="input"
                        placeholder="+90 5XX XXX XX XX"
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">Konu *</label>
                      <select
                        value={form.subject}
                        onChange={(e) => setForm({ ...form, subject: e.target.value })}
                        className="input"
                        required
                      >
                        <option value="">Konu seçin...</option>
                        <option value="general">Genel Bilgi</option>
                        <option value="order">Sipariş Hakkında</option>
                        <option value="wholesale">Toptan Satış</option>
                        <option value="partnership">İş Ortaklığı</option>
                        <option value="complaint">Şikayet/Öneri</option>
                        <option value="other">Diğer</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Mesajınız *</label>
                    <textarea
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="input"
                      rows={6}
                      placeholder="Mesajınızı buraya yazın..."
                      required
                    />
                  </div>
                </div>

                <div className="card-footer">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn btn-primary"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Mesaj Gönder
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Map Placeholder */}
      <div className="h-96 bg-[var(--background-secondary)] flex items-center justify-center">
        <div className="text-center">
          <MapPin className="w-12 h-12 mx-auto text-[var(--foreground-light)] mb-4" />
          <p className="text-[var(--foreground-muted)]">
            Harita yakında eklenecek
          </p>
        </div>
      </div>
    </div>
  );
}
