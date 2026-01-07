# BAHARTA E-Ticaret Platformu

Modern, ölçeklenebilir ve kurumsal bir e-ticaret platformu. Next.js 14 App Router, TypeScript, TypeORM ve PostgreSQL ile geliştirilmiştir.

## 🚀 Özellikler

### Genel Kullanıcı (Frontend)
- ✅ Ana sayfa (3 dil desteği: TR, EN, FR)
- ✅ Ürün listeleme ve filtreleme
- ✅ Ürün detay sayfası
- ✅ Sepet yönetimi
- ✅ Sipariş oluşturma
- ✅ Responsive tasarım (mobil + desktop)
- ✅ SEO uyumlu
- ✅ Çoklu dil desteği (Türkçe, İngilizce, Fransızca)

### Admin Panel
- ✅ Admin girişi
- ✅ Dashboard (istatistikler)
- ✅ Ürün yönetimi (CRUD)
- ✅ Kategori yönetimi
- ✅ Bayi yönetimi
- ✅ Sipariş yönetimi
- ✅ Sipariş durumu güncelleme

### Bayi (Dealer) Panel
- ✅ Bayi girişi
- ✅ Dashboard
- ✅ Kendi ürünlerini görüntüleme (özel fiyatlarla)
- ✅ Sipariş oluşturma
- ✅ Sipariş geçmişi

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes (REST)
- **Database**: PostgreSQL
- **ORM**: TypeORM
- **Auth**: JWT (Admin & Dealer & User)
- **i18n**: next-intl (TR, EN, FR)
- **Hosting**: Vercel (hazır)

## 📁 Proje Yapısı

```
BAHARTA/
├── app/                    # Next.js App Router
│   ├── [locale]/          # Çoklu dil desteği
│   ├── api/               # API endpoints
│   ├── admin/             # Admin panel pages
│   └── dealer/            # Dealer panel pages
├── components/            # React components
├── entities/              # TypeORM entities
│   └── enums/            # Enum tanımları
├── lib/                   # Utility libraries
│   ├── database.ts       # TypeORM DataSource
│   └── db.ts             # Repository helpers
├── messages/             # i18n çeviri dosyaları
└── middleware.ts         # Next.js middleware
```

## 🗄️ Database Schema (TypeORM Entities)

- **User**: Genel kullanıcılar
- **Admin**: Admin kullanıcıları
- **Dealer**: Bayi kullanıcıları
- **Product**: Ürünler
- **Category**: Kategoriler (hierarchical)
- **Order**: Siparişler
- **OrderItem**: Sipariş kalemleri
- **DealerProduct**: Bayi özel fiyatlandırma

## 🚦 Kurulum

### 1. Bağımlılıkları Yükle

```bash
npm install
```

### 2. PostgreSQL Veritabanı Oluştur

```bash
psql -U postgres
CREATE DATABASE baharat;
\q
```

### 3. Environment Variables

`.env` dosyası oluşturun:

```env
# Database (Local PostgreSQL)
DATABASE_URL=postgresql://postgres:password@localhost:5432/baharat

# JWT
JWT_SECRET=your-secret-key-change-in-production-min-32-characters
JWT_EXPIRES_IN=7d

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Database Setup

TypeORM otomatik olarak tabloları oluşturacak (development modunda `synchronize: true`).

**Not:** Production'da `synchronize: false` yapın ve migrations kullanın.

### 5. Development Server

```bash
npm run dev
```

Uygulama **Turbopack** ile http://localhost:3000 adresinde çalışacak ve otomatik olarak `/tr`'ye yönlendirecek.

**Not:** Sistem Turbopack ile optimize edilmiştir. Webpack kullanmak isterseniz:
```bash
npm run dev:webpack
```

## 🌍 Çoklu Dil Desteği

- Türkçe (TR): `/tr`
- İngilizce (EN): `/en`
- Fransızca (FR): `/fr`

Navbar'dan dil değiştirilebilir.

## 🔐 Authentication

### Roller

- **USER**: Normal kullanıcı
- **ADMIN**: Admin panel erişimi
- **DEALER**: Bayi panel erişimi

### Auth Flow

1. Kullanıcı email/password ile giriş yapar
2. Backend, kullanıcıyı database'de kontrol eder
3. JWT token oluşturulur ve cookie'de saklanır
4. API isteklerinde JWT token ile yetkilendirme yapılır

## 📦 API Endpoints

### Public Endpoints
- `GET /api/products` - Ürünleri listele
- `GET /api/products/[slug]` - Ürün detayı
- `GET /api/categories` - Kategorileri listele
- `GET /api/categories/[slug]` - Kategori detayı

### Auth Endpoints
- `POST /api/auth/login` - Giriş yap
- `POST /api/auth/register` - Kayıt ol
- `POST /api/auth/logout` - Çıkış yap
- `GET /api/auth/check-role` - Rol kontrolü

### User Endpoints (Auth Required)
- `GET /api/orders` - Siparişleri listele
- `POST /api/orders` - Sipariş oluştur

### Admin Endpoints (Admin Required)
- `GET /api/admin/dashboard` - Dashboard istatistikleri
- `GET /api/admin/products` - Ürünleri listele
- `POST /api/admin/products` - Yeni ürün oluştur
- `GET /api/admin/products/[id]` - Ürün detayı
- `PUT /api/admin/products/[id]` - Ürün güncelle
- `DELETE /api/admin/products/[id]` - Ürün sil
- `GET /api/admin/categories` - Kategorileri listele
- `POST /api/admin/categories` - Yeni kategori oluştur
- `GET /api/admin/orders` - Tüm siparişleri listele
- `PATCH /api/admin/orders/[id]` - Sipariş durumu güncelle
- `GET /api/admin/dealers` - Bayileri listele

### Dealer Endpoints (Dealer Required)
- `GET /api/dealer/dashboard` - Bayi dashboard
- `GET /api/dealer/products` - Bayi ürünleri (özel fiyatlarla)
- `GET /api/dealer/orders` - Bayi siparişleri
- `POST /api/dealer/orders` - Bayi siparişi oluştur

## 🚢 Deployment

### Vercel'e Deploy

1. GitHub repository'sine push edin
2. Vercel'e bağlayın
3. Environment variables'ları ekleyin
4. Deploy edin

**Önemli:** Production'da `.env` dosyasında `synchronize: false` yapın ve migrations kullanın.

## 📝 Notlar

### Lokal Development
- TypeORM `synchronize: true` ile otomatik tablo oluşturma yapıyor
- İlk admin kullanıcıyı manuel olarak database'e eklemeniz gerekir

### Production Deployment
- TypeORM `synchronize: false` yapılmalı
- Migrations kullanılmalı
- Database connection pooling yapılandırılmalı

## 🔄 Sonraki Adımlar

- [ ] Tüm API route'larını TypeORM'e çevirme (devam ediyor)
- [ ] Image upload entegrasyonu
- [ ] Email notification sistemi
- [ ] Ödeme gateway entegrasyonu
- [ ] Advanced search ve filtreleme
- [ ] Product reviews ve ratings
- [ ] Wishlist özelliği

## 📄 Lisans

Bu proje özel bir projedir.
