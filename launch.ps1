<#
    Port-forward the Cognivita services that ArgoCD already deployed in the cluster.

    Usage:
      .\launch.ps1        # forward every service to localhost
#>
$ErrorActionPreference = "Stop"
$ns = "cognivita"

# svc, localPort, remotePort
$forwards = @(
    @{ svc = "frontend";        local = 8080; remote = 80   },
    @{ svc = "api-gateway";     local = 8093; remote = 8093 },
    @{ svc = "eureka-server";   local = 8761; remote = 8080 },
    @{ svc = "medical-service"; local = 8083; remote = 8083 },
    @{ svc = "mmse-service";    local = 8085; remote = 8085 },
    @{ svc = "keycloak";        local = 8090; remote = 8080 },
    @{ svc = "medical-mysql";   local = 3306; remote = 3306 },
    @{ svc = "mmse-mysql";      local = 3307; remote = 3306 }
)

function Log($msg) { Write-Host "==> $msg" -ForegroundColor Cyan }

Log "Starting port-forwards for namespace '$ns' ..."
$jobs = @()
foreach ($f in $forwards) {
    # Skip services that don't exist in the cluster (e.g. keycloak is optional).
    $exists = kubectl get svc $f.svc -n $ns --ignore-not-found -o name 2>$null
    if (-not $exists) {
        Write-Host ("   {0,-16} (not found, skipped)" -f $f.svc) -ForegroundColor DarkGray
        continue
    }
    $jobs += Start-Process kubectl `
        -ArgumentList "port-forward", "svc/$($f.svc)", "$($f.local):$($f.remote)", "-n", $ns `
        -NoNewWindow -PassThru
    Write-Host ("   {0,-16} http://localhost:{1}" -f $f.svc, $f.local)
}

Write-Host ""
Write-Host "App:      http://localhost:8080"
Write-Host "Eureka:   http://localhost:8761"
Write-Host "Keycloak: http://localhost:8090"
Write-Host ""
Write-Host "Press Ctrl+C to stop." -ForegroundColor Yellow

try {
    while ($true) { Start-Sleep -Seconds 3600 }
}
finally {
    Log "Stopping port-forwards ..."
    foreach ($j in $jobs) { Stop-Process -Id $j.Id -ErrorAction SilentlyContinue }
}
