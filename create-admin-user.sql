-- ============================================
-- ADMIN KULLANICI OLUŞTURMA SQL
-- Supabase SQL Editor'de çalıştırın
-- ============================================

-- 1. Admin User oluştur
INSERT INTO users (id, "supabaseId", email, name, role, "createdAt", "updatedAt")
VALUES (
  gen_random_uuid()::text,
  gen_random_uuid()::text,
  'admin@example.com',  -- Email'i değiştirin
  'Admin User',         -- İsmi değiştirin
  'ADMIN',
  NOW(),
  NOW()
)
ON CONFLICT (email) DO UPDATE
SET role = 'ADMIN', "updatedAt" = NOW()
RETURNING id, email;

-- 2. Admin kaydı oluştur (eğer yoksa)
INSERT INTO admins (id, "userId", "fullName", permissions, "createdAt", "updatedAt")
SELECT 
  gen_random_uuid()::text,
  u.id,
  COALESCE(u.name, 'Admin User'),
  ARRAY[]::text[],
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'admin@example.com'  -- Email'i değiştirin
AND u.role = 'ADMIN'
AND NOT EXISTS (
  SELECT 1 FROM admins a WHERE a."userId" = u.id
)
RETURNING id, "userId", "fullName";

-- 3. Kontrol: Admin kullanıcıyı göster
SELECT 
  u.id,
  u.email,
  u.name,
  u.role,
  a.id as admin_id,
  a."fullName"
FROM users u
LEFT JOIN admins a ON a."userId" = u.id
WHERE u.email = 'admin@example.com'  -- Email'i değiştirin
AND u.role = 'ADMIN';

-- ============================================
-- ÖNEMLİ NOTLAR:
-- ============================================
-- 1. Email'i kendi email'inizle değiştirin
-- 2. İsmi kendi isminizle değiştirin
-- 3. Şifre için API kullanın: /api/auth/register
-- 4. Veya mevcut kullanıcı varsa, sadece role'ü güncelleyin

