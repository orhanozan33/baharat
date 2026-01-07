# 🔧 Database Connection Hatası Çözümü

## ❌ Hata
```
{"error":"connect ECONNREFUSED 127.0.0.1:5432"}
```

**Sebep:** Vercel'de `DATABASE_URL` environment variable'ı doğru ayarlanmamış veya okunmuyor.

---

## ✅ ÇÖZÜM: Adım Adım

### ADIM 1: Supabase Connection String'i Al

1. **Supabase Dashboard:** https://supabase.com/dashboard
2. **Projenizi seçin:** `wznkjgmhtcxkmwxhfkxi`
3. **Settings** → **Database** bölümüne gidin
4. **Connection string** bölümünde **URI** formatını bulun
5. **Kopyalayın** (şöyle görünmeli):
   ```
   postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres
   ```

**ÖNEMLİ:** Eğer Connection String'de `[YOUR-PASSWORD]` yazıyorsa, şifrenizle değiştirin: `Orhan2581`

---

### ADIM 2: Vercel'de DATABASE_URL Ayarla

1. **Vercel Dashboard:** https://vercel.com/dashboard
2. **Projenizi seçin:** `baharat`
3. **Settings** → **Environment Variables** bölümüne gidin
4. **DATABASE_URL** değişkenini bulun veya ekleyin:
   - **Key:** `DATABASE_URL`
   - **Value:** Supabase'den kopyaladığınız connection string (tam olarak)
   - **Environment:** Production, Preview, Development (HEPSİNİ SEÇİN!)
   - **Save** butonuna tıklayın

**Doğru Format Örneği:**
```
postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres
```

---

### ADIM 3: Diğer Environment Variables'ları Kontrol Et

Aşağıdaki değişkenlerin **HEPSİNİN** eklendiğinden emin olun:

1. **DATABASE_URL** ⭐ (EN ÖNEMLİSİ)
   ```
   postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres
   ```

2. **JWT_SECRET**
   ```
   baharat-super-secret-jwt-key-2024-production-min-32-chars-long
   ```

3. **NEXT_PUBLIC_SUPABASE_URL**
   ```
   https://wznkjgmhtcxkmwxhfkxi.supabase.co
   ```

4. **NEXT_PUBLIC_SUPABASE_ANON_KEY**
   ```
   [Supabase Dashboard → Settings → API → anon/public key]
   ```

5. **SUPABASE_SERVICE_ROLE_KEY**
   ```
   [Supabase Dashboard → Settings → API → service_role key]
   ```

---

### ADIM 4: REDEPLOY YAP! (ÇOK ÖNEMLİ!)

**⚠️ ÇOK ÖNEMLİ:** Environment variables eklendikten veya değiştirildikten sonra **MUTLAKA redeploy yapmalısınız!**

1. Vercel Dashboard → **Deployments** sekmesine gidin
2. En üstteki deployment'ı bulun
3. Yanındaki **⋯** (üç nokta) menüsüne tıklayın
4. **Redeploy** seçeneğini seçin
5. **Redeploy** butonuna tıklayın
6. Deployment tamamlanana kadar bekleyin (1-2 dakika)

**Neden önemli?** Environment variables sadece yeni deployment'larda yüklenir!

---

### ADIM 5: Deployment Loglarını Kontrol Et

1. Deployment'ın yanındaki **"..."** → **View Build Logs**
2. Loglarda şunu kontrol edin:
   - ✅ Build başarılı
   - ✅ Environment variables yüklenmiş
   - ❌ `DATABASE_URL environment variable is not set!` hatası yok
   - ❌ `ECONNREFUSED 127.0.0.1:5432` hatası yok

---

### ADIM 6: Test Et

1. **API Endpoint Test:**
   ```
   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
   ```
   **Beklenen:** JSON formatında ürün listesi (veya boş array)

2. **Ana Sayfa Test:**
   ```
   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/tr
   ```
   **Beklenen:** Ürün kartları görünmeli

---

## 🔍 Sorun Giderme

### Hata Devam Ediyorsa:

1. **DATABASE_URL değerini kontrol edin:**
   - Vercel Dashboard → Settings → Environment Variables
   - DATABASE_URL'in yanındaki göz ikonuna tıklayın
   - Değerin doğru olduğundan emin olun

2. **Connection String formatını kontrol edin:**
   - Doğru: `postgresql://postgres:PASSWORD@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres`
   - Yanlış: `postgresql://postgres:[YOUR-PASSWORD]@db...`
   - Yanlış: `postgresql://postgres@localhost:5432/baharat`

3. **Redeploy yaptınız mı?**
   - Environment variable değişikliğinden sonra redeploy yapmazsanız, eski değer kullanılır!

4. **Environment seçimini kontrol edin:**
   - Production, Preview, Development (hepsini seçmiş olmalısınız)

---

## 📝 Hızlı Kontrol Listesi

- [ ] Supabase Connection String'i kopyaladım
- [ ] Vercel'de DATABASE_URL'i ekledim/güncelledim
- [ ] DATABASE_URL değerinde `[YOUR-PASSWORD]` yok, gerçek şifre var
- [ ] DATABASE_URL'de `localhost` yok, `db.wznkjgmhtcxkmwxhfkxi.supabase.co` var
- [ ] Environment: Production, Preview, Development seçili
- [ ] **REDEPLOY YAPTIM!** ⭐ (En önemlisi)
- [ ] Deployment loglarında hata yok
- [ ] API endpoint'i test ettim
- [ ] Ana sayfada ürünler görünüyor

---

## 🎯 Özet

1. Supabase'den Connection String'i al
2. Vercel'de DATABASE_URL'i ekle/güncelle
3. **REDEPLOY YAP!**
4. Test et

**En yaygın sorun:** Redeploy yapmamak! Environment variables sadece yeni deployment'larda yüklenir.

