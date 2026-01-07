# Vercel Environment Variables Setup

## Gerekli Environment Variables

Vercel Dashboard → Project Settings → Environment Variables bölümüne aşağıdaki değişkenleri ekleyin:

### 1. DATABASE_URL (ZORUNLU)
```
postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres
```
- **Açıklama**: PostgreSQL veritabanı bağlantı string'i
- **Environment**: Production, Preview, Development (hepsini seçin)

### 2. JWT_SECRET (ZORUNLU)
```
your-super-secret-jwt-key-change-this-in-production
```
- **Açıklama**: JWT token şifreleme için secret key
- **Not**: Güçlü bir random string kullanın (en az 32 karakter)
- **Environment**: Production, Preview, Development (hepsini seçin)

### 3. NEXT_PUBLIC_SUPABASE_URL (ZORUNLU)
```
https://wznkjgmhtcxkmwxhfkxi.supabase.co
```
- **Açıklama**: Supabase project URL
- **Environment**: Production, Preview, Development (hepsini seçin)

### 4. NEXT_PUBLIC_SUPABASE_ANON_KEY (ZORUNLU)
```
[Supabase Dashboard'dan alın - Settings → API → anon/public key]
```
- **Açıklama**: Supabase anonymous/public key
- **Environment**: Production, Preview, Development (hepsini seçin)

### 5. SUPABASE_SERVICE_ROLE_KEY (ZORUNLU)
```
[Supabase Dashboard'dan alın - Settings → API → service_role key]
```
- **Açıklama**: Supabase service role key (admin işlemleri için)
- **Not**: Bu key'i asla client-side'da kullanmayın!
- **Environment**: Production, Preview, Development (hepsini seçin)

### 6. NEXT_PUBLIC_APP_URL (OPSİYONEL)
```
https://baharat-e9n4lcvjx-orhanozan33.vercel.app
```
veya özel domain'iniz:
```
https://yourdomain.com
```
- **Açıklama**: Uygulamanızın public URL'i
- **Not**: Vercel otomatik olarak ayarlayabilir, ama manuel de ekleyebilirsiniz
- **Environment**: Production, Preview, Development (hepsini seçin)

### 7. JWT_EXPIRES_IN (OPSİYONEL)
```
7d
```
- **Açıklama**: JWT token'ın geçerlilik süresi
- **Varsayılan**: 7d (7 gün)
- **Environment**: Production, Preview, Development (hepsini seçin)

---

## Vercel'de Nasıl Eklenir?

1. **Vercel Dashboard'a gidin**: https://vercel.com/dashboard
2. **Projenizi seçin**: `baharat`
3. **Settings → Environment Variables** bölümüne gidin
4. Her bir variable için:
   - **Key**: Variable adını girin (örn: `DATABASE_URL`)
   - **Value**: Değeri girin
   - **Environment**: Production, Preview, Development'ı seçin
   - **Add** butonuna tıklayın

5. **Redeploy**: Environment variables eklendikten sonra yeni bir deployment başlatın

---

## Supabase Keys Nasıl Bulunur?

1. **Supabase Dashboard**: https://supabase.com/dashboard
2. **Projenizi seçin**: `wznkjgmhtcxkmwxhfkxi`
3. **Settings → API** bölümüne gidin
4. **Project URL**: `NEXT_PUBLIC_SUPABASE_URL` için kullanın
5. **anon public key**: `NEXT_PUBLIC_SUPABASE_ANON_KEY` için kullanın
6. **service_role key**: `SUPABASE_SERVICE_ROLE_KEY` için kullanın (⚠️ Gizli tutun!)

---

## Önemli Notlar

- ✅ Tüm environment variables'ı **Production, Preview, Development** için ekleyin
- ✅ `NEXT_PUBLIC_*` ile başlayan değişkenler client-side'da kullanılabilir
- ⚠️ `SUPABASE_SERVICE_ROLE_KEY` ve `JWT_SECRET` gibi gizli key'leri asla client-side'da kullanmayın
- 🔄 Environment variables eklendikten sonra **mutlaka redeploy** yapın

---

## Hızlı Kontrol Listesi

- [ ] DATABASE_URL eklendi
- [ ] JWT_SECRET eklendi (güçlü bir key)
- [ ] NEXT_PUBLIC_SUPABASE_URL eklendi
- [ ] NEXT_PUBLIC_SUPABASE_ANON_KEY eklendi
- [ ] SUPABASE_SERVICE_ROLE_KEY eklendi
- [ ] NEXT_PUBLIC_APP_URL eklendi (opsiyonel)
- [ ] Tüm environment'lar için seçildi (Production, Preview, Development)
- [ ] Redeploy yapıldı

