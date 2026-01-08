# 🔧 Vercel Environment Variables - Eksik Olanları Ekle

## ✅ Gerekli Environment Variables Listesi

Resimde görünen tüm environment variables'ları Vercel'e ekleyin:

---

## 📋 ADIM ADIM: Vercel'e Environment Variables Ekleme

### ADIM 1: Vercel Dashboard'a Git

1. **Vercel:** https://vercel.com/dashboard
2. **Projenizi seçin:** `baharat`
3. **Settings** → **Environment Variables** sekmesine gidin

---

### ADIM 2: Aşağıdaki Variables'ları Ekle

Her birini **ayrı ayrı** ekleyin:

#### 1. **DATABASE_URL**
- **Key:** `DATABASE_URL`
- **Value:** 
  ```
  postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
  ```
  (Veya Session Pooler connection string'ini Supabase'den alın)
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 2. **NEXT_PUBLIC_SUPABASE_URL**
- **Key:** `NEXT_PUBLIC_SUPABASE_URL`
- **Value:**
  ```
  https://wznkjgmhtcxkmwxhfkxi.supabase.co
  ```
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 3. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
- **Key:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **Value:** Supabase Dashboard → Settings → API → `anon` `public` key
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 4. **SUPABASE_SERVICE_ROLE_KEY**
- **Key:** `SUPABASE_SERVICE_ROLE_KEY`
- **Value:** Supabase Dashboard → Settings → API → `service_role` `secret` key
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 5. **JWT_SECRET**
- **Key:** `JWT_SECRET`
- **Value:** (En az 32 karakter güçlü bir random string)
  ```
  baharat-super-secret-jwt-key-2024-production-min-32-chars-long
  ```
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 6. **JWT_EXPIRES_IN**
- **Key:** `JWT_EXPIRES_IN`
- **Value:**
  ```
  7d
  ```
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 7. **NODE_ENV**
- **Key:** `NODE_ENV`
- **Value:**
  ```
  production
  ```
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 8. **FRONTEND_URL** (Opsiyonel)
- **Key:** `FRONTEND_URL`
- **Value:**
  ```
  https://baharat-e9n4lcvjx-orhanozan33.vercel.app
  ```
  (Vercel deployment URL'iniz)
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 9. **NEXT_PUBLIC_APP_URL**
- **Key:** `NEXT_PUBLIC_APP_URL`
- **Value:**
  ```
  https://baharat-e9n4lcvjx-orhanozan33.vercel.app
  ```
- **Environment:** ✅ Production ✅ Preview ✅ Development

#### 10. **BACKEND_PASSWORD_HASH** (Eğer kullanılıyorsa)
- **Key:** `BACKEND_PASSWORD_HASH`
- **Value:** (Eski projeden kopyalayın veya yeni oluşturun)
- **Environment:** ✅ Production ✅ Preview ✅ Development

---

## 🔑 Supabase Key'lerini Nasıl Bulunur?

### Supabase Dashboard'dan:

1. **Supabase Dashboard:** https://supabase.com/dashboard
2. **Projenizi seçin:** `wznkjgmhtcxkmwxhfkxi`
3. **Settings** → **API** sekmesine gidin
4. **API Keys** bölümünde:
   - **`anon` `public` key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **`service_role` `secret` key** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Gizli tutun!)

---

## ✅ Kontrol Listesi

Her variable için:
- [ ] Key adı doğru yazıldı (büyük-küçük harf duyarlı!)
- [ ] Value doğru kopyalandı (gereksiz boşluk yok)
- [ ] Environment seçimi yapıldı (Production, Preview, Development)
- [ ] Save butonuna tıklandı

---

## 🚨 ÖNEMLİ: REDEPLOY YAPIN!

**⚠️ ÇOK ÖNEMLİ:** Environment variables eklendikten sonra **MUTLAKA redeploy yapmalısınız!**

1. **Deployments** sekmesine gidin
2. En üstteki deployment → **⋯** → **Redeploy**
3. **Redeploy** butonuna tıklayın
4. ⏳ **2-3 dakika bekleyin**

**Neden önemli?** Environment variables sadece yeni deployment'larda yüklenir!

---

## 🧪 Test Etme

Deployment tamamlandıktan sonra:

1. **Database Health Check:**
   ```
   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/health/database
   ```

2. **Products API:**
   ```
   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
   ```

3. **Ana Sayfa:**
   ```
   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/tr
   ```

---

## 📝 Özet

1. ✅ Vercel Dashboard → Settings → Environment Variables
2. ✅ Yukarıdaki tüm variables'ları ekleyin
3. ✅ Supabase'den key'leri alın
4. ✅ **REDEPLOY YAPIN!**
5. ✅ Test edin

---

## 🔍 Sorun Giderme

### Variable görünmüyor:
- Redeploy yaptınız mı?
- Environment seçimi doğru mu? (Production, Preview, Development hepsini seçin)

### Hala hata alıyorsanız:
- Vercel Deployment Logs'unu kontrol edin
- Health check endpoint'ini test edin
- Her variable'ın yanındaki göz (👁️) ikonuna tıklayıp değeri kontrol edin

