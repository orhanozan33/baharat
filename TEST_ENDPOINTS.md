# 🧪 Test Endpoints

## Database Health Check
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/health/database
```
**Beklenen:** JSON response (database connection durumu)

---

## Public API Endpoints (Herkes erişebilir)

### 1. Products List
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
```
**Beklenen:** JSON formatında ürün listesi
```json
{
  "products": [...],
  "pagination": {...}
}
```

### 2. Categories List
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/categories
```
**Beklenen:** JSON formatında kategori listesi
```json
{
  "categories": [...]
}
```

---

## Ana Sayfalar

### 1. Ana Sayfa (TR)
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/tr
```

### 2. Ana Sayfa (EN)
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/en
```

### 3. Ana Sayfa (FR)
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/fr
```

---

## Sorun Giderme

### 404 Hatası Alıyorsanız:

1. **Vercel deploy durumunu kontrol edin:**
   - Vercel Dashboard → Deployments
   - En son deployment'ın "Ready" durumunda olduğundan emin olun

2. **Doğru URL'yi kullandığınızdan emin olun:**
   - URL'de `/api/` ile başlayan endpoint'ler
   - Veya `/[locale]` ile başlayan sayfalar

3. **Tarayıcı console'unu kontrol edin:**
   - F12 → Console
   - Hata mesajlarını okuyun

---

## Hızlı Test

Tarayıcıda şu URL'yi açın:
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
```

**Eğer hata alıyorsanız:**
- 404: Route bulunamadı (deploy sorunu olabilir)
- 500: Server hatası (database connection vb.)
- JSON response: ✅ Çalışıyor!

