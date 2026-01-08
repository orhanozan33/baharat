# 🏠 Local Development Setup (Supabase Database)

## ✅ Supabase Database ile Local Frontend Test

### ADIM 1: .env Dosyasını Güncelle

`.env` dosyanızı açın (proje kök dizininde) ve şu şekilde güncelleyin:

```env
# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres

# JWT
JWT_SECRET=baharat-super-secret-jwt-key-2024-production-min-32-chars-long
JWT_EXPIRES_IN=7d

# Supabase (Opsiyonel - eğer Supabase Auth kullanıyorsanız)
NEXT_PUBLIC_SUPABASE_URL=https://wznkjgmhtcxkmwxhfkxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Node Environment
NODE_ENV=development
```

**ÖNEMLİ:** 
- `DATABASE_URL` Supabase connection string'i olmalı
- `localhost` veya `127.0.0.1` OLMAMALI
- Şifre: `Orhan2581`

---

### ADIM 2: Bağımlılıkları Yükle (İlk Kurulum)

```bash
npm install
```

---

### ADIM 3: Development Server'ı Başlat

```bash
npm run dev
```

**Veya Turbopack ile (daha hızlı):**
```bash
npm run dev:turbo
```

**Beklenen Çıktı:**
```
  ▲ Next.js 14.x.x
  - Local:        http://localhost:3000
  - Ready in 2.5s
```

---

### ADIM 4: Tarayıcıda Test Et

#### Ana Sayfa
```
http://localhost:3000/tr
```

#### API Endpoint'leri

**Products API:**
```
http://localhost:3000/api/products
```

**Categories API:**
```
http://localhost:3000/api/categories
```

**Database Health Check:**
```
http://localhost:3000/api/health/database
```

---

### ADIM 5: Database Bağlantısını Kontrol Et

Browser Console veya Terminal'de şu endpoint'i test edin:

```bash
curl http://localhost:3000/api/health/database
```

**Beklenen Sonuç:**
```json
{
  "status": "success",
  "message": "Database connection successful",
  "details": {
    "hasDatabaseUrl": true,
    "isLocalhost": false,
    "isSupabase": true,
    ...
  }
}
```

---

## 🔧 Sorun Giderme

### Hata: "connect ECONNREFUSED 127.0.0.1:5432"

**Sebep:** `.env` dosyasında `DATABASE_URL` hala localhost'a işaret ediyor.

**Çözüm:** `.env` dosyasındaki `DATABASE_URL`'i Supabase connection string'i ile güncelleyin:
```
DATABASE_URL=postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres
```

### Hata: "password authentication failed"

**Sebep:** Supabase şifresi yanlış.

**Çözüm:** `DATABASE_URL`'deki şifreyi kontrol edin (Orhan2581).

### Hata: "relation does not exist"

**Sebep:** Supabase'de tablolar oluşturulmamış.

**Çözüm:** 
1. Supabase Dashboard → SQL Editor
2. `database-schema.sql` dosyasının içeriğini çalıştırın

### Development Server Başlamıyor

**Çözüm:**
1. Port 3000'in kullanılmadığından emin olun
2. `node_modules` klasörünü silin ve `npm install` yapın
3. `.next` klasörünü silin ve `npm run dev` yapın

---

## 📝 Önemli Notlar

1. **Local Development:**
   - Database: Supabase (Remote)
   - Frontend: Localhost:3000
   - API: Localhost:3000/api

2. **Environment Variables:**
   - `.env` dosyası gitignore'da, commit edilmez
   - Her geliştirici kendi `.env` dosyasını oluşturur

3. **Database Connection:**
   - Supabase'e SSL üzerinden bağlanır
   - Connection pooling otomatik yapılır

4. **Hot Reload:**
   - Next.js otomatik hot reload yapar
   - Kod değişikliklerinde sayfa otomatik yenilenir

---

## ✅ Hızlı Kontrol Listesi

- [ ] `.env` dosyası oluşturuldu/güncellendi
- [ ] `DATABASE_URL` Supabase connection string'i
- [ ] `JWT_SECRET` ayarlandı
- [ ] `npm install` çalıştırıldı
- [ ] `npm run dev` başlatıldı
- [ ] `http://localhost:3000/tr` açıldı
- [ ] `/api/products` endpoint'i test edildi
- [ ] Database bağlantısı başarılı

---

## 🎯 Özet

1. ✅ `.env` dosyasını Supabase connection string'i ile güncelle
2. ✅ `npm run dev` komutu ile server'ı başlat
3. ✅ `http://localhost:3000/tr` adresinde test et

**Artık local frontend Supabase database'i ile çalışıyor!** 🚀

