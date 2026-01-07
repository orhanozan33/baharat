# 🚀 Vercel ve Supabase Deployment Rehberi

Bu rehber, projeyi Vercel ve Supabase'e deploy etmek için gerekli tüm adımları içerir.

## 📋 İçindekiler

1. [Supabase Kurulumu](#1-supabase-kurulumu)
2. [Vercel Kurulumu](#2-vercel-kurulumu)
3. [Environment Variables](#3-environment-variables)
4. [Database Migration](#4-database-migration)
5. [Deployment](#5-deployment)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. Supabase Kurulumu

### 1.1. Supabase Projesi Oluşturma

1. [Supabase](https://supabase.com) sitesine gidin ve hesap oluşturun/giriş yapın
2. **"New Project"** butonuna tıklayın
3. Proje bilgilerini doldurun:
   - **Name**: `baharat` (veya istediğiniz isim)
   - **Database Password**: Güçlü bir şifre oluşturun (kaydedin!)
   - **Region**: Size en yakın region'ı seçin
4. **"Create new project"** butonuna tıklayın
5. Projenin oluşturulmasını bekleyin (2-3 dakika)

### 1.2. Supabase Connection Bilgilerini Alma

1. Supabase Dashboard'da projenize gidin
2. Sol menüden **Settings** > **API** seçin
3. Şu bilgileri kopyalayın:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (uzun bir string)
   - **service_role secret key**: `eyJhbGc...` (uzun bir string) ⚠️ Gizli tutun!

### 1.3. Database Connection String Alma

1. Sol menüden **Settings** > **Database** seçin
2. **Connection string** bölümüne gidin
3. **Connection pooling** sekmesini seçin
4. **Connection string** formatı:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres?pgbouncer=true
   ```
   veya **Direct connection** (TypeORM için):
   ```
   postgresql://postgres:[YOUR-PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres
   ```

### 1.4. Database Schema Oluşturma

TypeORM kullanıldığı için, database schema'sı kod tarafından otomatik oluşturulacak. Ancak production'da `synchronize: false` olduğu için, ilk kurulumda şu adımları izleyin:

**Seçenek 1: Development Mode (İlk Kurulum için)**
- `lib/database.ts` dosyasında geçici olarak `synchronize: true` yapın
- İlk deploy sonrası tekrar `false` yapın

**Seçenek 2: SQL Script ile (Önerilen)**
- Prisma schema'dan SQL oluşturun veya TypeORM migration kullanın

---

## 2. Vercel Kurulumu

### 2.1. Vercel Hesabı ve Proje Bağlama

1. [Vercel](https://vercel.com) sitesine gidin ve GitHub hesabınızla giriş yapın
2. **"Add New Project"** butonuna tıklayın
3. GitHub repository'nizi seçin: `orhanozan33/baharat`
4. **"Import"** butonuna tıklayın

### 2.2. Build Settings

Vercel otomatik olarak Next.js projesini algılayacak. Ayarlar:

- **Framework Preset**: Next.js
- **Root Directory**: `./` (kök dizin)
- **Build Command**: `npm run build` (veya `npm run build:webpack`)
- **Output Directory**: `.next`
- **Install Command**: `npm install`

---

## 3. Environment Variables

### 3.1. Vercel'de Environment Variables Ekleme

1. Vercel proje sayfasında **Settings** > **Environment Variables** seçin
2. Aşağıdaki değişkenleri ekleyin:

#### Gerekli Environment Variables:

```env
# Database
DATABASE_URL=postgresql://postgres:[PASSWORD]@[PROJECT-REF].supabase.co:5432/postgres

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[anon-key]
SUPABASE_SERVICE_ROLE_KEY=[service-role-key]

# JWT
JWT_SECRET=[güçlü-32-karakter-secret-key]
JWT_EXPIRES_IN=7d

# App
NEXT_PUBLIC_APP_URL=https://your-project.vercel.app

# Node
NODE_ENV=production
```

### 3.2. Environment Variables Ekleme Adımları

Her bir değişken için:
1. **Key**: Değişken adı (örn: `DATABASE_URL`)
2. **Value**: Değer (örn: `postgresql://...`)
3. **Environment**: 
   - **Production** ✅
   - **Preview** ✅ (opsiyonel)
   - **Development** ✅ (opsiyonel)
4. **"Save"** butonuna tıklayın

### 3.3. Önemli Notlar

- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` asla client-side'da kullanılmamalı
- ⚠️ `JWT_SECRET` güçlü ve rastgele olmalı (minimum 32 karakter)
- ✅ `NEXT_PUBLIC_*` prefix'li değişkenler client-side'da kullanılabilir
- ✅ Tüm değişkenleri ekledikten sonra **"Redeploy"** yapın

---

## 4. Database Migration

### 4.1. İlk Database Setup

TypeORM `synchronize: false` olduğu için, database schema'sını manuel oluşturmanız gerekebilir.

**Seçenek 1: Geçici Synchronize (Sadece İlk Kurulum)**

1. `lib/database.ts` dosyasında:
   ```typescript
   synchronize: true, // Geçici olarak true
   ```
2. Deploy edin
3. Schema oluştuktan sonra tekrar `false` yapın

**Seçenek 2: SQL Script (Önerilen)**

1. Prisma schema'dan SQL oluşturun:
   ```bash
   npx prisma migrate dev --name init
   ```
2. Veya Supabase SQL Editor'de manuel tabloları oluşturun

### 4.2. İlk Admin Kullanıcı Oluşturma

Database hazır olduktan sonra, ilk admin kullanıcıyı oluşturun:

1. Vercel'de **Functions** > **Logs** bölümüne gidin
2. Veya local'de script çalıştırın:
   ```bash
   npm run create-admin
   ```

---

## 5. Deployment

### 5.1. İlk Deploy

1. Vercel'de tüm environment variables'ları ekledikten sonra
2. **"Deploy"** butonuna tıklayın
3. Build sürecini takip edin
4. Deploy tamamlandığında URL'yi kontrol edin

### 5.2. Deploy Sonrası Kontroller

- ✅ Site açılıyor mu?
- ✅ Database bağlantısı çalışıyor mu?
- ✅ Admin paneli erişilebilir mi?
- ✅ API endpoint'leri çalışıyor mu?

### 5.3. Custom Domain (Opsiyonel)

1. Vercel'de **Settings** > **Domains** seçin
2. Domain'inizi ekleyin
3. DNS ayarlarını yapın

---

## 6. Troubleshooting

### 6.1. Build Hataları

**Hata**: `DATABASE_URL is not set`
- **Çözüm**: Vercel'de environment variables'ları kontrol edin

**Hata**: `Connection timeout`
- **Çözüm**: Supabase connection string'ini kontrol edin, `pgbouncer` kullanmayı deneyin

### 6.2. Runtime Hataları

**Hata**: `TypeORM connection error`
- **Çözüm**: 
  - Database URL'ini kontrol edin
  - Supabase firewall ayarlarını kontrol edin
  - Connection pooling ayarlarını kontrol edin

**Hata**: `JWT_SECRET is not set`
- **Çözüm**: Vercel'de `JWT_SECRET` environment variable'ını ekleyin

### 6.3. Supabase Bağlantı Sorunları

1. Supabase Dashboard > **Settings** > **Database**
2. **Connection pooling** aktif mi kontrol edin
3. **Network restrictions** bölümünde Vercel IP'lerini allow list'e ekleyin (gerekirse)

### 6.4. Environment Variables Güncelleme

Environment variable'ları güncelledikten sonra:
1. Vercel'de **Deployments** sayfasına gidin
2. Son deployment'ın yanındaki **"..."** menüsünden **"Redeploy"** seçin

---

## 7. Güvenlik Kontrol Listesi

- [ ] `SUPABASE_SERVICE_ROLE_KEY` sadece server-side'da kullanılıyor
- [ ] `JWT_SECRET` güçlü ve rastgele (32+ karakter)
- [ ] `DATABASE_URL` production'da doğru
- [ ] `.env` dosyası `.gitignore`'da
- [ ] Supabase Row Level Security (RLS) aktif (gerekirse)
- [ ] Vercel'de environment variables production'da doğru

---

## 8. Sonraki Adımlar

1. ✅ Database schema'sını oluştur
2. ✅ İlk admin kullanıcıyı oluştur
3. ✅ Site'ı test et
4. ✅ Custom domain ekle (opsiyonel)
5. ✅ Monitoring ve logging ayarla

---

## 📞 Yardım

Sorun yaşarsanız:
- Vercel Logs: Vercel Dashboard > Deployments > [Deployment] > Logs
- Supabase Logs: Supabase Dashboard > Logs
- Database: Supabase Dashboard > Database > Logs

---

**Not**: Bu rehber production deployment için hazırlanmıştır. Development için local `.env` dosyası kullanın.

