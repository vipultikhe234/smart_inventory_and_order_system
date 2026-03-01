# Prepare Maven properties string
$mvn_props = ""
if (Test-Path ".env") {
    Get-Content .env | Foreach-Object {
        if ($_ -match '^(?<name>[^#\s=]+)=(?<value>.*)$') {
            $name = $Matches['name'].Trim()
            $value = $Matches['value'].Trim()
            $mvn_props += " -D$name=$value"
            Write-Host "🔋 Prepared property: $name" -ForegroundColor Cyan
        }
    }
}

$services = 'config-server', 'api-gateway', 'user-service', 'product-service', 'inventory-service', 'cart-service', 'order-service'

foreach ($svc in $services) {
    Write-Host "🚀 Starting $svc..." -ForegroundColor Green
    Start-Process powershell -ArgumentList "-WindowStyle Normal -Command `"cd $svc; mvn spring-boot:run $mvn_props`""
    if ($svc -eq 'config-server') { Start-Sleep -Seconds 15 } # Allow config-server to settle
}
