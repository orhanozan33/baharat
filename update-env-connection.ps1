# PowerShell script to update DATABASE_URL in .env file
# Session Pooler Connection String from Supabase

$envFile = ".env"
$newConnectionString = "DATABASE_URL=postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"

# Read current .env file
$content = Get-Content $envFile -Raw

# Replace DATABASE_URL line
$pattern = 'DATABASE_URL=.*'
if ($content -match $pattern) {
    $content = $content -replace $pattern, $newConnectionString
    Set-Content -Path $envFile -Value $content -NoNewline
    Write-Host "✅ DATABASE_URL updated to Session Pooler connection string!"
    Write-Host "New connection string: $newConnectionString"
} else {
    # If DATABASE_URL doesn't exist, append it
    Add-Content -Path $envFile -Value "`n$newConnectionString"
    Write-Host "✅ DATABASE_URL added to .env file!"
}

