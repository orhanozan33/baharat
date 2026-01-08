# 🔐 Vercel'de DATABASE_URL Güncelleme (Yeni Şifre: Orhanozan33)

## ⚠️ ÖNEMLİ

Supabase şifresi **`Orhanozan33`** olarak değiştirildi. Vercel'de de güncellemeniz gerekiyor!

---

## 📋 ADIM ADIM: Vercel'de Güncelleme

### ADIM 1: Vercel Dashboard'a Git

1. **Vercel:** https://vercel.com/dashboard
2. **Projenizi seçin:** `baharat`
3. **Settings** → **Environment Variables**

### ADIM 2: DATABASE_URL'i Bul ve Düzenle

1. `DATABASE_URL` değişkenini bulun
2. Yanındaki **✏️ (edit)** butonuna tıklayın
3. **Value** alanındaki şifreyi değiştirin:

**Eski (Yanlış):**
```
postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

**Yeni (Doğru):**
```
postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

4. **Save** butonuna tıklayın

### ADIM 3: Eğer DATABASE_URL Yoksa

1. **Add New** butonuna tıklayın
2. **Key:** `DATABASE_URL`
3. **Value:**
   ```
   postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
   ```
4. **Environment:** ✅ Production ✅ Preview ✅ Development (hepsini seçin)
5. **Save**

---

## 🚨 ÖNEMLİ: REDEPLOY YAPIN!

Environment variable değişikliğinden sonra **MUTLAKA redeploy yapmalısınız!**

1. **Deployments** sekmesine gidin
2. En üstteki deployment → **⋯** → **Redeploy**
3. **Redeploy** butonuna tıklayın
4. ⏳ **2-3 dakika bekleyin**

---

## ✅ Test Etme

Redeploy tamamlandıktan sonra:

### 1. Products API
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
```

**Beklenen:** JSON formatında ürün listesi (veya boş array `[]`)

### 2. Database Health Check
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/health/database
```

**Beklenen:** Database connection successful mesajı

---

## 📝 Özet

1. ✅ `.env` dosyası güncellendi (local)
2. ⚠️ **Vercel'de DATABASE_URL'i güncelleyin** (şifre: `Orhanozan33`)
3. ⚠️ **REDEPLOY yapın**
4. ✅ Test edin

---

## 🔍 Kontrol

Vercel Dashboard'da DATABASE_URL'in değerini kontrol edin:
- Yanındaki göz (👁️) ikonuna tıklayın
- Şifrenin `Orhanozan33` olduğundan emin olun

