param(
    [Parameter(Position = 0)]
    [ValidateSet('f1', 'f2', 'f3', 'f4', 'all')]
    [string] $Suite = 'all'
)

$ErrorActionPreference = 'Stop'
if (Get-Variable -Name PSNativeCommandUseErrorActionPreference -ErrorAction SilentlyContinue) {
    $PSNativeCommandUseErrorActionPreference = $false
}
[Console]::OutputEncoding = [System.Text.UTF8Encoding]::new()
$OutputEncoding = [System.Text.UTF8Encoding]::new()
$projectRoot = Split-Path -Parent $PSScriptRoot
$reportRoot = Join-Path $projectRoot 'target\reports'
$results = New-Object System.Collections.Generic.List[object]
$mavenCommand = if (Get-Command mvn.cmd -ErrorAction SilentlyContinue) { 'mvn.cmd' } else { 'mvn' }

function Reset-ReportDirectory {
    param([string] $RelativePath)

    $path = Join-Path $reportRoot $RelativePath
    if (Test-Path -LiteralPath $path) {
        Remove-Item -LiteralPath $path -Recurse -Force
    }
}

function Get-ReportLink {
    param(
        [string] $RelativePath,
        [string] $PreferredFile
    )

    $reportPath = Join-Path $reportRoot $RelativePath
    $preferred = Join-Path $reportPath $PreferredFile
    if (Test-Path -LiteralPath $preferred) {
        return "$RelativePath/$PreferredFile"
    }

    $index = Get-ChildItem -LiteralPath $reportPath -Filter 'index.html' -Recurse -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if ($index) {
        $basePath = (Resolve-Path -LiteralPath $reportRoot).Path.TrimEnd('\') + '\'
        $baseUri = [Uri] $basePath
        $targetUri = [Uri] $index.FullName
        return [Uri]::UnescapeDataString($baseUri.MakeRelativeUri($targetUri).ToString())
    }

    return ''
}

function Invoke-TestSuite {
    param(
        [string] $Name,
        [string] $Title,
        [string[]] $MavenArgs,
        [string] $ReportPath,
        [string] $ReportFile,
        [string] $Note
    )

    Reset-ReportDirectory $ReportPath

    Write-Host ""
    Write-Host "=== Chạy $Title ==="
    & $mavenCommand @MavenArgs
    $exitCode = if ($null -eq $LASTEXITCODE) { 0 } else { $LASTEXITCODE }
    $status = if ($exitCode -eq 0) { 'PASS' } else { 'FAIL' }
    $link = Get-ReportLink -RelativePath $ReportPath -PreferredFile $ReportFile

    $results.Add([pscustomobject]@{
        Name = $Name
        Title = $Title
        Status = $status
        ExitCode = $exitCode
        Report = $link
        Note = $Note
    })

    Write-Host "$Title kết thúc với trạng thái $status (exit code: $exitCode)."
}

function ConvertTo-HtmlText {
    param([string] $Value)
    return [System.Net.WebUtility]::HtmlEncode($Value)
}

function Write-Summary {
    New-Item -ItemType Directory -Force -Path $reportRoot | Out-Null

    $summaryMd = Join-Path $reportRoot 'summary.md'
    $summaryHtml = Join-Path $reportRoot 'summary.html'
    $generatedAt = Get-Date -Format 'yyyy-MM-dd HH:mm:ss'

    $markdown = New-Object System.Collections.Generic.List[string]
    $markdown.Add('# Báo cáo tổng hợp kiểm thử Restful-Booker')
    $markdown.Add('')
    $markdown.Add("Thời điểm tạo: $generatedAt")
    $markdown.Add('')
    $markdown.Add('| Nhóm | Trạng thái | Exit code | Report | Ghi chú |')
    $markdown.Add('| --- | --- | ---: | --- | --- |')

    foreach ($item in $results) {
        $reportCell = if ($item.Report) { "[$($item.Report)]($($item.Report))" } else { 'Chưa có report' }
        $markdown.Add("| $($item.Title) | $($item.Status) | $($item.ExitCode) | $reportCell | $($item.Note) |")
    }

    $markdown | Set-Content -LiteralPath $summaryMd -Encoding UTF8

    $rows = foreach ($item in $results) {
        $statusClass = if ($item.Status -eq 'PASS') { 'pass' } else { 'fail' }
        $reportHtml = if ($item.Report) {
            $safeReport = ConvertTo-HtmlText $item.Report
            "<a href=""$safeReport"">$safeReport</a>"
        } else {
            'Chưa có report'
        }
        "<tr><td>$(ConvertTo-HtmlText $item.Title)</td><td class=""$statusClass"">$($item.Status)</td><td>$($item.ExitCode)</td><td>$reportHtml</td><td>$(ConvertTo-HtmlText $item.Note)</td></tr>"
    }

    $html = @"
<!doctype html>
<html lang="vi">
<head>
  <meta charset="utf-8">
  <title>Báo cáo tổng hợp kiểm thử Restful-Booker</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 32px; color: #172033; }
    h1 { margin-bottom: 8px; }
    table { border-collapse: collapse; width: 100%; margin-top: 24px; }
    th, td { border: 1px solid #d5dbe7; padding: 10px 12px; text-align: left; }
    th { background: #f2f5fa; }
    .pass { color: #116b37; font-weight: 700; }
    .fail { color: #b42318; font-weight: 700; }
    code { background: #f2f5fa; padding: 2px 4px; border-radius: 4px; }
  </style>
</head>
<body>
  <h1>Báo cáo tổng hợp kiểm thử Restful-Booker</h1>
  <p>Thời điểm tạo: <code>$generatedAt</code></p>
  <table>
    <thead>
      <tr><th>Nhóm</th><th>Trạng thái</th><th>Exit code</th><th>Report</th><th>Ghi chú</th></tr>
    </thead>
    <tbody>
      $($rows -join "`n      ")
    </tbody>
  </table>
</body>
</html>
"@

    $html | Set-Content -LiteralPath $summaryHtml -Encoding UTF8
    Write-Host ""
    Write-Host "Báo cáo tổng hợp:"
    Write-Host " - $summaryMd"
    Write-Host " - $summaryHtml"
}

Set-Location $projectRoot
New-Item -ItemType Directory -Force -Path $reportRoot | Out-Null

if ($Suite -eq 'all') {
    Remove-Item -LiteralPath $reportRoot -Recurse -Force -ErrorAction SilentlyContinue
    New-Item -ItemType Directory -Force -Path $reportRoot | Out-Null
}

if ($Suite -eq 'f1' -or $Suite -eq 'all') {
    Invoke-TestSuite 'f1' 'F1 API testing' @('clean', 'test', '-Dtest=ApiTest') 'f1_api' 'karate-summary.html' 'Kiểm thử API Restful-Booker local.'
}

if ($Suite -eq 'f2' -or $Suite -eq 'all') {
    $f2Args = if ($Suite -eq 'all') { @('test-compile', 'gatling:test', '-Pgatling') } else { @('clean', 'test-compile', 'gatling:test', '-Pgatling') }
    Invoke-TestSuite 'f2' 'F2 performance testing' $f2Args 'f2_performance' 'index.html' 'Kiểm thử tải bằng Karate Gatling.'
}

if ($Suite -eq 'f3' -or $Suite -eq 'all') {
    $f3Args = if ($Suite -eq 'all') { @('test', '-Dtest=UiTest') } else { @('clean', 'test', '-Dtest=UiTest') }
    Invoke-TestSuite 'f3' 'F3 UI testing' $f3Args 'f3_ui' 'karate-summary.html' 'Kiểm thử giao diện trên backend 3001 và React web 5173.'
}

if ($Suite -eq 'f4' -or $Suite -eq 'all') {
    $f4Args = if ($Suite -eq 'all') { @('test', '-Dtest=MockRunner') } else { @('clean', 'test', '-Dtest=MockRunner') }
    Invoke-TestSuite 'f4' 'F4 mock testing' $f4Args 'f4_mock' 'karate-summary.html' 'Kiểm thử mock server Restful-Booker.'
}

Write-Summary

$failed = @($results | Where-Object { $_.ExitCode -ne 0 })
if ($failed.Count -gt 0) {
    exit 1
}

exit 0
