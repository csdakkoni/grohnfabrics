/**
 * Etsy (AgoraLoom) yorumlarını Supabase'e import eden script
 * 
 * Kullanım:
 * 1. reviews.json dosyasını src/scripts/ klasörüne kopyala
 * 2. npx tsx src/scripts/import-etsy-reviews.ts
 * 
 * Veya API endpoint üzerinden:
 * POST /api/admin/import-reviews
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase admin client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Kategori anahtar kelimeleri
const CATEGORY_KEYWORDS: Record<string, string[]> = {
  curtain: ['curtain', 'drape', 'panel', 'window', 'hung', 'hanging'],
  fabric: ['fabric', 'material', 'linen', 'cotton', 'muslin', 'cloth', 'textile'],
  sample: ['sample', 'swatch'],
};

// Yorum metninden kategori tahmin et
function detectCategory(message: string | null): string {
  if (!message) return 'general';
  
  const lowerMessage = message.toLowerCase();
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerMessage.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'general';
}

// Tarih formatını dönüştür (MM/DD/YYYY -> YYYY-MM-DD)
function parseDate(dateStr: string): string {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

interface EtsyReview {
  reviewer: string;
  date_reviewed: string;
  star_rating: number;
  message: string;
  order_id: number;
}

async function importReviews() {
  console.log('🚀 Etsy yorumları import ediliyor...\n');

  // Supabase bağlantısı
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY env değişkenleri gerekli!');
    console.log('\nÖrnek:');
    console.log('NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co');
    console.log('SUPABASE_SERVICE_ROLE_KEY=eyJhbG...');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // reviews.json dosyasını oku
  const reviewsPath = path.join(__dirname, 'reviews.json');
  
  if (!fs.existsSync(reviewsPath)) {
    console.error(`❌ reviews.json bulunamadı: ${reviewsPath}`);
    console.log('\nLütfen reviews.json dosyasını src/scripts/ klasörüne kopyalayın.');
    process.exit(1);
  }

  const rawData = fs.readFileSync(reviewsPath, 'utf-8');
  const reviews: EtsyReview[] = JSON.parse(rawData);

  console.log(`📊 Toplam yorum sayısı: ${reviews.length}\n`);

  // Kategori istatistikleri
  const categoryStats: Record<string, number> = {
    curtain: 0,
    fabric: 0,
    sample: 0,
    general: 0,
  };

  // Veritabanına eklenecek veriler
  const reviewsToInsert = reviews
    .filter(r => r.message && r.message.trim().length > 0) // Boş yorumları filtrele
    .map(review => {
      const category = detectCategory(review.message);
      categoryStats[category]++;

      return {
        reviewer_name: review.reviewer,
        rating: review.star_rating,
        comment: review.message,
        review_date: parseDate(review.date_reviewed),
        source: 'etsy',
        source_order_id: review.order_id.toString(),
        category_keyword: category,
        is_approved: true, // Etsy yorumları otomatik onaylı
        is_featured: review.star_rating === 5, // 5 yıldızlı yorumlar öne çıkan
      };
    });

  console.log('📈 Kategori dağılımı:');
  console.log(`   🪟 Perde (curtain): ${categoryStats.curtain}`);
  console.log(`   🧵 Kumaş (fabric): ${categoryStats.fabric}`);
  console.log(`   📦 Numune (sample): ${categoryStats.sample}`);
  console.log(`   📝 Genel (general): ${categoryStats.general}`);
  console.log('');

  // Mevcut Etsy yorumlarını sil (tekrar import için)
  console.log('🗑️  Mevcut Etsy yorumları temizleniyor...');
  const { error: deleteError } = await supabase
    .from('reviews')
    .delete()
    .eq('source', 'etsy');

  if (deleteError) {
    console.error('❌ Silme hatası:', deleteError.message);
    process.exit(1);
  }

  // Yorumları ekle (batch olarak)
  console.log('💾 Yorumlar ekleniyor...');
  
  const batchSize = 50;
  let insertedCount = 0;

  for (let i = 0; i < reviewsToInsert.length; i += batchSize) {
    const batch = reviewsToInsert.slice(i, i + batchSize);
    
    const { error: insertError } = await supabase
      .from('reviews')
      .insert(batch);

    if (insertError) {
      console.error(`❌ Ekleme hatası (batch ${i / batchSize + 1}):`, insertError.message);
      continue;
    }

    insertedCount += batch.length;
    console.log(`   ✅ ${insertedCount}/${reviewsToInsert.length} yorum eklendi`);
  }

  console.log('\n✨ Import tamamlandı!');
  console.log(`   📊 Toplam: ${insertedCount} yorum eklendi`);
  console.log(`   ⭐ Öne çıkan: ${reviewsToInsert.filter(r => r.is_featured).length} yorum`);
}

// Script olarak çalıştırıldığında
importReviews().catch(console.error);
