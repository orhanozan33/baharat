# Vercel'de Eksik Environment Variables'ları Tamamlama Script'i
# Supabase otomatik ekledi, şimdi eksikleri ekleyelim

Write-Host "🔧 Vercel'de Eksik Environment Variables'ları Tamamlama" -ForegroundColor Green
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

# Eksik environment variables listesi
$missingVars = @(
    @{
        Key = "DATABASE_URL"
        Value = "postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"
        Description = "Supabase PostgreSQL Connection String (Session Pooler)"
    },
    @{
        Key = "JWT_SECRET"
        Value = "baharat-super-secret-jwt-key-2024-production-min-32-chars-long"
        Description = "JWT Secret Key (Minimum 32 karakter)"
    },
    @{
        Key = "JWT_EXPIRES_IN"
        Value = "7d"
        Description = "JWT Token Expiration"
    },
    @{
        Key = "NODE_ENV"
        Value = "production"
        Description = "Node Environment"
    },
    @{
        Key = "NEXT_PUBLIC_APP_URL"
        Value = "https://baharat-e9n4lcvjx-orhanozan33.vercel.app"
        Description = "Application URL (Vercel deployment URL)"
    },
    @{
        Key = "FRONTEND_URL"
        Value = "https://baharat-e9n4lcvjx-orhanozan33.vercel.app"
        Description = "Frontend URL (Opsiyonel)"
    }
)

Write-Host "📋 Eklenecek Environment Variables:" -ForegroundColor Cyan
Write-Host ""
foreach ($var in $missingVars) {
    Write-Host "  • $($var.Key)" -ForegroundColor White
    Write-Host "    $($var.Description)" -ForegroundColor Gray
}
Write-Host ""

# Kullanıcıya onay iste
Write-Host "⚠️  Devam etmek için onay verin..." -ForegroundColor Yellow
$confirmation = Read-Host "Tüm variables'ları eklemek istiyor musunuz? (E/H)"
if ($confirmation -ne "E" -and $confirmation -ne "e") {
    Write-Host "❌ İşlem iptal edildi." -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "🔄 Variables ekleniyor..." -ForegroundColor Cyan
Write-Host ""

$successCount = 0
$failCount = 0

foreach ($var in $missingVars) {
    Write-Host "➕ $($var.Key) ekleniyor..." -ForegroundColor Yellow
    Write-Host "   $($var.Description)" -ForegroundColor Gray
    
    # Vercel'e ekle (production, preview, development)
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
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🎉 Environment variables başarıyla eklendi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  ÖNEMLİ: Vercel Dashboard'dan REDEPLOY yapmalısınız!" -ForegroundColor Yellow
    Write-Host "   Deployments > ... > Redeploy" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🧪 Test için:" -ForegroundColor Cyan
    Write-Host "   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/products" -ForegroundColor White
    Write-Host "   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/health/database" -ForegroundColor White
}


