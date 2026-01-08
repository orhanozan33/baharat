# PowerShell script to fix Session Pooler connection string
# Supabase Session Pooler uses different username format

$envFile = ".env"

# Option 1: With project ID in username (current)
$connectionString1 = "DATABASE_URL=postgresql://postgres.wznkjgmhtcxkmwxhfkxi:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres"

# Option 2: Without project ID in username (alternative)
$connectionString2 = "DATABASE_URL=postgresql://postgres:Orhan2581@aws-1-ca-central-1.pooler.supabase.com:5432/postgres?sslmode=require"

# Option 3: Direct connection with SSL (if pooler doesn't work)
$connectionString3 = "DATABASE_URL=postgresql://postgres:Orhan2581@db.wznkjgmhtcxkmwxhfkxi.supabase.co:5432/postgres?sslmode=require"

Write-Host "Trying Option 2: Without project ID in username..."
Write-Host "This is the standard format for Session Pooler"

# Read current .env file
$content = Get-Content $envFile -Raw

# Replace DATABASE_URL line
$pattern = 'DATABASE_URL=.*'
$content = $content -replace $pattern, $connectionString2
Set-Content -Path $envFile -Value $content -NoNewline

Write-Host "✅ DATABASE_URL updated!"
Write-Host "New connection string: $connectionString2"
Write-Host ""
Write-Host "If this doesn't work, we can try:"
Write-Host "- Option 1: With project ID: $connectionString1"
Write-Host "- Option 3: Direct connection: $connectionString3"


