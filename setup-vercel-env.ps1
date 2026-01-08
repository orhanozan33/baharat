# Supabase → Vercel Environment Variables Setup Script
# Bu script Supabase bilgilerini alıp Vercel'e otomatik ekler

param(
    [string]$ProjectUrl = "",
    [string]$AnonKey = "",
    [string]$ServiceRoleKey = "",
    [string]$DatabaseUrl = ""
)

Write-Host "🚀 Supabase → Vercel Environment Variables Setup" -ForegroundColor Green
Write-Host ""

# Eğer parametreler verilmemişse, kullanıcıdan al
if ([string]::IsNullOrWhiteSpace($ProjectUrl)) {
    Write-Host "📋 Supabase bilgilerini girin:" -ForegroundColor Yellow
    Write-Host ""
    
    $ProjectUrl = Read-Host "1. Project URL (örn: https://wznkjgmhtcxkmwxhfkxi.supabase.co)"
    $AnonKey = Read-Host "2. ANON KEY (anon public key)"
    $ServiceRoleKey = Read-Host "3. SERVICE ROLE KEY (service_role secret key)"
    $DatabaseUrl = Read-Host "4. DATABASE URL (Session pooler connection string)"
}

# Değerleri kontrol et
if ([string]::IsNullOrWhiteSpace($ProjectUrl) -or 
    [string]::IsNullOrWhiteSpace($AnonKey) -or 
    [string]::IsNullOrWhiteSpace($ServiceRoleKey) -or 
    [string]::IsNullOrWhiteSpace($DatabaseUrl)) {
    Write-Host "❌ Tüm bilgileri girmelisiniz!" -ForegroundColor Red
    exit 1
}

# Vercel CLI kontrolü
Write-Host ""
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

# vercel.env dosyasını güncelle
Write-Host ""
Write-Host "📄 vercel.env dosyası güncelleniyor..." -ForegroundColor Yellow

$envContent = @"
# ============================================
# VERCEL ENVIRONMENT VARIABLES
# Otomatik oluşturuldu: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")
# ============================================

# ============================================
# DATABASE CONFIGURATION
# ============================================
# Supabase PostgreSQL Connection String (Session Pooler)
DATABASE_URL=$DatabaseUrl

# ============================================
# SUPABASE CONFIGURATION
# ============================================
# Supabase Project URL (Public)
NEXT_PUBLIC_SUPABASE_URL=$ProjectUrl

# Supabase Anonymous Key (Public)
NEXT_PUBLIC_SUPABASE_ANON_KEY=$AnonKey

# Supabase Service Role Key (Private - Server Only)
SUPABASE_SERVICE_ROLE_KEY=$ServiceRoleKey

# ============================================
# JWT CONFIGURATION
# ============================================
# JWT Secret Key (Minimum 32 karakter)
JWT_SECRET=baharat-super-secret-jwt-key-2024-production-min-32-chars-long

# JWT Token Expiration
JWT_EXPIRES_IN=7d

# ============================================
# APPLICATION CONFIGURATION
# ============================================
# Application URL (Vercel deployment URL'iniz)
NEXT_PUBLIC_APP_URL=https://baharat-e9n4lcvjx-orhanozan33.vercel.app

# Frontend URL (Opsiyonel - aynı URL)
FRONTEND_URL=https://baharat-e9n4lcvjx-orhanozan33.vercel.app

# Node Environment
NODE_ENV=production

"@

Set-Content -Path "vercel.env" -Value $envContent -NoNewline
Write-Host "✅ vercel.env dosyası güncellendi" -ForegroundColor Green

# Vercel'e environment variables ekle
Write-Host ""
Write-Host "🔄 Vercel'e environment variables ekleniyor..." -ForegroundColor Cyan
Write-Host ""

$variables = @(
    @{Key="DATABASE_URL"; Value=$DatabaseUrl},
    @{Key="NEXT_PUBLIC_SUPABASE_URL"; Value=$ProjectUrl},
    @{Key="NEXT_PUBLIC_SUPABASE_ANON_KEY"; Value=$AnonKey},
    @{Key="SUPABASE_SERVICE_ROLE_KEY"; Value=$ServiceRoleKey},
    @{Key="JWT_SECRET"; Value="baharat-super-secret-jwt-key-2024-production-min-32-chars-long"},
    @{Key="JWT_EXPIRES_IN"; Value="7d"},
    @{Key="NEXT_PUBLIC_APP_URL"; Value="https://baharat-e9n4lcvjx-orhanozan33.vercel.app"},
    @{Key="FRONTEND_URL"; Value="https://baharat-e9n4lcvjx-orhanozan33.vercel.app"},
    @{Key="NODE_ENV"; Value="production"}
)

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
Write-Host "═══════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($successCount -gt 0) {
    Write-Host "🎉 Environment variables başarıyla eklendi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  ÖNEMLİ: Vercel Dashboard'dan REDEPLOY yapmalısınız!" -ForegroundColor Yellow
    Write-Host "   Deployments > ... > Redeploy" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🧪 Test için:" -ForegroundColor Cyan
    Write-Host "   https://baharat-e9n4lcvjx-orhanozan33.vercel.app/api/health/database" -ForegroundColor White
}

