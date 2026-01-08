# 📋 Vercel'de Eksik Environment Variables

## ✅ Supabase Otomatik Ekledi (Zaten Var)

- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_PUBLISHABLE_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

---

## ❌ Eksik Olanlar (Manuel Eklenmeli)

### 1. **DATABASE_URL** ⭐ (EN ÖNEMLİSİ!)

**Key:** `DATABASE_URL`

**Value:**
```
postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

**Environment:** ✅ Production ✅ Preview ✅ Development

---

### 2. **JWT_SECRET**

**Key:** `JWT_SECRET`

**Value:**
```
baharat-super-secret-jwt-key-2024-production-min-32-chars-long
```

**Environment:** ✅ Production ✅ Preview ✅ Development

---

### 3. **JWT_EXPIRES_IN**

**Key:** `JWT_EXPIRES_IN`

**Value:**
```
7d
```

**Environment:** ✅ Production ✅ Preview ✅ Development

---

### 4. **NODE_ENV**

**Key:** `NODE_ENV`

**Value:**
```
production
```

**Environment:** ✅ Production ✅ Preview ✅ Development

---

### 5. **NEXT_PUBLIC_APP_URL**

**Key:** `NEXT_PUBLIC_APP_URL`

**Value:**
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app
```

**Environment:** ✅ Production ✅ Preview ✅ Development

---

### 6. **FRONTEND_URL** (Opsiyonel)

**Key:** `FRONTEND_URL`

**Value:**
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app
```

**Environment:** ✅ Production ✅ Preview ✅ Development

---

## 🚀 Otomatik Ekleme (Vercel CLI ile)

### ADIM 1: Vercel CLI Yükleyin

```bash
npm install -g vercel
```

### ADIM 2: Vercel'e Login Olun

```bash
vercel login
```

### ADIM 3: Script'i Çalıştırın

```powershell
powershell -ExecutionPolicy Bypass -File complete-vercel-env.ps1
```

Script otomatik olarak tüm eksik variables'ları ekleyecek!

---

## 📝 Manuel Ekleme (Vercel Dashboard)

### ADIM 1: Vercel Dashboard'a Git

1. **Vercel:** https://vercel.com/dashboard
2. **Projenizi seçin:** `baharat`
3. **Settings** → **Environment Variables**

### ADIM 2: Her Variable'ı Tek Tek Ekle

Her biri için:
1. **Add New** butonuna tıklayın
2. **Key** ve **Value**'yu yukarıdaki listeden kopyalayın
3. **Environment:** Production, Preview, Development (hepsini seçin)
4. **Save**

---

## 🚨 ÖNEMLİ: REDEPLOY YAPIN!

Tüm variables eklendikten sonra **MUTLAKA redeploy yapmalısınız!**

1. **Deployments** sekmesine gidin
2. En üstteki deployment → **⋯** → **Redeploy**
3. **Redeploy** butonuna tıklayın
4. ⏳ **2-3 dakika bekleyin**

---

## ✅ Kontrol Listesi

- [ ] DATABASE_URL eklendi
- [ ] JWT_SECRET eklendi
- [ ] JWT_EXPIRES_IN eklendi
- [ ] NODE_ENV eklendi
- [ ] NEXT_PUBLIC_APP_URL eklendi
- [ ] FRONTEND_URL eklendi (opsiyonel)
- [ ] **REDEPLOY yapıldı**
- [ ] Test edildi

---

## 🧪 Test Etme

Redeploy tamamlandıktan sonra:

### 1. Products API
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
```

**Beklenen:** JSON formatında ürün listesi

### 2. Database Health Check
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/health/database
```

**Beklenen:** Database connection successful

---

## 📊 Özet

**Toplam Eklenecek:** 6 environment variable

**En Önemlisi:** `DATABASE_URL` (database bağlantısı için gerekli!)

**Hızlı Yöntem:** `complete-vercel-env.ps1` script'ini çalıştırın!

