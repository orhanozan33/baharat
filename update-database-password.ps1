# Supabase şifresini güncelleme script'i
# Yeni şifre: Orhanozan33

$envFile = ".env"
$newPassword = "Orhanozan33"

Write-Host "🔐 Supabase şifresi güncelleniyor..." -ForegroundColor Green
Write-Host "Yeni şifre: $newPassword" -ForegroundColor Yellow
Write-Host ""

# .env dosyasını oku
if (-not (Test-Path $envFile)) {
    Write-Host "❌ .env dosyası bulunamadı!" -ForegroundColor Red
    exit 1
}

$content = Get-Content $envFile -Raw

# DATABASE_URL'i güncelle
# Eski formatları kontrol et ve güncelle
$patterns = @(
    'postgresql://postgres\.wznkjgmhtcxkmwxhfkxi:([^@]+)@',
    'postgresql://postgres:([^@]+)@db\.wznkjgmhtcxkmwxhfkxi\.supabase\.co',
    'postgresql://postgres:([^@]+)@aws-1-ca-central-1\.pooler\.supabase\.com'
)

$updated = $false
foreach ($pattern in $patterns) {
    if ($content -match $pattern) {
        $oldPassword = $matches[1]
        if ($oldPassword -ne $newPassword) {
            $content = $content -replace "postgresql://postgres\.wznkjgmhtcxkmwxhfkxi:$oldPassword@", "postgresql://postgres.wznkjgmhtcxkmwxhfkxi:$newPassword@"
            $content = $content -replace "postgresql://postgres:$oldPassword@db\.wznkjgmhtcxkmwxhfkxi\.supabase\.co", "postgresql://postgres:$newPassword@db.wznkjgmhtcxkmwxhfkxi.supabase.co"
            $content = $content -replace "postgresql://postgres:$oldPassword@aws-1-ca-central-1\.pooler\.supabase\.com", "postgresql://postgres.wznkjgmhtcxkmwxhfkxi:$newPassword@aws-1-ca-central-1.pooler.supabase.com"
            $updated = $true
        }
    }
}

# Eğer hiç match olmadıysa, direkt ekle/güncelle
if (-not $updated) {
    # Session Pooler formatı
    $newConnectionString = "DATABASE_URL=postgresql://postgres.wznkjgmhtcxkmwxhfkxi:$newPassword@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"
    
    if ($content -match 'DATABASE_URL=.*') {
        $content = $content -replace 'DATABASE_URL=.*', $newConnectionString
    } else {
        # DATABASE_URL yoksa ekle
        $content += "`n$newConnectionString"
    }
    $updated = $true
}

Set-Content -Path $envFile -Value $content -NoNewline

if ($updated) {
    Write-Host "✅ .env dosyası güncellendi!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Yeni DATABASE_URL:" -ForegroundColor Cyan
    $content | Select-String "DATABASE_URL" | ForEach-Object { Write-Host "   $($_.Line)" -ForegroundColor White }
    Write-Host ""
    Write-Host "⚠️  Vercel'de de DATABASE_URL'i güncellemeyi unutmayın!" -ForegroundColor Yellow
} else {
    Write-Host "⚠️  DATABASE_URL bulunamadı veya zaten güncel" -ForegroundColor Yellow
}

