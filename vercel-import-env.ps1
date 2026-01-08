# Vercel Environment Variables Import Script
# PowerShell script to automatically add environment variables to Vercel

Write-Host "🚀 Vercel Environment Variables Import Başlatılıyor..." -ForegroundColor Green
Write-Host ""

# Vercel CLI kontrolü
Write-Host "📦 Vercel CLI kontrolü yapılıyor..." -ForegroundColor Yellow
$vercelCheck = Get-Command vercel -ErrorAction SilentlyContinue
if (-not $vercelCheck) {
    Write-Host "❌ Vercel CLI bulunamadı!" -ForegroundColor Red
    Write-Host "📥 Yüklemek için: npm install -g vercel" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Vercel CLI yüklü" -ForegroundColor Green
Write-Host ""

# Vercel login kontrolü
Write-Host "🔐 Vercel login kontrolü yapılıyor..." -ForegroundColor Yellow
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Vercel'e login olmalısınız!" -ForegroundColor Red
    Write-Host "🔑 Çalıştırın: vercel login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Vercel'e giriş yapılmış: $whoami" -ForegroundColor Green
Write-Host ""

# .env dosyasını oku
$envFile = "vercel.env"
if (-not (Test-Path $envFile)) {
    Write-Host "❌ vercel.env dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

Write-Host "📄 vercel.env dosyası okunuyor..." -ForegroundColor Yellow
Write-Host ""

$variables = @()
$skipped = @()

Get-Content $envFile | ForEach-Object {
    $line = $_.Trim()
    
    # Yorum satırı veya boş satır atla
    if ($line -match '^\s*#' -or [string]::IsNullOrWhiteSpace($line)) {
        return
    }
    
    # KEY=VALUE formatını parse et
    if ($line -match '^([A-Z_][A-Z0-9_]*)=(.*)$') {
        $key = $matches[1]
        $value = $matches[2]
        
        # Placeholder değerleri atla
        if ($value -match 'YOUR_.*_HERE') {
            $skipped += @{
                Key = $key
                Reason = "Placeholder değer - manuel eklenmeli"
            }
            return
        }
        
        # Boş değerleri atla
        if ([string]::IsNullOrWhiteSpace($value)) {
            $skipped += @{
                Key = $key
                Reason = "Boş değer"
            }
            return
        }
        
        $variables += @{
            Key = $key
            Value = $value
        }
    }
}

Write-Host "📊 Bulunan environment variables: $($variables.Count)" -ForegroundColor Cyan
if ($skipped.Count -gt 0) {
    Write-Host "⚠️  Atlanan variables: $($skipped.Count)" -ForegroundColor Yellow
}
Write-Host ""

# Kullanıcıya onay iste
Write-Host "⚠️  Devam etmek için onay verin..." -ForegroundColor Yellow
Write-Host "Bu işlem şu variables'ları ekleyecek:" -ForegroundColor White
$variables | ForEach-Object {
    Write-Host "  - $($_.Key)" -ForegroundColor Gray
}
Write-Host ""
$confirmation = Read-Host "Devam etmek istiyor musunuz? (E/H)"
if ($confirmation -ne "E" -and $confirmation -ne "e") {
    Write-Host "❌ İşlem iptal edildi." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔄 Variables ekleniyor..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($var in $variables) {
    Write-Host "➕ $($var.Key) ekleniyor..." -ForegroundColor Yellow
    
    # Vercel'e ekle
    echo $var.Value | vercel env add $var.Key production preview development
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ $($var.Key) başarıyla eklendi" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host "  ❌ $($var.Key) eklenirken hata oluştu" -ForegroundColor Red
        $failCount++
    }
    Write-Host ""
}

# Özet
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host "📊 Import Özeti:" -ForegroundColor White
Write-Host "  ✅ Başarılı: $successCount" -ForegroundColor Green
Write-Host "  ❌ Başarısız: $failCount" -ForegroundColor Red
if ($skipped.Count -gt 0) {
    Write-Host "  ⚠️  Atlanan: $($skipped.Count)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Atlanan variables:" -ForegroundColor Yellow
    $skipped | ForEach-Object {
        Write-Host "  - $($_.Key): $($_.Reason)" -ForegroundColor Gray
    }
}
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🎉 Environment variables başarıyla eklendi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  ÖNEMLİ: Vercel Dashboard'dan REDEPLOY yapmalısınız!" -ForegroundColor Yellow
    Write-Host "   Deployments > ... > Redeploy" -ForegroundColor Yellow
    Write-Host ""
}

if ($skipped.Count -gt 0) {
    Write-Host "📝 Supabase key'leri için vercel.env dosyasını düzenleyip tekrar çalıştırın!" -ForegroundColor Cyan
    Write-Host ""
}

