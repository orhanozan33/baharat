# 🔗 Doğru URL'ler

## ❌ YANLIŞ URL (Web Sitesi Değil!)
```
https://wznkjgmhtcxkmwxhfkxi.supabase.co/
```
**Bu bir API endpoint'i, web sitesi değil!** Bu yüzden "requested path is invalid" hatası veriyor.

---

## ✅ DOĞRU URL'LER

### 🚀 Ana Uygulama URL'leri (Vercel)

#### Ana Sayfa (Türkçe)
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/tr
```

#### Ana Sayfa (İngilizce)
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/en
```

#### Ana Sayfa (Fransızca)
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/fr
```

---

### 🔌 API Endpoint'leri (Vercel)

#### Products API
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
```
**Beklenen:** JSON formatında ürün listesi

#### Categories API
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/categories
```
**Beklenen:** JSON formatında kategori listesi

#### Database Health Check
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/health/database
```
**Beklenen:** Database bağlantı durumu

---

### 🔐 Admin Panel

#### Admin Login
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/admin/login
```

#### Admin Dashboard
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/admin/dashboard
```

---

### 🏪 Dealer Panel

#### Dealer Login
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/dealer/login
```

#### Dealer Dashboard
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/dealer/dashboard
```

---

## 📋 Supabase URL'leri (Sadece Config için)

### Supabase Dashboard
```
https://supabase.com/dashboard/project/wznkjgmhtcxkmwxhfkxi
```

### Supabase API URL (Kod için)
```
https://wznkjgmhtcxkmwxhfkxi.supabase.co
```
⚠️ **Bu URL'ye direkt tarayıcıdan gitmeyin!** Bu sadece API endpoint'i.

### Supabase Database URL (Connection String)
```
postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres
```
⚠️ **Bu connection string'i Vercel Environment Variables'a ekleyin, tarayıcıdan açmayın!**

---

## 🧪 Test Etmek İçin

1. **Ana sayfayı açın:**
   ```
   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/tr
   ```
   Beklenen: Ürün kartları görünmeli

2. **API'yi test edin:**
   ```
   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
   ```
   Beklenen: JSON response

3. **Database bağlantısını test edin:**
   ```
   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/health/database
   ```
   Beklenen: Database connection durumu

---

## 🎯 Özet

- ✅ **Vercel URL'leri:** Tarayıcıdan açılabilir
- ❌ **Supabase URL'leri:** Sadece API/config için, tarayıcıdan açılmaz
- 🔗 **Production URL:** `https://baharat-e9n4lcvjx-orhanozan33.vercel.app`

