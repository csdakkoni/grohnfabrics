-- ============================================
-- ÜLKE BAZLI KARGO FİYATLARI
-- Etsy tarzı detaylı kargo profilleri
-- ============================================

-- Kargo Profilleri (Genel ayarlar)
-- shipping_profiles tablosu zaten var, onu kullanacağız

-- Ülke bazlı kargo fiyatları
CREATE TABLE IF NOT EXISTS shipping_country_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES shipping_profiles(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL,  -- ISO 3166-1 alpha-2 (US, DE, AU, etc.)
  country_name VARCHAR(100) NOT NULL,
  rate NUMERIC(10,2) NOT NULL,  -- Sabit kargo ücreti
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, country_code)
);

-- Ülke grubu/bölge tanımları (opsiyonel - toplu fiyatlandırma için)
CREATE TABLE IF NOT EXISTS shipping_zones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Bölge-Ülke eşleştirmesi
CREATE TABLE IF NOT EXISTS shipping_zone_countries (
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  country_code VARCHAR(2) NOT NULL,
  country_name VARCHAR(100) NOT NULL,
  PRIMARY KEY (zone_id, country_code)
);

-- Bölge bazlı fiyatlar
CREATE TABLE IF NOT EXISTS shipping_zone_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID NOT NULL REFERENCES shipping_profiles(id) ON DELETE CASCADE,
  zone_id UUID NOT NULL REFERENCES shipping_zones(id) ON DELETE CASCADE,
  rate NUMERIC(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  estimated_days_min INTEGER,
  estimated_days_max INTEGER,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(profile_id, zone_id)
);

-- RLS Policies
ALTER TABLE shipping_country_rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zone_countries ENABLE ROW LEVEL SECURITY;
ALTER TABLE shipping_zone_rates ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read shipping_country_rates" ON shipping_country_rates FOR SELECT USING (true);
CREATE POLICY "Public read shipping_zones" ON shipping_zones FOR SELECT USING (true);
CREATE POLICY "Public read shipping_zone_countries" ON shipping_zone_countries FOR SELECT USING (true);
CREATE POLICY "Public read shipping_zone_rates" ON shipping_zone_rates FOR SELECT USING (true);

-- Admin write
CREATE POLICY "Admin write shipping_country_rates" ON shipping_country_rates FOR ALL USING (true);
CREATE POLICY "Admin write shipping_zones" ON shipping_zones FOR ALL USING (true);
CREATE POLICY "Admin write shipping_zone_countries" ON shipping_zone_countries FOR ALL USING (true);
CREATE POLICY "Admin write shipping_zone_rates" ON shipping_zone_rates FOR ALL USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_shipping_country_rates_updated_at
  BEFORE UPDATE ON shipping_country_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- ÖRNEK VERİLER
-- ============================================

-- Önce Global profil ID'sini al
DO $$
DECLARE
  global_profile_id UUID;
  europe_zone_id UUID;
  north_america_zone_id UUID;
  oceania_zone_id UUID;
