# Admin Kullanıcı Oluşturma Rehberi

## Durum
✅ Tablolar oluşturuldu
❌ Admin kullanıcı yok

---

## Yöntem 1: API ile Admin Oluşturma (ÖNERİLEN)

### Adım 1: Önce Normal Kullanıcı Oluştur

**Postman veya tarayıcı console'da:**

```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/auth/register
```

**Body (JSON):**
```json
{
  "email": "admin@example.com",
  "password": "admin123",
  "name": "Admin User",
  "role": "ADMIN"
}
```

**Response:**
```json
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  },
  "token": "..."
}
```

### Adım 2: Admin Kaydı Oluştur

**Giriş yapın ve token alın:**
```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/auth/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Token'ı kopyalayın, sonra:**
```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/admin/create-admin
```

**Headers:**
```
Authorization: Bearer [TOKEN]
```

**Body:**
```json
{
  "fullName": "Admin User"
}
```

---

## Yöntem 2: Supabase SQL Editor ile Admin Oluşturma

### Adım 1: Supabase SQL Editor'e Git

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. **Projenizi seçin**: `wznkjgmhtcxkmwxhfkxi`
3. **SQL Editor** → **New Query**

### Adım 2: Admin Kullanıcı SQL'i

**Şifre hash'i için önce bcrypt kullanmanız gerekiyor, ama basit yöntem:**

```sql
-- 1. User oluştur (şifre olmadan, sonra API ile değiştirilebilir)
INSERT INTO users (id, "supabaseId", email, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  gen_random_uuid()::text,
  'admin@example.com',
  'Admin User',
  'ADMIN',
  NOW(),
  NOW()
)
RETURNING id;

-- 2. Admin kaydı oluştur (yukarıdaki user id'sini kullan)
INSERT INTO admins (id, "userId", "fullName", permissions, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  u.id,
  'Admin User',
  ARRAY[]::text[],
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'admin@example.com';
```

### Adım 3: Şifre Belirleme

**API ile şifre belirleyin:**
```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/auth/register
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

**Not:** Eğer kullanıcı zaten varsa, şifre güncelleme endpoint'i gerekebilir.

---

## Yöntem 3: Mevcut Kullanıcıyı Admin Yapma

Eğer zaten bir kullanıcı varsa:

### SQL ile:

```sql
-- 1. Kullanıcının role'ünü ADMIN yap
UPDATE users 
SET role = 'ADMIN', "updatedAt" = NOW()
WHERE email = 'mevcut@email.com';

-- 2. Admin kaydı oluştur
INSERT INTO admins (id, "userId", "fullName", permissions, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  u.id,
  u.name,
  ARRAY[]::text[],
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'mevcut@email.com'
AND NOT EXISTS (
  SELECT 1 FROM admins a WHERE a."userId" = u.id
);
```

---

## Hızlı Test

### 1. Admin Giriş Testi

```bash
POST https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/auth/login
```

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

### 2. Admin Panel Erişimi

Tarayıcıda:
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app/admin
```

Giriş yapabilmelisiniz!

---

## Sorun Giderme

### "Email already registered"
**Çözüm:** Farklı bir email kullanın veya mevcut kullanıcıyı admin yapın (Yöntem 3)

### "Unauthorized" hatası
**Çözüm:** Token'ın doğru olduğundan emin olun, cookie'de saklanıyor olabilir

### "User not found"
**Çözüm:** Önce user oluşturun, sonra admin kaydı ekleyin

---

## Özet

1. ✅ **API ile** (En Kolay): `/api/auth/register` → `/api/admin/create-admin`
2. ✅ **SQL ile**: Supabase SQL Editor'de user ve admin kaydı oluştur
3. ✅ **Mevcut kullanıcıyı admin yap**: SQL ile role güncelle + admin kaydı ekle

**Önerilen:** Yöntem 1 (API ile) - En güvenli ve kolay!

