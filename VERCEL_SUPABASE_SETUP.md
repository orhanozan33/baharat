# Vercel ↔ Supabase Bağlantı Rehberi (Adım Adım)

## 🔍 Sorun
- ❌ İlan kartları görünmüyor
- ❌ Veri gelmiyor
- ❌ Ürünler listelenmiyor

## ✅ Çözüm Adımları

---

## ADIM 1: Vercel Environment Variables Kontrolü

### 1.1 Vercel Dashboard'a Git
1. **Site:** https://vercel.com/dashboard
2. **Projenizi seçin:** `baharat`
3. **Settings** → **Environment Variables** bölümüne gidin

### 1.2 Kontrol Edilecek Variables

Aşağıdaki değişkenlerin **hepsinin** olması gerekiyor:

```
✅ DATABASE_URL
✅ JWT_SECRET
✅ NEXT_PUBLIC_SUPABASE_URL
✅ NEXT_PUBLIC_SUPABASE_ANON_KEY
✅ SUPABASE_SERVICE_ROLE_KEY
✅ NEXT_PUBLIC_APP_URL (opsiyonel)
```

### 1.3 Eksik Olanları Ekle

Her biri için:
1. **Key** alanına değişken adını yazın
2. **Value** alanına değeri yapıştırın
3. **Environment:** Production, Preview, Development (hepsini seçin)
4. **Save** butonuna tıklayın

---

## ADIM 2: Supabase Database Bağlantı Kontrolü

### 2.1 Supabase Dashboard
1. **Site:** https://supabase.com/dashboard
2. **Projenizi seçin:** `wznkjgmhtcxkmwxhfkxi`
3. **Settings** → **Database** bölümüne gidin

### 2.2 Connection String Kontrolü

**Connection String Formatı:**
```
postgresql://postgres:YOUR_PASSWORD@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres
```

**Not:** `YOUR_PASSWORD` kısmını kendi şifrenizle değiştirin (Orhan2581)

### 2.3 Connection String'i Vercel'e Kopyala
1. Supabase Dashboard → **Settings** → **Database**
2. **Connection string** bölümünden **URI** formatını kopyalayın
3. Vercel'e gidin → **Environment Variables** → **DATABASE_URL**
4. Değeri güncelleyin ve kaydedin

---

## ADIM 3: Tabloların Kontrolü

### 3.1 Supabase SQL Editor'de Tabloları Kontrol Et

1. Supabase Dashboard → **SQL Editor**
2. **New Query** butonuna tıklayın
3. Şu SQL'i çalıştırın:

```sql
-- Tüm tabloları listele
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

### 3.2 Beklenen Tablolar

Şu tablolar olmalı:
- ✅ users
- ✅ admins
- ✅ dealers
- ✅ categories
- ✅ products ⭐ (EN ÖNEMLİSİ)
- ✅ orders
- ✅ order_items
- ✅ dealer_products
- ✅ invoices
- ✅ payments
- ✅ checks
- ✅ settings

### 3.3 Tablolar Yoksa

Eğer tablolar yoksa, `database-schema.sql` dosyasını çalıştırın:
1. SQL Editor'de `database-schema.sql` dosyasının içeriğini açın
2. Tümünü kopyalayıp SQL Editor'e yapıştırın
3. **RUN** butonuna tıklayın

---

## ADIM 4: Ürünlerin Kontrolü

### 4.1 Ürünlerin Var Olup Olmadığını Kontrol Et

SQL Editor'de:

```sql
-- Ürün sayısını kontrol et
SELECT COUNT(*) as total_products FROM products;

-- Ürünleri listele (ilk 10)
SELECT id, name, price, stock, "isActive" 
FROM products 
ORDER BY "createdAt" DESC 
LIMIT 10;
```

### 4.2 Ürün Yoksa - Ürün Ekleme

**Seçenek A: Admin Panel'den (Önerilen)**
1. Admin ile giriş yapın: `https://baharat-e9n4lcvjx-orhanozan33.vercel.app/admin/login`
2. **Ürün Yönetimi** → **Yeni Ürün Ekle**
3. Ürün bilgilerini doldurun ve kaydedin

**Seçenek B: API ile Toplu Ekleme**
1. Admin ile login yapın ve token alın
2. Postman'de:
   ```
   POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/admin/products/replace-all
   ```
   Headers:
   ```
   Authorization: Bearer [TOKEN]
   ```

---

## ADIM 5: Vercel Deployment Kontrolü

### 5.1 Environment Variables Eklendikten Sonra

**ÇOK ÖNEMLİ:** Environment variables eklendikten sonra **MUTLAKA redeploy** yapmalısınız!

1. Vercel Dashboard → **Deployments**
2. En üstteki deployment'ın yanındaki **⋯** (üç nokta) menüsüne tıklayın
3. **Redeploy** seçeneğini seçin
4. **Redeploy** butonuna tıklayın
5. Deployment tamamlanana kadar bekleyin (1-2 dakika)

### 5.2 Deployment Loglarını Kontrol Et

Deployment loglarında şunları kontrol edin:
- ✅ Build başarılı
- ✅ Environment variables yüklenmiş
- ❌ Database connection hatası yok

---

## ADIM 6: Test ve Doğrulama

### 6.1 API Endpoint'lerini Test Et

Tarayıcıda veya Postman'de:

1. **Ürünleri Getir:**
   ```
   GET https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
   ```
   **Beklenen:** JSON formatında ürün listesi

2. **Kategorileri Getir:**
   ```
   GET https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/categories
   ```
   **Beklenen:** JSON formatında kategori listesi

### 6.2 Ana Sayfayı Kontrol Et

1. Tarayıcıda: `https://baharat-e9n4lcvjx-orhanozan33.vercel.app/tr`
2. Ürün kartlarının görünmesi gerekiyor
3. Browser Console'u açın (F12) ve hata var mı kontrol edin

---

## ADIM 7: Sorun Giderme

### Hata: "DATABASE_URL environment variable is not set"
**Çözüm:** Vercel Environment Variables'da `DATABASE_URL` ekleyin ve redeploy yapın

### Hata: "password authentication failed"
**Çözüm:** DATABASE_URL'deki şifreyi kontrol edin

### Hata: "relation 'products' does not exist"
**Çözüm:** `database-schema.sql` dosyasını Supabase'de çalıştırın

### Hata: "Unauthorized" (401)
**Çözüm:** Vercel Authentication/Deployment Protection'ı kapatın veya bypass token kullanın

### Ürünler yok
**Çözüm:** Admin panel'den veya API ile ürün ekleyin

---

## Hızlı Kontrol Listesi

- [ ] Vercel Environment Variables eklendi (DATABASE_URL, JWT_SECRET, SUPABASE keys)
- [ ] Environment Variables için redeploy yapıldı
- [ ] Supabase'de tablolar oluşturuldu (products tablosu var)
- [ ] Ürünler database'de var (SELECT COUNT(*) FROM products > 0)
- [ ] API endpoint'leri çalışıyor (/api/products)
- [ ] Ana sayfada ürünler görünüyor

---

## Özet

1. ✅ **Vercel'de Environment Variables ekle**
2. ✅ **Supabase'de tablolar oluştur**
3. ✅ **Ürünleri ekle**
4. ✅ **Redeploy yap**
5. ✅ **Test et**

Tüm adımları tamamladıktan sonra sistem çalışacaktır! 🚀

