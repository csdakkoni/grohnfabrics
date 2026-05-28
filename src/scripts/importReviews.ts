/**
 * Etsy Reviews Import Script
 * 
 * Kullanım:
 * npx tsx src/scripts/importReviews.ts
 * 
 * Not: reviews.json dosyasını src/scripts/ klasörüne kopyalayın
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Supabase client (service role key ile - admin erişimi)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ NEXT_PUBLIC_SUPABASE_URL ve SUPABASE_SERVICE_ROLE_KEY environment değişkenleri gerekli!');
  console.log('Örnek: SUPABASE_SERVICE_ROLE_KEY=xxx npx tsx src/scripts/importReviews.ts');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface EtsyReview {
  reviewer: string;
  date_reviewed: string; // MM/DD/YYYY format
  star_rating: number;
  message: string;
  order_id: number;
}

// MM/DD/YYYY -> YYYY-MM-DD
function parseDate(dateStr: string): string {
  const [month, day, year] = dateStr.split('/');
  return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
}

async function importReviews() {
  console.log('📥 Etsy yorumları içe aktarılıyor...\n');

  // JSON dosyasını oku
  const jsonPath = path.join(__dirname, 'reviews.json');
  
  if (!fs.existsSync(jsonPath)) {
    console.error('❌ reviews.json dosyası bulunamadı!');
    console.log('Dosyayı şu konuma kopyalayın: src/scripts/reviews.json');
    process.exit(1);
  }

  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const reviews: EtsyReview[] = JSON.parse(rawData);

  console.log(`📋 ${reviews.length} yorum bulundu\n`);

  // İstatistikler
  let inserted = 0;
  let skipped = 0;
  let errors = 0;

  // Her yorumu ekle (upsert - aynı order_id varsa güncelle)
  for (const review of reviews) {
    try {
      // Her yorum için benzersiz bir ID oluştur (order_id + comment hash)
      const commentHash = review.message 
        ? review.message.substring(0, 20).replace(/\s/g, '_') 
        : 'no_comment';
      const uniqueEtsyId = `${review.order_id}_${commentHash}`;

      const { error } = await supabase
        .from('reviews')
        .upsert({
          etsy_order_id: null, // Artık unique constraint yok
          reviewer_name: review.reviewer,
          rating: review.star_rating,
          comment: review.message || null,
          review_date: parseDate(review.date_reviewed),
          source: 'etsy',
          is_approved: true,
          is_featured: review.star_rating === 5 && review.message && review.message.length > 50,
        }, {
          // ID bazlı upsert kullanmıyoruz, her zaman insert
          ignoreDuplicates: false,
        });

      if (error) {
        console.error(`⚠️ Hata (order_id: ${review.order_id}):`, error.message);
        errors++;
      } else {
        inserted++;
      }
    } catch (err) {
      console.error(`❌ Beklenmeyen hata (order_id: ${review.order_id}):`, err);
      errors++;
    }
  }

  console.log('\n✅ Import tamamlandı!');
  console.log(`   📊 Eklenen/Güncellenen: ${inserted}`);
  console.log(`   ⏭️ Atlanan: ${skipped}`);
  console.log(`   ❌ Hata: ${errors}`);

  // Özet istatistikler
  const { data: stats } = await supabase
    .from('reviews')
    .select('rating', { count: 'exact' });

  if (stats) {
    console.log(`\n📈 Toplam yorum: ${stats.length}`);
    
    const avgRating = stats.reduce((sum, r) => sum + r.rating, 0) / stats.length;
    console.log(`   ⭐ Ortalama puan: ${avgRating.toFixed(2)}`);
  }
}

importReviews().catch(console.error);
