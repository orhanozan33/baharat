# Ürün ve Kategori Ekleme Rehberi

## Durum
✅ Tablolar oluşturuldu
✅ Admin kullanıcı var
❌ Kategoriler boş
❌ Ürünler boş

---

## Yöntem 1: API ile Toplu Ürün Ekleme (ÖNERİLEN)

### Adım 1: Admin ile Giriş Yap ve Token Al

**Postman veya tarayıcı console'da:**

```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/auth/login
```

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Response'dan `token` değerini kopyalayın!**

---

### Adım 2: Kategorileri Ekle (Opsiyonel)

Ürünler kategori olmadan da eklenebilir, ama kategoriler varsa daha iyi.

**Postman'de:**

```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/admin/categories
```

**Headers:**
```
Authorization: Bearer [TOKEN]
Content-Type: application/json
```

**Body (JSON) - Her kategori için ayrı istek:**
```json
{
  "name": "Baharatlar",
  "slug": "baharatlar",
  "description": "Baharat kategorisi"
}
```

**Örnek Kategoriler:**
```json
// 1. Baharatlar
{
  "name": "Baharatlar",
  "slug": "baharatlar",
  "description": "Baharat kategorisi"
}

// 2. Biberler
{
  "name": "Biberler",
  "slug": "biberler",
  "description": "Biber kategorisi"
}

// 3. Soslar
{
  "name": "Soslar",
  "slug": "soslar",
  "description": "Sos kategorisi"
}
```

---

### Adım 3: Toplu Ürün Ekleme

**Postman'de:**

```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/admin/products/replace-all
```

**Headers:**
```
Authorization: Bearer [TOKEN]
Content-Type: application/json
```

**Body:** Boş bırakın (endpoint kendi içinde ürün verilerini kullanır)

**Response:**
```json
{
  "message": "Products replaced successfully with variants",
  "created": 50,
  "errors": 0,
  "groups": 10
}
```

Bu endpoint `app/api/admin/products/product-data.ts` dosyasındaki tüm ürünleri ekler!

---

## Yöntem 2: Admin Panel'den Manuel Ekleme

### Adım 1: Admin Panel'e Giriş

1. Tarayıcıda: `https://baharat-e9n4lcvjx-orhanozan33.vercel.app/admin/login`
2. Email ve şifre ile giriş yapın

### Adım 2: Kategori Ekleme

1. Sol menüden **Kategori Yönetimi** → **Yeni Kategori**
2. Kategori bilgilerini doldurun
3. **Kaydet**

### Adım 3: Ürün Ekleme

1. Sol menüden **Ürün Yönetimi** → **Yeni Ürün**
2. Ürün bilgilerini doldurun:
   - Ürün Adı
   - Slug (otomatik oluşur)
   - SKU
   - Fiyat
   - Stok
   - Kategori (opsiyonel)
   - Açıklama
3. **Kaydet**

---

## Yöntem 3: Hızlı Test - Tek Ürün Ekleme

**Postman'de:**

```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/admin/products
```

**Headers:**
```
Authorization: Bearer [TOKEN]
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Isot Pepper 50g",
  "slug": "isot-pepper-50g",
  "sku": "PROD-0001",
  "price": 0.70,
  "stock": 1000,
  "description": "Isot Pepper - Zipli Ambalaj - 50g",
  "shortDescription": "Zipli Ambalaj - 50g",
  "isActive": true,
  "isFeatured": false,
  "unit": "g",
  "weight": 50
}
```

---

## Hızlı Başlangıç (Postman Collection)

### 1. Login
```
POST /api/auth/login
Body: { "email": "admin@example.com", "password": "admin123" }
→ Token'ı kopyala
```

### 2. Kategorileri Ekle (Opsiyonel)
```
POST /api/admin/categories
Headers: Authorization: Bearer [TOKEN]
Body: { "name": "Baharatlar", "slug": "baharatlar" }
```

### 3. Toplu Ürün Ekle
```
POST /api/admin/products/replace-all
Headers: Authorization: Bearer [TOKEN]
Body: {} (boş)
```

---

## Kontrol

### Ürünleri Kontrol Et

```bash
GET https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products
```

Response'da ürünler görünmeli!

### Ana Sayfada Kontrol

Tarayıcıda:
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/tr
```

Ürün kartları görünmeli!

---

## Sorun Giderme

### "Unauthorized" hatası
**Çözüm:** Token'ın doğru olduğundan emin olun, yeniden login yapın

### "Products not found"
**Çözüm:** Ürünleri ekledikten sonra sayfayı yenileyin

### "Category not found"
**Çözüm:** Kategoriler opsiyonel, ürünler kategori olmadan da eklenebilir

---

## Özet

1. ✅ **Admin ile giriş yap** → Token al
2. ✅ **Kategorileri ekle** (opsiyonel)
3. ✅ **Toplu ürün ekle** → `/api/admin/products/replace-all`
4. ✅ **Kontrol et** → Ana sayfada ürünler görünmeli

**En Hızlı Yöntem:** Yöntem 1 - API ile toplu ürün ekleme!

