# Supabase'de Yeni Proje Oluşturma Rehberi

## 📋 Adım Adım Rehber

### 1. Supabase Hesabına Giriş

1. Tarayıcınızda **https://supabase.com** adresine gidin
2. Sağ üst köşedeki **"Sign In"** veya **"Giriş Yap"** butonuna tıklayın
3. GitHub, Google veya e-posta ile giriş yapın

---

### 2. Yeni Proje Oluşturma

#### Adım 2.1: Dashboard'a Erişim
1. Giriş yaptıktan sonra **Dashboard** sayfasına yönlendirileceksiniz
2. Sol üst köşede **"New Project"** veya **"Yeni Proje"** butonuna tıklayın
   - VEYA
   - Eğer hiç projeniz yoksa, ortada **"Create a new project"** kartına tıklayın

#### Adım 2.2: Proje Bilgilerini Doldurma
Açılan formda şu bilgileri doldurun:

**Organizasyon Seçimi:**
- **"Organization"** veya **"Organizasyon"** dropdown'ından mevcut organizasyonunuzu seçin
- Eğer yoksa, **"New Organization"** ile yeni bir organizasyon oluşturun

**Proje Adı:**
- **"Name"** veya **"İsim"** alanına proje adınızı yazın
  - Örnek: `baharta-ecommerce` veya `baharta-production`

**Database Şifresi:**
- **"Database Password"** veya **"Veritabanı Şifresi"** alanına güçlü bir şifre girin
  - ⚠️ **ÖNEMLİ:** Bu şifreyi mutlaka kaydedin! Daha sonra değiştirebilirsiniz ama şimdi kaydedin
  - Örnek: `Orhanozan33!` (en az 8 karakter, büyük/küçük harf, rakam, özel karakter)

**Bölge (Region) Seçimi:**
- **"Region"** veya **"Bölge"** dropdown'ından size en yakın bölgeyi seçin
  - Örnek: `West US (North California)` veya `Europe West (London)`
  - Türkiye için: `Europe West` veya `Europe Central` önerilir

**Pricing Plan:**
- **"Pricing Plan"** veya **"Fiyatlandırma Planı"** seçin
  - Başlangıç için **"Free"** veya **"Ücretsiz"** planı seçebilirsiniz
  - Free plan: 500 MB veritabanı, 2 GB depolama, 50,000 aylık aktif kullanıcı

#### Adım 2.3: Projeyi Oluşturma
1. Tüm bilgileri doldurduktan sonra, sayfanın altındaki **"Create new project"** veya **"Yeni proje oluştur"** butonuna tıklayın
2. ⏳ Proje oluşturma işlemi **1-2 dakika** sürebilir
3. İşlem tamamlandığında otomatik olarak proje dashboard'una yönlendirileceksiniz

---

### 3. Proje Bilgilerini Alma

Proje oluşturulduktan sonra, uygulamanızda kullanmak için şu bilgilere ihtiyacınız var:

#### Adım 3.1: Project Settings'e Erişim
1. Sol menüden **"Settings"** (⚙️ Ayarlar) ikonuna tıklayın
2. Açılan alt menüden **"API"** seçeneğine tıklayın

#### Adım 3.2: API Bilgilerini Kopyalama
**Project URL:**
- **"Project URL"** veya **"Proje URL'si"** bölümünden URL'yi kopyalayın
  - Format: `https://xxxxxxxxxxxxx.supabase.co`
  - Bu URL'yi `.env.local` dosyasına `NEXT_PUBLIC_SUPABASE_URL` olarak ekleyeceksiniz

**API Keys:**
- **"Project API keys"** bölümünde iki anahtar var:

  **1. anon public (anon/public key):**
  - **"anon"** veya **"public"** etiketli key'i kopyalayın
  - Bu key frontend'de kullanılır (güvenli, Row Level Security ile korunur)
  - `.env.local` dosyasına `NEXT_PUBLIC_SUPABASE_ANON_KEY` olarak ekleyeceksiniz

  **2. service_role (service_role key):**
  - **"service_role"** etiketli key'i kopyalayın
  - ⚠️ **ÇOK ÖNEMLİ:** Bu key'i sadece backend'de kullanın, asla frontend'e expose etmeyin!
  - `.env.local` dosyasına `SUPABASE_SERVICE_ROLE_KEY` olarak ekleyeceksiniz

