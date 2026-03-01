$ErrorActionPreference = "SilentlyContinue"
$services = 'api-gateway', 'user-service', 'product-service', 'inventory-service', 'cart-service', 'order-service'

foreach ($svc in $services) {
    Start-Process powershell -ArgumentList "-WindowStyle Minimized -Command `"cd $svc; mvn spring-boot:run > $svc.log 2>&1`""
}
