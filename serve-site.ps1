$ErrorActionPreference = 'Stop'

$root = Join-Path $PSScriptRoot '_site'
$prefix = 'http://127.0.0.1:4001/'

if (-not (Test-Path $root)) {
    throw "Build output folder not found: $root"
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)
$listener.Start()

function Get-MimeType([string]$path) {
    switch ([IO.Path]::GetExtension($path).ToLowerInvariant()) {
        '.html' { 'text/html; charset=utf-8' }
        '.css' { 'text/css; charset=utf-8' }
        '.js' { 'application/javascript; charset=utf-8' }
        '.json' { 'application/json; charset=utf-8' }
        '.svg' { 'image/svg+xml' }
        '.png' { 'image/png' }
        '.jpg' { 'image/jpeg' }
        '.jpeg' { 'image/jpeg' }
        '.gif' { 'image/gif' }
        '.ico' { 'image/x-icon' }
        '.woff' { 'font/woff' }
        '.woff2' { 'font/woff2' }
        '.ttf' { 'font/ttf' }
        '.eot' { 'application/vnd.ms-fontobject' }
        default { 'application/octet-stream' }
    }
}

Write-Host "Serving $root at $prefix"

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $requestPath = $context.Request.Url.AbsolutePath.TrimStart('/').Replace('/', [IO.Path]::DirectorySeparatorChar)
        if ([string]::IsNullOrWhiteSpace($requestPath)) {
            $requestPath = 'index.html'
        }

        $fullPath = Join-Path $root $requestPath
        if (Test-Path $fullPath -PathType Container) {
            $fullPath = Join-Path $fullPath 'index.html'
        }

        if (-not (Test-Path $fullPath)) {
            $fullPath = Join-Path $root '404.html'
        }

        if (Test-Path $fullPath) {
            $bytes = [IO.File]::ReadAllBytes($fullPath)
            $context.Response.StatusCode = 200
            $context.Response.ContentType = Get-MimeType $fullPath
            $context.Response.ContentLength64 = $bytes.Length
            $context.Response.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $context.Response.StatusCode = 404
        }

        $context.Response.OutputStream.Close()
    }
}
finally {
    $listener.Stop()
    $listener.Close()
}