#### Adım 3.3: Database Connection String'i Alma
1. Sol menüden **"Settings"** → **"Database"** seçeneğine tıklayın
2. **"Connection string"** veya **"Bağlantı dizisi"** bölümüne gidin
3. **"Connection pooling"** sekmesine tıklayın (Session Pooler için)
4. **"URI"** formatını seçin
5. Şifreyi girin (proje oluştururken belirlediğiniz şifre)
6. Connection string'i kopyalayın
   - Format: `postgresql://postgres.xxxxxxxxxxxxx:PASSWORD@aws-0-xx-xx-x.pooler.supabase.com:5432/postgres?sslmode=require`
   - Bu string'i `.env.local` dosyasına `DATABASE_URL` olarak ekleyeceksiniz

---

### 4. Environment Variables'ı Güncelleme

#### Adım 4.1: .env.local Dosyasını Açma
1. Projenizin root dizininde `.env.local` dosyasını açın
2. Eğer yoksa, oluşturun

#### Adım 4.2: Supabase Bilgilerini Ekleme
`.env.local` dosyasına şu satırları ekleyin (yeni projenizin bilgileriyle):

```env
# Supabase Project URL
NEXT_PUBLIC_SUPABASE_URL=https://YENI_PROJE_ID.supabase.co

# Supabase API Keys
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IllFTklfUFJPSkUiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY3ODk4NzY1MywiZXhwIjoyMDM0NTYzNjUzfQ.ANON_KEY_BURAYA
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IllFTklfUFJPSkUiLCJyb2xlIjoic2VydmljZV9yb2xlIiwiaWF0IjoxNjc4OTg3NjUzLCJleHAiOjIwMzQ1NjM2NTN9.SERVICE_ROLE_KEY_BURAYA

# Database Connection String (Session Pooler - Production için)
DATABASE_URL=postgresql://postgres.YENI_PROJE_ID:PASSWORD@aws-0-xx-xx-x.pooler.supabase.com:5432/postgres?sslmode=require

# Database Connection String (Direct Connection - Development için alternatif)
# DATABASE_URL=postgresql://postgres:PASSWORD@db.YENI_PROJE_ID.supabase.co:5432/postgres?sslmode=require
```

**ÖNEMLİ NOTLAR:**
- `YENI_PROJE_ID` → Yeni projenizin ID'si (Supabase URL'sinde görünür)
- `PASSWORD` → Proje oluştururken belirlediğiniz database şifresi
- `ANON_KEY_BURAYA` → Settings → API'den kopyaladığınız anon key
- `SERVICE_ROLE_KEY_BURAYA` → Settings → API'den kopyaladığınız service_role key

---

### 5. Vercel Environment Variables'ı Güncelleme

#### Adım 5.1: Vercel Dashboard'a Erişim
1. **https://vercel.com** adresine gidin
2. Projenizi seçin
3. **"Settings"** sekmesine tıklayın
4. Sol menüden **"Environment Variables"** seçeneğine tıklayın

#### Adım 5.2: Yeni Değişkenleri Ekleme
Her bir environment variable için:

1. **"Key"** alanına değişken adını yazın (örn: `NEXT_PUBLIC_SUPABASE_URL`)
2. **"Value"** alanına değerini yazın (yeni Supabase projenizden kopyaladığınız değer)
3. **"Environment"** seçeneklerinden uygun ortamları seçin:
   - ✅ **Production** (canlı site için)
   - ✅ **Preview** (preview deployments için)
   - ✅ **Development** (opsiyonel)
4. **"Add"** veya **"Save"** butonuna tıklayın

