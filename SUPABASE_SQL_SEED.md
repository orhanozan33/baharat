# Supabase SQL ile Admin ve Ürün Ekleme

## 1. Admin Kullanıcısı Oluşturma

Supabase Dashboard → SQL Editor'de şu SQL'i çalıştırın:

```sql
-- Admin kullanıcısı oluştur
INSERT INTO users (id, "supabaseId", email, username, name, password, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid(),
  gen_random_uuid()::text,
  'mehmet@epicebuhara.com',
  'mehmet',
  'Mehmet',
  '$2a$10$rQ8K8K8K8K8K8K8K8K8K8O8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K8K', -- bcrypt hash for '33333333'
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO NOTHING
RETURNING *;

-- Admin kaydı oluştur
INSERT INTO admins (id, "userId", "fullName", permissions, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  u.id,
  'Mehmet Admin',
  ARRAY['*'],
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'mehmet@epicebuhara.com'
ON CONFLICT ("userId") DO NOTHING;
```

**Not:** Şifre hash'ini bcrypt ile oluşturmanız gerekiyor. Node.js'de:
```javascript
const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('33333333', 10);
console.log(hash);
```

## 2. Kategoriler Ekleme

```sql
-- Kategoriler
INSERT INTO categories (id, name, slug, description, "isActive", "order", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid(), 'Acı Biberler', 'aci-biberler', 'Pul biber, toz biber, isot ve diğer acı biber çeşitleri', true, 0, NOW(), NOW()),
  (gen_random_uuid(), 'Baharat Karışımları', 'baharat-karisimlari', 'Hazır baharat karışımları ve çeşniler', true, 1, NOW(), NOW()),
  (gen_random_uuid(), 'Tatlı Baharatlar', 'tatli-baharatlar', 'Tarçın, vanilya, kakule ve diğer tatlı baharatlar', true, 2, NOW(), NOW()),
  (gen_random_uuid(), 'Kök Baharatlar', 'kok-baharatlar', 'Zencefil, zerdeçal, köri ve kök baharatlar', true, 3, NOW(), NOW()),
  (gen_random_uuid(), 'Yaprak Baharatlar', 'yaprak-baharatlar', 'Defne, kekik, nane, biberiye ve diğer yaprak baharatlar', true, 4, NOW(), NOW()),
  (gen_random_uuid(), 'Tohum Baharatlar', 'tohum-baharatlar', 'Karabiber, kimyon, çemen ve diğer tohum baharatlar', true, 5, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;
```

## 3. Ürünler Ekleme

```sql
-- Örnek ürünler (kategori ID'lerini önceki sorgudan alın)
INSERT INTO products (id, name, slug, sku, price, "comparePrice", stock, weight, description, "shortDescription", "categoryId", "isActive", "isFeatured", "trackStock", images, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid(),
  'Pul Biber (Acı)',
  'pul-biber-aci',
  'BH-PULBI-001',
  45.90,
  55.90,
  150,
  250,
  'Özenle seçilmiş acı kırmızı biberlerden öğütülmüş, doğal ve katkısız pul biber.',
  'Doğal ve katkısız acı pul biber',
  c.id,
  true,
  true,
  true,
  ARRAY[]::text[],
  NOW(),
  NOW()
FROM categories c
WHERE c.slug = 'aci-biberler'
ON CONFLICT (slug) DO NOTHING;
```

## Hızlı Çözüm

En hızlı yol: Supabase Dashboard → SQL Editor'de yukarıdaki SQL'leri sırayla çalıştırın.

Veya: Admin panelinden manuel olarak ekleyin (admin oluşturulduktan sonra).

