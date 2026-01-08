# 📋 Supabase Bilgilerini Toplama Rehberi

## 🔗 Projeniz
https://supabase.com/dashboard/project/wznkjgmhtcxkmwxhfkxi

---

## 📝 ADIM ADIM: Gerekli Bilgileri Alın

### ADIM 1: API Keys Alın

1. **Supabase Dashboard'da:** https://supabase.com/dashboard/project/wznkjgmhtcxkmwxhfkxi
2. Sol menüden **Settings** (⚙️) tıklayın
3. **API** sekmesine gidin
4. **API Keys** bölümünde:

#### 1.1 Project URL
- **URL** değerini kopyalayın:
  ```
  https://wznkjgmhtcxkmwxhfkxi.supabase.co
  ```

#### 1.2 anon public key
- **anon** satırındaki **public** key'i kopyalayın
- 📋 **Bu:** `NEXT_PUBLIC_SUPABASE_ANON_KEY` için

#### 1.3 service_role secret key
- **service_role** satırındaki **secret** key'i kopyalayın  
- ⚠️ **⚠️ UYARI:** Bu key gizli! Sadece server-side kullanılmalı!
- 📋 **Bu:** `SUPABASE_SERVICE_ROLE_KEY` için

---

### ADIM 2: Database Connection String Alın

1. **Settings** → **Database** sekmesine gidin
2. **Connection string** bölümünde:
3. **Connection pooling** sekmesine tıklayın
4. **Type:** URI seçili olsun
5. **Method:** Session pooler seçili olsun
6. **Connection string'i kopyalayın:**
   ```
   postgresql://postgres.wznkjgmhtcxkmwxhfkxi:[YOUR-PASSWORD]@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
   ```
7. **`[YOUR-PASSWORD]` yerine şifrenizi yazın:** `Orhan2581`
8. **Son hali:**
   ```
   postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
   ```

---

## 📋 Toplanan Bilgileri Bana Verin

Aşağıdaki formata göre bilgileri paylaşın:

```
PROJECT_URL=https://wznkjgmhtcxkmwxhfkxi.supabase.co
ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[tam key]
SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...[tam key]
DATABASE_URL=postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

---

## ✅ Ben Ne Yapacağım?

Bilgileri aldıktan sonra:

1. ✅ `vercel.env` dosyasını güncelleyeceğim
2. ✅ Tüm environment variables'ı Vercel'e ekleyeceğim
3. ✅ Connection string'i doğru formatta ayarlayacağım
4. ✅ Test edip onaylayacağım

---

## 🚀 Alternatif: Interactive Script

Eğer bilgileri kendiniz eklemek isterseniz:

```powershell
powershell -ExecutionPolicy Bypass -File setup-vercel-env.ps1
```

Script size sorular soracak, siz cevaplayacaksınız, otomatik olarak Vercel'e ekleyecek!

---

## 📸 Ekran Görüntüleri Yardımcı Olabilir

Eğer adımlar net değilse, Supabase Dashboard'da:
- **Settings** → **API** ekran görüntüsü
- **Settings** → **Database** → **Connection string** ekran görüntüsü

Paylaşırsanız, hangi bilgileri nereden alacağınızı daha net gösterebilirim.

