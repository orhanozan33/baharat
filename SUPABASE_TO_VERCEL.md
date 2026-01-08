# 🔗 Supabase → Vercel Entegrasyon Rehberi

## 📋 Gerekli Bilgileri Toplama

Supabase Dashboard'dan şu bilgileri almamız gerekiyor:

---

## ADIM 1: Supabase Dashboard'a Git

1. **Supabase:** https://supabase.com/dashboard
2. **Projenizi seçin:** `wznkjgmhtcxkmwxhfkxi`
3. **Settings** → **API** sekmesine gidin

---

## ADIM 2: API Keys'leri Al

### 2.1 Project URL
```
URL: https://wznkjgmhtcxkmwxhfkxi.supabase.co
```

### 2.2 API Keys
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role secret** key → `SUPABASE_SERVICE_ROLE_KEY`

**⚠️ UYARI:** `service_role` key'i gizli tutulmalı, sadece server-side kullanılmalı!

---

## ADIM 3: Database Connection String'i Al

1. **Settings** → **Database** sekmesine gidin
2. **Connection string** bölümünde:
   - **Session pooler** sekmesini seçin
   - **URI** formatını kopyalayın

**Format:**
```
postgresql://postgres.wznkjgmhtcxkmwxhfkxi:[YOUR-PASSWORD]@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

**Şifreyi ekleyin:** `[YOUR-PASSWORD]` yerine `Orhan2581` yazın

---

## ADIM 4: Bilgileri Bana Verin

Aşağıdaki formatı kullanarak bilgileri paylaşın:

```
PROJECT_URL: https://wznkjgmhtcxkmwxhfkxi.supabase.co
ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SERVICE_ROLE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
DATABASE_URL: postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

---

## ✅ Ben Ne Yapacağım?

1. ✅ `vercel.env` dosyasını güncelleyeceğim
2. ✅ Vercel CLI ile otomatik import script'i hazırlayacağım
3. ✅ Tüm environment variables'ı Vercel'e ekleyeceğim
4. ✅ Connection string'i doğru formatta ayarlayacağım

---

## 🚀 Alternatif: Direkt Erişim

Eğer Supabase Dashboard erişimini paylaşırsanız, ben direkt bilgileri alıp:
- ✅ Tüm ayarları otomatik yapacağım
- ✅ Vercel'e entegre edeceğim
- ✅ Test edeceğim

---

## 📝 Hazır Format

Paylaşmak için hazır format:

**Copy-paste edilebilir:**

```
# Supabase Project Info
PROJECT_URL=https://wznkjgmhtcxkmwxhfkxi.supabase.co
ANON_KEY=[BURAYA_ANON_KEY_YAPIŞTIRIN]
SERVICE_ROLE_KEY=[BURAYA_SERVICE_ROLE_KEY_YAPIŞTIRIN]
DATABASE_URL=postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

---

## 🎯 Sonraki Adım

Bu bilgileri paylaştıktan sonra, ben:
1. ✅ `vercel.env` dosyasını güncelleyeceğim
2. ✅ Script'i çalıştırıp Vercel'e import edeceğim
3. ✅ Test edip onaylayacağım

