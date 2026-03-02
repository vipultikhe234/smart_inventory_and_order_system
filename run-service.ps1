param (
    [string]$serviceName
)

# Root directory of the project
$ROOT = $PSScriptRoot

# Robust infrastructure check function
function Test-Port {
    param($port)
    $connection = New-Object System.Net.Sockets.TcpClient
    try {
        $connection.Connect("127.0.0.1", $port)
        return $true
    } catch {
        return $false
    } finally {
        if ($connection) { $connection.Close() }
    }
}

Write-Host "--- Handling $serviceName ---" -ForegroundColor Cyan

# Infrastructure Checks (Skip if we are starting the service itself)
if ($serviceName -ne "redis") {
    if ($serviceName -eq "config-server") {
        if (-not (Test-Port 3306)) {
            Write-Host "ERROR: MySQL (3306) is not running!" -ForegroundColor Red
            exit 1
        }
    }
    if ($serviceName -eq "order-service") {
        if (-not (Test-Port 9092)) {
            Write-Host "WARNING: Kafka (9092) is not running. Events may fail." -ForegroundColor Yellow
        }
    }
    if ($serviceName -eq "product-service" -or $serviceName -eq "cart-service") {
        if (-not (Test-Port 6379)) {
            Write-Host "WARNING: Redis (6379) is not running. Caching will fail." -ForegroundColor Yellow
        }
    }
}

# Load properties from .env
$mvnProps = ""
$envPath = Join-Path $ROOT ".env"
if (Test-Path $envPath) {
    $envLines = Get-Content $envPath
    foreach ($line in $envLines) {
        $trimmed = $line.Trim()
        if ($trimmed -and -not $trimmed.StartsWith("#")) {
            if ($trimmed -match '^([^=]+)=(.*)$') {
                $name = $Matches[1].Trim()
                $value = $Matches[2].Trim()
                # Set as Environment Variable for the current session
                Set-Item -Path "Env:$name" -Value "$value"
                $mvnProps += " -D$name=$value"
            }
        }
    }
}

# Launch logic
if ($serviceName -eq "redis") {
    $redisDir = Join-Path $ROOT "Redis"
    Set-Location $redisDir
    Write-Host "Launching local Redis server..." -ForegroundColor Green
    ./redis-server.exe
} elseif ($serviceName -eq "frontend-client") {
    $frontendDir = Join-Path $ROOT "frontend-client"
    Set-Location $frontendDir
    Write-Host "Launching Frontend (React)..." -ForegroundColor Green
    npm run dev
} else {
    $svcDir = Join-Path $ROOT $serviceName
    Set-Location $svcDir
    
    $mvnCmd = "mvn"
    if (-not (Get-Command $mvnCmd -ErrorAction SilentlyContinue)) {
        $mvnCmd = "..\mvnw.cmd"
    }
    
    Write-Host "Launching $serviceName..." -ForegroundColor Green
    Write-Host "Command: $mvnCmd spring-boot:run $mvnProps" -ForegroundColor Gray
    Invoke-Expression "& $mvnCmd spring-boot:run $mvnProps"
}
