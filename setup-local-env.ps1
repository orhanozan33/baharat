# Local Environment Variables Setup Script
# Supabase entegrasyonu için local .env dosyasını tamamlar

$envFile = ".env"

Write-Host "🔧 Local Environment Variables Setup" -ForegroundColor Green
Write-Host ""

# .env dosyasını oku
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env dosyası bulunamadı!" -ForegroundColor Red
    Write-Host "📝 .env dosyası oluşturuluyor..." -ForegroundColor Yellow
    
    # Yeni .env dosyası oluştur
    $newEnvContent = @"
# ============================================
# DATABASE CONFIGURATION
# ============================================
DATABASE_URL=postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres

# ============================================
# SUPABASE CONFIGURATION
# ============================================
NEXT_PUBLIC_SUPABASE_URL=https://wznkjgmhtcxkmwxhfkxi.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# ============================================
# JWT CONFIGURATION
# ============================================
JWT_SECRET=baharat-super-secret-jwt-key-2024-production-min-32-chars-long
JWT_EXPIRES_IN=7d

# ============================================
# APPLICATION CONFIGURATION
# ============================================
NEXT_PUBLIC_APP_URL=http://localhost:3000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
"@
    
    Set-Content -Path $envFile -Value $newEnvContent
    Write-Host "✅ .env dosyası oluşturuldu" -ForegroundColor Green
    exit 0
}

# Mevcut .env dosyasını oku
$content = Get-Content $envFile -Raw

# Eksik variables'ları kontrol et ve ekle
$requiredVars = @{
    "JWT_SECRET" = "baharat-super-secret-jwt-key-2024-production-min-32-chars-long"
    "JWT_EXPIRES_IN" = "7d"
    "NEXT_PUBLIC_APP_URL" = "http://localhost:3000"
    "FRONTEND_URL" = "http://localhost:3000"
    "NODE_ENV" = "development"
}

$added = @()
$updated = @()

foreach ($var in $requiredVars.GetEnumerator()) {
    $key = $var.Key
    $value = $var.Value
    
    if ($content -match "^$key=") {
        # Variable var, güncelle
        $content = $content -replace "^$key=.*", "$key=$value"
        $updated += $key
    } else {
        # Variable yok, ekle
        if (-not $content.EndsWith("`n") -and -not $content.EndsWith("`r`n")) {
            $content += "`n"
        }
        $content += "$key=$value`n"
        $added += $key
    }
}

# DATABASE_URL'i kontrol et ve güncelle
if ($content -match "DATABASE_URL=.*Orhan2581") {
    $content = $content -replace "DATABASE_URL=.*Orhan2581", "DATABASE_URL=postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhanozan33@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"
    Write-Host "✅ DATABASE_URL şifresi güncellendi (Orhanozan33)" -ForegroundColor Green
}

# NEXT_PUBLIC_SUPABASE_URL'i kontrol et
if (-not ($content -match "NEXT_PUBLIC_SUPABASE_URL=")) {
    if (-not $content.EndsWith("`n")) {
        $content += "`n"
    }
    $content += "NEXT_PUBLIC_SUPABASE_URL=https://wznkjgmhtcxkmwxhfkxi.supabase.co`n"
    $added += "NEXT_PUBLIC_SUPABASE_URL"
}

# Dosyayı kaydet
Set-Content -Path $envFile -Value $content -NoNewline

Write-Host ""
Write-Host "📊 Özet:" -ForegroundColor Cyan
if ($added.Count -gt 0) {
    Write-Host "  ➕ Eklenen:" -ForegroundColor Green
    $added | ForEach-Object { Write-Host "    - $_" -ForegroundColor White }
}
if ($updated.Count -gt 0) {
    Write-Host "  🔄 Güncellenen:" -ForegroundColor Yellow
    $updated | ForEach-Object { Write-Host "    - $_" -ForegroundColor White }
}
if ($added.Count -eq 0 -and $updated.Count -eq 0) {
    Write-Host "  ✅ Tüm variables zaten mevcut!" -ForegroundColor Green
}

Write-Host ""
Write-Host "⚠️  Supabase Key'leri:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_SUPABASE_ANON_KEY ve SUPABASE_SERVICE_ROLE_KEY" -ForegroundColor Gray
Write-Host "  Supabase Dashboard'dan alıp .env dosyasına ekleyin!" -ForegroundColor Gray
Write-Host ""
Write-Host "🧪 Test için:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000/api/test" -ForegroundColor White
Write-Host "  http://localhost:3000/api/health/database" -ForegroundColor White