**Eklenmesi Gereken Değişkenler:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`

#### Adım 5.3: Deployment'ı Yeniden Başlatma
1. Environment variables eklendikten sonra, **"Deployments"** sekmesine gidin
2. En son deployment'ın yanındaki **"..."** menüsüne tıklayın
3. **"Redeploy"** seçeneğini seçin
4. **"Use existing Build Cache"** seçeneğini kaldırın (yeni env vars için)
5. **"Redeploy"** butonuna tıklayın

---

### 6. Database Schema'yı Oluşturma

#### Adım 6.1: SQL Editor'a Erişim
1. Supabase Dashboard'da sol menüden **"SQL Editor"** (📝) ikonuna tıklayın
2. **"New query"** veya **"Yeni sorgu"** butonuna tıklayın

#### Adım 6.2: Mevcut Schema'yı Kopyalama
1. Mevcut projenizdeki `src/database/entities/` klasöründeki entity dosyalarını kontrol edin
2. Bu entity'lere göre SQL migration scriptleri oluşturun
3. VEYA TypeORM'un `synchronize: true` özelliğini kullanarak otomatik oluşturun (sadece development için)

#### Adım 6.3: Tabloları Oluşturma
SQL Editor'de şu komutları çalıştırabilirsiniz (örnek):

```sql
-- Örnek: Users tablosu
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Index oluşturma
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

---

### 7. Test Etme

#### Adım 7.1: Local Test
1. Terminal'de proje dizinine gidin
2. Server'ı durdurun (Ctrl+C)
3. `.env.local` dosyasını yeni Supabase bilgileriyle güncelleyin
4. Server'ı yeniden başlatın: `npm run dev`
5. Tarayıcıda `http://localhost:3000/api/test-db` adresine gidin
6. Bağlantının başarılı olduğunu kontrol edin

#### Adım 7.2: Vercel Test
1. Vercel'de redeploy işlemi tamamlandıktan sonra
2. Canlı site URL'inize gidin
3. `/api/test-db` endpoint'ine gidin
4. Bağlantının başarılı olduğunu kontrol edin

---

## ✅ Kontrol Listesi

Yeni Supabase projesi oluşturduktan sonra şunları yaptığınızdan emin olun:

- [ ] Supabase'de yeni proje oluşturuldu
- [ ] Project URL kopyalandı ve `.env.local`'e eklendi
- [ ] Anon key kopyalandı ve `.env.local`'e eklendi
- [ ] Service role key kopyalandı ve `.env.local`'e eklendi
- [ ] Database connection string kopyalandı ve `.env.local`'e eklendi
- [ ] Vercel'de tüm environment variables güncellendi
- [ ] Vercel'de redeploy yapıldı
- [ ] Local test başarılı
- [ ] Vercel test başarılı
- [ ] Database tabloları oluşturuldu (TypeORM synchronize veya SQL ile)

---

## 🔒 Güvenlik Notları

1. **Service Role Key:**
   - Asla frontend kodunda kullanmayın
   - Asla GitHub'a commit etmeyin
   - Sadece backend API routes'larında kullanın

2. **Database Password:**
   - Güçlü bir şifre kullanın (min 12 karakter)
   - Şifreyi güvenli bir yerde saklayın
   - Düzenli olarak değiştirin

3. **Row Level Security (RLS):**
   - Supabase'de RLS politikalarını aktif edin
   - Anon key ile erişilebilir tablolar için uygun politikalar oluşturun

---

## 📞 Yardım

Eğer sorun yaşarsanız:

1. Supabase Dashboard → Logs bölümünden hataları kontrol edin
2. Vercel Dashboard → Functions → Logs bölümünden hataları kontrol edin
3. Browser Console'da hataları kontrol edin
4. Network tab'ında API isteklerini kontrol edin

---

## 🎯 Sonraki Adımlar

1. Database tablolarını oluşturun
2. Seed data ekleyin (örnek ürünler, kategoriler)
3. API endpoint'lerini test edin
4. Frontend'i test edin
5. Production'a deploy edin

---

**Not:** Bu rehber, Supabase'in güncel arayüzüne göre hazırlanmıştır. Arayüz değişiklikleri olabilir, ancak genel akış aynı kalacaktır.