BEGIN
  -- Global shipping profile'ı bul
  SELECT id INTO global_profile_id FROM shipping_profiles WHERE market_id = 'GLOBAL' LIMIT 1;
  
  IF global_profile_id IS NULL THEN
    INSERT INTO shipping_profiles (market_id, provider, name_tr, name_en, base_rate, per_kg_rate, estimated_days_min, estimated_days_max)
    VALUES ('GLOBAL', 'ups', 'UPS International', 'UPS International', 15, 0, 5, 10)
    RETURNING id INTO global_profile_id;
  END IF;

  -- Bölgeler oluştur
  INSERT INTO shipping_zones (id, name, description) VALUES
    (gen_random_uuid(), 'Avrupa', 'Avrupa Birliği ve diğer Avrupa ülkeleri'),
    (gen_random_uuid(), 'Kuzey Amerika', 'ABD ve Kanada'),
    (gen_random_uuid(), 'Okyanusya', 'Avustralya ve Yeni Zelanda')
  ON CONFLICT DO NOTHING;

  SELECT id INTO europe_zone_id FROM shipping_zones WHERE name = 'Avrupa';
  SELECT id INTO north_america_zone_id FROM shipping_zones WHERE name = 'Kuzey Amerika';
  SELECT id INTO oceania_zone_id FROM shipping_zones WHERE name = 'Okyanusya';

  -- Avrupa ülkeleri
  IF europe_zone_id IS NOT NULL THEN
    INSERT INTO shipping_zone_countries (zone_id, country_code, country_name) VALUES
      (europe_zone_id, 'DE', 'Almanya'),
      (europe_zone_id, 'FR', 'Fransa'),
      (europe_zone_id, 'NL', 'Hollanda'),
      (europe_zone_id, 'BE', 'Belçika'),
      (europe_zone_id, 'AT', 'Avusturya'),
      (europe_zone_id, 'IT', 'İtalya'),
      (europe_zone_id, 'ES', 'İspanya'),
      (europe_zone_id, 'PT', 'Portekiz'),
      (europe_zone_id, 'GB', 'İngiltere'),
      (europe_zone_id, 'CH', 'İsviçre'),
      (europe_zone_id, 'SE', 'İsveç'),
      (europe_zone_id, 'DK', 'Danimarka'),
      (europe_zone_id, 'NO', 'Norveç'),
      (europe_zone_id, 'FI', 'Finlandiya'),
      (europe_zone_id, 'PL', 'Polonya'),
      (europe_zone_id, 'CZ', 'Çekya'),
      (europe_zone_id, 'GR', 'Yunanistan')
    ON CONFLICT DO NOTHING;

    -- Avrupa bölge fiyatı
    INSERT INTO shipping_zone_rates (profile_id, zone_id, rate, currency, estimated_days_min, estimated_days_max)
    VALUES (global_profile_id, europe_zone_id, 15, 'USD', 5, 8)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Kuzey Amerika ülkeleri
  IF north_america_zone_id IS NOT NULL THEN
    INSERT INTO shipping_zone_countries (zone_id, country_code, country_name) VALUES
      (north_america_zone_id, 'US', 'Amerika Birleşik Devletleri'),
      (north_america_zone_id, 'CA', 'Kanada')
    ON CONFLICT DO NOTHING;

    -- Kuzey Amerika bölge fiyatı
    INSERT INTO shipping_zone_rates (profile_id, zone_id, rate, currency, estimated_days_min, estimated_days_max)
    VALUES (global_profile_id, north_america_zone_id, 12, 'USD', 5, 10)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Okyanusya ülkeleri
  IF oceania_zone_id IS NOT NULL THEN
    INSERT INTO shipping_zone_countries (zone_id, country_code, country_name) VALUES
      (oceania_zone_id, 'AU', 'Avustralya'),
      (oceania_zone_id, 'NZ', 'Yeni Zelanda')
    ON CONFLICT DO NOTHING;

    -- Okyanusya bölge fiyatı
    INSERT INTO shipping_zone_rates (profile_id, zone_id, rate, currency, estimated_days_min, estimated_days_max)
    VALUES (global_profile_id, oceania_zone_id, 25, 'USD', 7, 14)
    ON CONFLICT DO NOTHING;
  END IF;

  -- Özel ülke fiyatları (bölge fiyatını override eder)
  INSERT INTO shipping_country_rates (profile_id, country_code, country_name, rate, currency, estimated_days_min, estimated_days_max) VALUES
    (global_profile_id, 'US', 'Amerika Birleşik Devletleri', 10, 'USD', 5, 8),
    (global_profile_id, 'GB', 'İngiltere', 12, 'USD', 4, 7),
    (global_profile_id, 'DE', 'Almanya', 12, 'USD', 4, 7),
    (global_profile_id, 'AU', 'Avustralya', 25, 'USD', 7, 14)
  ON CONFLICT DO NOTHING;

END $$;
