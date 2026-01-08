# 📥 Vercel Environment Variables Import Rehberi

## 🚀 Tek Tıkla Import Etme

### Yöntem 1: Vercel CLI ile (Hızlı - Önerilen)

#### ADIM 1: Vercel CLI'ı Yükleyin (Eğer yoksa)

```bash
npm install -g vercel
```

#### ADIM 2: Vercel'e Login Olun

```bash
vercel login
```

#### ADIM 3: Environment Variables'ı Import Edin

```bash
# Proje klasöründe
cd "C:\Users\orhan\OneDrive\Masaüstü\BAHARTA"

# Environment variables'ı import et
vercel env pull .env.production
vercel env rm DATABASE_URL production preview development
vercel env add DATABASE_URL production preview development < vercel.env
```

**VEYA** manuel olarak her birini ekleyin:

```bash
# DATABASE_URL ekle
vercel env add DATABASE_URL production preview development

# Değeri yapıştırın:
postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

---

### Yöntem 2: Vercel Dashboard'dan (Manuel)

#### ADIM 1: Vercel Dashboard'a Git

1. **Vercel:** https://vercel.com/dashboard
2. **Projenizi seçin:** `baharat`
3. **Settings** → **Environment Variables**

#### ADIM 2: Toplu Ekleme

**⚠️ ÖNEMLİ:** Vercel Dashboard'da doğrudan `.env` dosyası import etme özelliği yok. Her variable'ı tek tek eklemeniz gerekiyor.

**Hızlı Yöntem:**
1. `vercel.env` dosyasını açın
2. Her satırı kopyalayıp Vercel Dashboard'a ekleyin
3. Veya aşağıdaki script'i kullanın

---

### Yöntem 3: Vercel CLI Script ile (Otomatik)

#### PowerShell Script (Windows)

```powershell
# vercel-import-env.ps1
# Vercel CLI ile tüm environment variables'ı otomatik ekler

Write-Host "🚀 Vercel Environment Variables Import Başlatılıyor..." -ForegroundColor Green

# Vercel login kontrolü
Write-Host "Vercel login kontrolü yapılıyor..." -ForegroundColor Yellow
vercel whoami 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel'e login olmalısınız!" -ForegroundColor Red
    Write-Host "Çalıştırın: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Vercel'e giriş yapılmış" -ForegroundColor Green

# .env dosyasını oku
$envFile = "vercel.env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ vercel.env dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host "📄 vercel.env dosyası okunuyor..." -ForegroundColor Yellow

# Her satırı işle
Get-Content $envFile | ForEach-Object {
    if ($_ -match '^\s*#') {
        # Yorum satırı, atla
        return
    }
    
    if ($_ -match '^([A-Z_]+)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        
        # Placeholder'ları atla
        if ($value -match 'YOUR_.*_HERE') {
            Write-Host "⚠️  $key atlandı (placeholder değer)" -ForegroundColor Yellow
            return
        }
        
        # Boş değerleri atla
        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "⚠️  $key atlandı (boş değer)" -ForegroundColor Yellow
            return
        }
        
        Write-Host "➕ $key ekleniyor..." -ForegroundColor Cyan
        
        # Vercel'e ekle (production, preview, development)
        echo $value | vercel env add $key production preview development
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $key eklendi" -ForegroundColor Green
        } else {
            Write-Host "❌ $key eklenirken hata oluştu" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "🎉 Environment Variables import işlemi tamamlandı!" -ForegroundColor Green
Write-Host "⚠️  Supabase key'leri için vercel.env dosyasını düzenleyip tekrar çalıştırın!" -ForegroundColor Yellow
```

#### Kullanımı:

```powershell
# PowerShell'de çalıştırın
powershell -ExecutionPolicy Bypass -File vercel-import-env.ps1
```

---

### Yöntem 4: Manual Bulk Add Script

Daha basit bir PowerShell script:

```powershell
# manual-vercel-env.ps1
# Vercel Dashboard'a kopyalamak için formatlanmış liste çıkarır

$envFile = "vercel.env"

Write-Host "📋 Vercel Dashboard'a kopyalamak için hazır liste:" -ForegroundColor Green
Write-Host ""

Get-Content $envFile | ForEach-Object {
    if ($_ -match '^([A-Z_]+)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        
        if (-not ($value -match 'YOUR_.*_HERE') -and -not ([string]::IsNullOrWhiteSpace($value))) {
            Write-Host "─────────────────────────────────────" -ForegroundColor Cyan
            Write-Host "Key: $key" -ForegroundColor Yellow
            Write-Host "Value: $value" -ForegroundColor White
            Write-Host ""
        }
    }
}
```

---

## 📝 ÖNEMLİ ADIMLAR

### 1. Supabase Key'lerini Ekleyin

`vercel.env` dosyasındaki şu satırları düzenleyin:

```env
# Supabase Dashboard > Settings > API > anon public key'den alın
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY_HERE

# Supabase Dashboard > Settings > API > service_role secret key'den alın
SUPABASE_SERVICE_ROLE_KEY=YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE
```

### 2. Vercel CLI ile Import Edin

```bash
vercel login
vercel env add DATABASE_URL production preview development
# Değeri yapıştırın: postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres
```

Her variable için tekrar edin.

### 3. REDEPLOY Yapın

Vercel Dashboard → Deployments → Redeploy

---

## ✅ Kontrol Listesi

- [ ] `vercel.env` dosyası hazır
- [ ] Supabase key'leri eklendi (ANON_KEY, SERVICE_ROLE_KEY)
- [ ] Vercel CLI yüklü (`npm install -g vercel`)
- [ ] Vercel'e login olundu (`vercel login`)
- [ ] Environment variables eklendi
- [ ] REDEPLOY yapıldı
- [ ] Test edildi

---

## 🎯 Özet

1. ✅ `vercel.env` dosyasını hazırladım
2. ✅ Supabase key'lerini manuel eklemeniz gerekiyor
3. ✅ Vercel CLI ile veya Dashboard'dan import edin
4. ✅ REDEPLOY yapın

**En Hızlı Yöntem:** Vercel CLI kullanarak her variable'ı tek tek ekleyin!

