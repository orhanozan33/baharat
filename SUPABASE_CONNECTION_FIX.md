# 🔧 Supabase Connection Timeout Çözümü

## ❌ Hata
```
connect ETIMEDOUT 2600:1f11:4e2:e200:c707:bcea:3077:7a65:5432
```

**Sebep:** Supabase'e bağlanılamıyor. IPv6 adresi timeout veriyor.

---

## ✅ ÇÖZÜM: Supabase Connection Pooling Kullan

Supabase, direct connection yerine **Connection Pooling** kullanmanızı önerir.

### ADIM 1: Supabase Connection Pooling URL'i Al

1. **Supabase Dashboard:** https://supabase.com/dashboard
2. **Projenizi seçin:** `wznkjgmhtcxkmwxhfkxi`
3. **Settings** → **Database** bölümüne gidin
4. **Connection string** bölümünde **Connection pooling** sekmesini seçin
5. **URI** formatını kopyalayın

**Connection Pooling URL Formatı:**
```
postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

**Önemli Farklar:**
- Port: `6543` (pooling için) veya `5432` (direct connection için)
- Host: `aws-0-us-east-1.pooler.supabase.com` (pooling) veya `db.wznkjgmhtcxkmwxhfkxi.supabase.co` (direct)

---

### ADIM 2: .env Dosyasını Güncelle

`.env` dosyasındaki `DATABASE_URL`'i Connection Pooling URL'i ile değiştirin:

```env
# Supabase Connection Pooling (Önerilen)
DATABASE_URL=postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# VEYA Direct Connection (Port 5432)
DATABASE_URL=postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres?sslmode=require
```

---

### ADIM 3: SSL Mode Ekle

Connection string'e `?sslmode=require` ekleyin:

```env
DATABASE_URL=postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres?sslmode=require
```

---

### ADIM 4: IPv6 Sorununu Çöz

Windows'ta IPv6 sorunları olabilir. IPv4 kullanmak için connection string'e şunu ekleyin:

```env
DATABASE_URL=postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres?sslmode=require&connect_timeout=30
```

---

### ADIM 5: Development Server'ı Yeniden Başlat

```bash
# Ctrl+C ile durdurun
npm run dev
```

---

## 🔍 Alternatif Çözümler

### Çözüm A: Supabase Connection Pooling (Önerilen)

**Avantajlar:**
- Daha hızlı bağlantı
- Daha iyi performans
- Connection limiti sorunları yok

**Connection String:**
```
postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Çözüm B: Direct Connection + SSL Mode

**Connection String:**
```
postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres?sslmode=require
```

### Çözüm C: IPv4 Force

Eğer IPv6 sorunu varsa, `.env` dosyasına ekleyin:
```env
PGHOST=db.wznkjgmhtcxkmwxhfkxi.supabase.co
PGPORT=5432
PGUSER=postgres
PGPASSWORD=Orhan2581
PGDATABASE=postgres
PGSSLMODE=require
```

---

## ✅ TEST

Server'ı yeniden başlattıktan sonra:

1. **Health Check:**
   ```
   http://localhost:3000/api/health/database
   ```

2. **Categories API:**
   ```
   http://localhost:3000/api/categories
   ```

---

## 🎯 Özet

1. ✅ Supabase Dashboard'dan Connection Pooling URL'i al
2. ✅ `.env` dosyasındaki `DATABASE_URL`'i güncelle
3. ✅ `?sslmode=require` ekle
4. ✅ Server'ı yeniden başlat
5. ✅ Test et

---

## 📞 DesteK

Eğer hala bağlanamıyorsanız:

1. Supabase Dashboard → **Database** → **Connection string** kontrol edin
2. **Connection pooling** sekmesini kullanmayı deneyin
3. Supabase projenizin **Settings** → **Database** → **Connection pooling** aktif mi kontrol edin

