'use client';

import { useState } from 'react';
import { ArrowRight, ArrowLeft, Ruler, Check, RotateCcw, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

type HeaderStyle = 'grommet' | 'pinch_pleat' | 'rod_pocket' | 'ripple_fold' | 'tab_top' | 'goblet';

interface MeasurementState {
  headerStyle: HeaderStyle | '';
  hasRod: boolean | null;
  windowWidth: string;
  rodExtension: string;
  heightToFloor: string;
  rodToFrame: string;
  panelType: 'single' | 'split' | '';
  fullness: '1.5' | '2' | '2.5' | '';
}

const initialState: MeasurementState = {
  headerStyle: '',
  hasRod: null,
  windowWidth: '',
  rodExtension: '15',
  heightToFloor: '',
  rodToFrame: '5',
  panelType: '',
  fullness: '',
};

const TOTAL_STEPS = 7;

const headerStyles: { value: HeaderStyle; labelTr: string; labelEn: string; icon: string }[] = [
  { value: 'grommet', labelTr: 'Halkalı (Grommet)', labelEn: 'Grommet', icon: '⭕' },
  { value: 'pinch_pleat', labelTr: 'Pilili (Pinch Pleat)', labelEn: 'Pinch Pleat', icon: '🪭' },
  { value: 'rod_pocket', labelTr: 'Boru Geçmeli', labelEn: 'Rod Pocket', icon: '📏' },
  { value: 'ripple_fold', labelTr: 'Dalga Kıvrım', labelEn: 'Ripple Fold', icon: '🌊' },
  { value: 'tab_top', labelTr: 'Askılı (Tab Top)', labelEn: 'Tab Top', icon: '🏷️' },
  { value: 'goblet', labelTr: 'Kadeh Pilili', labelEn: 'Goblet Pleat', icon: '🏆' },
];

export default function MeasurementTool({ locale = 'tr' }: { locale?: 'tr' | 'en' }) {
  const [step, setStep] = useState(1);
  const [state, setState] = useState<MeasurementState>(initialState);
  const [showResults, setShowResults] = useState(false);

  const isEn = locale === 'en';
  const t = (tr: string, en: string) => (isEn ? en : tr);

  const canProceed = (): boolean => {
    switch (step) {
      case 1: return state.headerStyle !== '';
      case 2: return state.hasRod !== null;
      case 3: return state.windowWidth !== '' && parseFloat(state.windowWidth) > 0;
      case 4: return state.heightToFloor !== '' && parseFloat(state.heightToFloor) > 0;
      case 5: return state.hasRod ? (state.rodExtension !== '' && state.rodToFrame !== '') : true;
      case 6: return state.panelType !== '';
      case 7: return state.fullness !== '';
      default: return false;
    }
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) {
      // Skip step 5 if no rod
      if (step === 4 && !state.hasRod) {
        setStep(6);
      } else {
        setStep(step + 1);
      }
    } else {
      setShowResults(true);
    }
  };

  const handleBack = () => {
    if (showResults) {
      setShowResults(false);
      return;
    }
    if (step > 1) {
      // Skip step 5 back if no rod
      if (step === 6 && !state.hasRod) {
        setStep(4);
      } else {
        setStep(step - 1);
      }
    }
  };

  const handleReset = () => {
    setState(initialState);
    setStep(1);
    setShowResults(false);
  };

  // Calculate results
  const calculate = () => {
    const windowW = parseFloat(state.windowWidth) || 0;
    const extension = parseFloat(state.rodExtension) || 0;
    const height = parseFloat(state.heightToFloor) || 0;
    const rodOffset = parseFloat(state.rodToFrame) || 0;
    const fullness = parseFloat(state.fullness) || 2;

    // Rod/track width = window width + extensions on both sides
    const totalRodWidth = windowW + extension * 2;
    // Fabric width = rod width × fullness + seam allowance
    const totalFabricWidth = Math.ceil(totalRodWidth * fullness + 10);
    // Curtain height = height to floor + rod-to-frame offset + hem allowance
    const curtainHeight = Math.ceil(height + rodOffset + 15);
    // Per panel width
    const panelsCount = state.panelType === 'split' ? 2 : 1;
    const perPanelWidth = Math.ceil(totalFabricWidth / panelsCount);
    // Total fabric in meters (width × height / 10000 for m²)
    const fabricArea = (totalFabricWidth * curtainHeight) / 10000;

    return {
      totalRodWidth,
      totalFabricWidth,
      curtainHeight,
      panelsCount,
      perPanelWidth,
      fabricArea: fabricArea.toFixed(2),
    };
  };

  const results = showResults ? calculate() : null;

  const progressWidth = showResults ? 100 : ((step) / TOTAL_STEPS) * 100;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[var(--foreground-muted)]">
            {showResults
              ? t('Sonuç', 'Result')
              : t(`Adım ${step} / ${TOTAL_STEPS}`, `Step ${step} / ${TOTAL_STEPS}`)}
          </span>
          {!showResults && (
            <span className="text-sm font-medium text-[var(--brand-primary)]">
              {Math.round(progressWidth)}%
            </span>
          )}
        </div>
        <div className="w-full h-2 bg-[var(--background-secondary)] rounded-full overflow-hidden">
          <div
            className="h-full bg-[var(--brand-primary)] rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressWidth}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="bg-[var(--card-bg)] rounded-2xl shadow-sm border border-[var(--border)] overflow-hidden">
        <div className="p-6 md:p-8">
          {/* Step 1: Header Style */}
          {step === 1 && !showResults && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <span className="text-lg">🪡</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('Başlık Stilini Seçin', 'Select Header Style')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('Perdenizin üst kısmının nasıl görüneceğini belirleyin', 'Choose how the top of your curtain will look')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {headerStyles.map((hs) => (
                  <button
                    key={hs.value}
                    onClick={() => setState({ ...state, headerStyle: hs.value })}
                    className={`p-4 rounded-xl border-2 text-left transition-all hover:shadow-sm ${
                      state.headerStyle === hs.value
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--brand-primary)]/30'
                    }`}
                  >
                    <span className="text-2xl block mb-2">{hs.icon}</span>
                    <span className="text-sm font-medium">{isEn ? hs.labelEn : hs.labelTr}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step 2: Has Rod? */}
          {step === 2 && !showResults && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <span className="text-lg">🔧</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('Korniz/Ray Var mı?', 'Do You Have a Rod Installed?')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('Pencerede mevcut bir korniz veya ray sistemi var mı?', 'Is there an existing curtain rod or track on your window?')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setState({ ...state, hasRod: true })}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    state.hasRod === true
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--brand-primary)]/30'
                  }`}
                >
                  <span className="text-3xl block mb-3">✅</span>
                  <span className="font-medium">{t('Evet, var', 'Yes, I do')}</span>
                </button>
                <button
                  onClick={() => setState({ ...state, hasRod: false })}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    state.hasRod === false
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--brand-primary)]/30'
                  }`}
                >
                  <span className="text-3xl block mb-3">❌</span>
                  <span className="font-medium">{t('Hayır, yok', 'No, I don\'t')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Window Width */}
          {step === 3 && !showResults && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('Pencere Genişliği', 'Window Width')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('Pencere kasası dış kenarından dış kenarına ölçün (cm)', 'Measure from outer edge to outer edge of the window frame (cm)')}
                  </p>
                </div>
              </div>
              {/* Illustration */}
              <div className="bg-[var(--background-secondary)] rounded-xl p-6 mb-6 text-center">
                <div className="inline-block relative">
                  <div className="w-48 h-32 border-4 border-[var(--foreground-light)] rounded-sm mx-auto relative">
                    <div className="absolute -bottom-6 left-0 right-0 flex items-center justify-center">
                      <div className="h-[2px] bg-[var(--brand-primary)] flex-1" />
                      <span className="px-2 text-xs font-medium text-[var(--brand-primary)] bg-[var(--background-secondary)]">
                        ← {t('Genişlik', 'Width')} →
                      </span>
                      <div className="h-[2px] bg-[var(--brand-primary)] flex-1" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={state.windowWidth}
                  onChange={(e) => setState({ ...state, windowWidth: e.target.value })}
                  placeholder={t('Ör: 150', 'E.g: 150')}
                  className="input text-lg pr-12"
                  min="30"
                  max="1000"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] font-medium">cm</span>
              </div>
            </div>
          )}

          {/* Step 4: Height to Floor */}
          {step === 4 && !showResults && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <Ruler className="w-5 h-5 text-[var(--brand-primary)]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('Yükseklik (Pencere Üstü → Yer)', 'Height (Top Frame to Floor)')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('Pencere kasasının üst kenarından yere kadar olan mesafe (cm)', 'Distance from the top of the window frame to the floor (cm)')}
                  </p>
                </div>
              </div>
              {/* Illustration */}
              <div className="bg-[var(--background-secondary)] rounded-xl p-6 mb-6 text-center">
                <div className="inline-block relative">
                  <div className="w-32 h-48 border-4 border-[var(--foreground-light)] rounded-sm mx-auto relative">
                    <div className="absolute -right-8 top-0 bottom-0 flex flex-col items-center justify-center">
                      <div className="w-[2px] bg-[var(--brand-primary)] flex-1" />
                      <span className="py-1 text-xs font-medium text-[var(--brand-primary)] bg-[var(--background-secondary)] [writing-mode:vertical-lr]">
                        ↑ {t('Yükseklik', 'Height')} ↓
                      </span>
                      <div className="w-[2px] bg-[var(--brand-primary)] flex-1" />
                    </div>
                  </div>
                  <div className="h-[3px] w-48 bg-[var(--foreground-light)] mt-0 mx-auto" />
                </div>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={state.heightToFloor}
                  onChange={(e) => setState({ ...state, heightToFloor: e.target.value })}
                  placeholder={t('Ör: 250', 'E.g: 250')}
                  className="input text-lg pr-12"
                  min="80"
                  max="500"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] font-medium">cm</span>
              </div>
            </div>
          )}

          {/* Step 5: Rod Details (only if hasRod) */}
          {step === 5 && !showResults && state.hasRod && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <span className="text-lg">📐</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('Korniz Detayları', 'Rod Details')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('Kornizin pencereden taşma ve yükseklik bilgileri', 'Rod extension and height details')}
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                <div>
                  <label className="label">
                    {t('Korniz pencereden ne kadar taşıyor? (her bir taraf)', 'How far does the rod extend beyond the frame? (each side)')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={state.rodExtension}
                      onChange={(e) => setState({ ...state, rodExtension: e.target.value })}
                      placeholder={t('Ör: 15', 'E.g: 15')}
                      className="input pr-12"
                      min="0"
                      max="50"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] font-medium">cm</span>
                  </div>
                  <p className="form-hint">{t('Önerilen: 15-25 cm (pencere açıklığını artırır)', 'Recommended: 15-25 cm (maximizes window exposure)')}</p>
                </div>
                <div>
                  <label className="label">
                    {t('Korniz ile pencere kasası arasındaki mesafe', 'Height between rod and frame')}
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={state.rodToFrame}
                      onChange={(e) => setState({ ...state, rodToFrame: e.target.value })}
                      placeholder={t('Ör: 5', 'E.g: 5')}
                      className="input pr-12"
                      min="0"
                      max="30"
                    />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground-muted)] font-medium">cm</span>
                  </div>
                  <p className="form-hint">{t('Önerilen: Tavana mümkün olduğunca yakın, 5-8 cm altında', 'Recommended: As close to the ceiling as possible, 5-8 cm below')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Step 6: Panel Type */}
          {step === 6 && !showResults && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <span className="text-lg">🪟</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('Panel Tipi', 'Panel Type')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('Tek parça mı, yoksa ortadan ikiye ayrılan mı?', 'Single panel or split in the middle?')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setState({ ...state, panelType: 'single' })}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    state.panelType === 'single'
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--brand-primary)]/30'
                  }`}
                >
                  <div className="w-16 h-24 mx-auto mb-3 border-2 border-current rounded-sm flex">
                    <div className="flex-1 bg-[var(--brand-primary)]/20 rounded-sm" />
                  </div>
                  <span className="font-medium">{t('Tek Panel', 'Single Panel')}</span>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">{t('Tek parça perde', 'One piece curtain')}</p>
                </button>
                <button
                  onClick={() => setState({ ...state, panelType: 'split' })}
                  className={`p-6 rounded-xl border-2 text-center transition-all ${
                    state.panelType === 'split'
                      ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                      : 'border-[var(--border)] hover:border-[var(--brand-primary)]/30'
                  }`}
                >
                  <div className="w-16 h-24 mx-auto mb-3 border-2 border-current rounded-sm flex gap-0.5">
                    <div className="flex-1 bg-[var(--brand-primary)]/20 rounded-sm" />
                    <div className="flex-1 bg-[var(--brand-primary)]/20 rounded-sm" />
                  </div>
                  <span className="font-medium">{t('Çift Panel', 'Split Panels')}</span>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">{t('Ortadan açılan', 'Opens from center')}</p>
                </button>
              </div>
            </div>
          )}

          {/* Step 7: Fullness */}
          {step === 7 && !showResults && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--brand-primary)]/10 flex items-center justify-center">
                  <span className="text-lg">✨</span>
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('Doluluk Oranı', 'Choose Fullness')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('Kumaşın korniz genişliğine oranı — daha yüksek oran daha dolgun görünüm', 'Fabric to rod width ratio — higher means fuller look')}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: '1.5' as const, label: '1.5×', desc: { tr: 'Minimal', en: 'Minimal' } },
                  { value: '2' as const, label: '2×', desc: { tr: 'Standart (Önerilen)', en: 'Standard (Recommended)' } },
                  { value: '2.5' as const, label: '2.5×', desc: { tr: 'Lüks Dolgun', en: 'Luxury Full' } },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setState({ ...state, fullness: opt.value })}
                    className={`p-5 rounded-xl border-2 text-center transition-all ${
                      state.fullness === opt.value
                        ? 'border-[var(--brand-primary)] bg-[var(--brand-primary)]/5'
                        : 'border-[var(--border)] hover:border-[var(--brand-primary)]/30'
                    }`}
                  >
                    <span className="text-2xl font-light block mb-2">{opt.label}</span>
                    <span className="text-xs text-[var(--foreground-muted)]">{isEn ? opt.desc.en : opt.desc.tr}</span>
                  </button>
                ))}
              </div>
              <div className="mt-4 p-4 bg-[var(--info-light)] rounded-xl">
                <p className="text-sm text-[var(--info)]">
                  💡 {t(
                    'Perdeler için 2× doluluk, tüller/şeffaf kumaşlar için 2.5-3× doluluk önerilir.',
                    'For drapes, 2× fullness is recommended. For sheers, 2.5-3× fullness is ideal.'
                  )}
                </p>
              </div>
            </div>
          )}

          {/* Results */}
          {showResults && results && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-[var(--success-light)] flex items-center justify-center">
                  <Check className="w-5 h-5 text-[var(--success)]" />
                </div>
                <div>
                  <h3 className="text-lg font-medium">{t('Hesaplama Sonuçları', 'Measurement Results')}</h3>
                  <p className="text-sm text-[var(--foreground-muted)]">
                    {t('Perdeniz için önerilen ölçüler', 'Recommended dimensions for your curtain')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-[var(--background-secondary)] rounded-xl text-center">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">{t('Korniz/Ray Genişliği', 'Rod/Track Width')}</p>
                  <p className="text-2xl font-semibold text-[var(--brand-primary)]">{results.totalRodWidth} cm</p>
                </div>
                <div className="p-4 bg-[var(--background-secondary)] rounded-xl text-center">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">{t('Perde Yüksekliği', 'Curtain Height')}</p>
                  <p className="text-2xl font-semibold text-[var(--brand-primary)]">{results.curtainHeight} cm</p>
                </div>
                <div className="p-4 bg-[var(--background-secondary)] rounded-xl text-center">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">{t('Toplam Kumaş Genişliği', 'Total Fabric Width')}</p>
                  <p className="text-2xl font-semibold text-[var(--brand-primary)]">{results.totalFabricWidth} cm</p>
                </div>
                <div className="p-4 bg-[var(--background-secondary)] rounded-xl text-center">
                  <p className="text-sm text-[var(--foreground-muted)] mb-1">{t('Panel Başına Genişlik', 'Width Per Panel')}</p>
                  <p className="text-2xl font-semibold text-[var(--brand-primary)]">{results.perPanelWidth} cm</p>
                  <p className="text-xs text-[var(--foreground-muted)]">× {results.panelsCount} {t('panel', 'panel(s)')}</p>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-r from-[var(--brand-primary)]/10 to-[var(--accent)]/10 rounded-xl mb-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[var(--foreground-muted)]">{t('Toplam Kumaş İhtiyacı', 'Total Fabric Needed')}</p>
                    <p className="text-3xl font-semibold text-[var(--brand-primary)]">{results.fabricArea} m²</p>
                  </div>
                  <Ruler className="w-10 h-10 text-[var(--brand-primary)]/30" />
                </div>
              </div>

              <div className="p-4 bg-[var(--warning-light)] rounded-xl mb-6">
                <p className="text-sm text-[var(--warning)]">
                  ⚠️ {t(
                    'Bu hesaplama tahminidir. El yapımı üretimde ±2 cm tolerans beklenir. Desen eşleştirmesi gerekiyorsa ekstra kumaş gerekebilir.',
                    'This is an estimate. Handmade production may vary ±2 cm. Pattern matching may require additional fabric.'
                  )}
                </p>
              </div>

              {/* Selected options summary */}
              <div className="p-4 border border-[var(--border)] rounded-xl mb-6">
                <h4 className="text-sm font-medium mb-3">{t('Seçimleriniz', 'Your Selections')}</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('Başlık Stili', 'Header Style')}</span>
                    <span className="font-medium">{headerStyles.find(h => h.value === state.headerStyle)?.[isEn ? 'labelEn' : 'labelTr']}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('Panel Tipi', 'Panel Type')}</span>
                    <span className="font-medium">{state.panelType === 'split' ? t('Çift Panel', 'Split') : t('Tek Panel', 'Single')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--foreground-muted)]">{t('Doluluk', 'Fullness')}</span>
                    <span className="font-medium">{state.fullness}×</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="px-6 md:px-8 py-4 bg-[var(--background-secondary)] border-t border-[var(--border)] flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={step === 1 && !showResults}
            className="btn btn-ghost btn-sm"
          >
            <ArrowLeft className="w-4 h-4" /> {t('Geri', 'Back')}
          </button>

          <div className="flex items-center gap-3">
            {showResults && (
              <>
                <button onClick={handleReset} className="btn btn-outline btn-sm">
                  <RotateCcw className="w-4 h-4" /> {t('Yeniden Hesapla', 'Recalculate')}
                </button>
                <Link href="/products?type=curtain" className="btn btn-primary btn-sm">
                  <ShoppingBag className="w-4 h-4" /> {t('Alışverişe Başla', 'Shop Now')}
                </Link>
              </>
            )}
            {!showResults && (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="btn btn-primary btn-sm"
              >
                {step === TOTAL_STEPS ? t('Hesapla', 'Calculate') : t('İleri', 'Next')} <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Tips */}
      {!showResults && (
        <div className="mt-8 p-5 bg-[var(--background-secondary)] rounded-xl">
          <h4 className="text-sm font-medium mb-3">{t('💡 Ölçüm İpuçları', '💡 Measurement Tips')}</h4>
          <ul className="space-y-2 text-sm text-[var(--foreground-muted)]">
            <li>• {t('Metal şerit metre kullanın, kumaş metre doğru sonuç vermez', 'Use a metal tape measure for accuracy')}</li>
            <li>• {t('Kornizi tavana mümkün olduğunca yakın konumlandırın (5-8 cm altında)', 'Position the rod as close to the ceiling as possible (5-8 cm below)')}</li>
            <li>• {t('Perde yere değmemeli, yerden 1-2 cm yukarıda kalmalı', 'Curtains should hover 1-2 cm above the floor')}</li>
            <li>• {t('Özel pencere şekilleri için bize ulaşın', 'Contact us for odd-shaped windows')}</li>
          </ul>
        </div>
      )}
    </div>
  );
}
