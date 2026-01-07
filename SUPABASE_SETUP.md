# Supabase Database Setup - Adım Adım Rehber

## ⚠️ ÖNEMLİ: Önce Tabloları Oluşturun!

**Tablolar oluşturulmadan önce INSERT yapamazsınız!**

---

## Adım 1: Supabase SQL Editor'e Gitme

1. **Supabase Dashboard'a gidin**: https://supabase.com/dashboard
2. **Projenizi seçin**: `wznkjgmhtcxkmwxhfkxi`
3. **Sol menüden SQL Editor'e tıklayın**
4. **New Query butonuna tıklayın** (veya mevcut bir query'i temizleyin)

---

## Adım 2: SQL Script'i Çalıştırma

1. **`database-schema.sql` dosyasını açın** (GitHub'dan veya proje klasöründen)
2. **TÜM İÇERİĞİ kopyalayın** (Ctrl+A, Ctrl+C)
3. **Supabase SQL Editor'e yapıştırın** (Ctrl+V)
4. **RUN butonuna tıklayın** (veya Ctrl+Enter)

### Beklenen Sonuç:
```
✅ Database schema created successfully!
📊 Tables created: users, admins, dealers, categories, products, orders, order_items, dealer_products, invoices, payments, checks, settings
```

---

## Adım 3: Tabloları Kontrol Etme

1. **Sol menüden Table Editor'e gidin**
2. **Tabloların oluşturulduğunu kontrol edin:**
   - ✅ users
   - ✅ admins
   - ✅ dealers
   - ✅ categories
   - ✅ products
   - ✅ orders
   - ✅ order_items
   - ✅ dealer_products
   - ✅ invoices
   - ✅ payments
   - ✅ checks
   - ✅ settings

---

## Adım 4: İlk Admin Kullanıcı Oluşturma

**Tablolar oluşturulduktan SONRA**, SQL Editor'de şu SQL'i çalıştırın:

```sql
-- İlk admin kullanıcı oluştur
INSERT INTO users (id, "supabaseId", email, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  gen_random_uuid()::text,
  'admin@example.com',
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
);

-- Admin kaydı oluştur
INSERT INTO admins (id, "userId", "fullName", permissions, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  u.id,
  'Admin User',
  ARRAY[]::text[],
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'admin@example.com';
```

---

## Sorun Giderme

### Hata: "relation 'users' does not exist"
**Çözüm**: Önce `database-schema.sql` script'ini çalıştırın!

### Hata: "enum type already exists"
**Çözüm**: Enum'lar zaten oluşturulmuş, sadece tabloları oluşturun.

### Hata: "permission denied"
**Çözüm**: Supabase'de doğru projeye bağlı olduğunuzdan emin olun.

---

## Alternatif: API ile Admin Oluşturma

SQL yerine API kullanmak isterseniz:

1. **Vercel'de deployment'ın tamamlandığından emin olun**
2. **Postman veya tarayıcıda:**
   ```
   POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/auth/register
   ```
3. **Body (JSON):**
   ```json
   {
     "email": "admin@example.com",
     "password": "admin123",
     "name": "Admin User",
     "role": "ADMIN"
   }
   ```

---

## Özet Kontrol Listesi

- [ ] Supabase SQL Editor'e gittim
- [ ] `database-schema.sql` script'ini çalıştırdım
- [ ] Tabloların oluşturulduğunu kontrol ettim
- [ ] İlk admin kullanıcıyı oluşturdum (SQL veya API ile)
- [ ] Vercel'de sistem çalışıyor

---

## Hızlı Test

Tablolar oluşturulduktan sonra, SQL Editor'de şunu çalıştırın:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

12 tablo görmelisiniz!

