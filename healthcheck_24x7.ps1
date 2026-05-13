param(
  [string]$BaseUrl = "http://localhost:8000",
  [int]$TimeoutSec = 20,
  [string]$Produto = "solara_connect",
  [string]$Publico = "cliente"
)

$ErrorActionPreference = "Stop"

function Write-Check($ok, $label, $detail) {
  if ($ok) {
    Write-Host "[PASS] $label - $detail" -ForegroundColor Green
  } else {
    Write-Host "[FAIL] $label - $detail" -ForegroundColor Red
  }
}

$allOk = $true
$now = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
Write-Host "Healthcheck SQR ($now)" -ForegroundColor Cyan
Write-Host "BaseUrl: $BaseUrl" -ForegroundColor Cyan

try {
  $health = Invoke-RestMethod -Uri "$BaseUrl/health" -Method Get -TimeoutSec $TimeoutSec
  $ok = ($health.status -eq "ok")
  Write-Check $ok "GET /health" ("status=" + $health.status)
  if (-not $ok) { $allOk = $false }
} catch {
  Write-Check $false "GET /health" $_.Exception.Message
  $allOk = $false
}

$ragOk = $false
try {
  $status = Invoke-RestMethod -Uri "$BaseUrl/assistente/status" -Method Get -TimeoutSec $TimeoutSec
  $ragDocs = [int]$status.rag_documents
  $ragOk = ($status.status -eq "ok" -and $ragDocs -gt 0)
  Write-Check $ragOk "GET /assistente/status" ("status=" + $status.status + ", rag_documents=" + $ragDocs)
  if (-not $ragOk) { $allOk = $false }
} catch {
  Write-Check $false "GET /assistente/status" $_.Exception.Message
  $allOk = $false
}

try {
  $body = @{
    pergunta = "Como o Solara Connect reduz faltas na agenda?"
    produto = $Produto
    publico = $Publico
  } | ConvertTo-Json

  $ask = Invoke-RestMethod -Uri "$BaseUrl/assistente/ask" -Method Post -ContentType "application/json" -Body $body -TimeoutSec $TimeoutSec

  $hasAnswer = -not [string]::IsNullOrWhiteSpace($ask.answer)
  $hasSources = ($ask.sources -ne $null -and $ask.sources.Count -gt 0)
  $ok = $hasAnswer -and $hasSources

  $answerPreview = if ($hasAnswer) { $ask.answer.Substring(0, [Math]::Min(120, $ask.answer.Length)) } else { "sem resposta" }
  Write-Check $ok "POST /assistente/ask" ("answer=" + $answerPreview)

  if ($hasSources) {
    $src = $ask.sources | ForEach-Object { "$($_.product):$($_.source)" }
    Write-Host ("Fontes: " + ($src -join " | ")) -ForegroundColor DarkGray
  }

  if (-not $ok) { $allOk = $false }
} catch {
  Write-Check $false "POST /assistente/ask" $_.Exception.Message
  $allOk = $false
}

if ($allOk) {
  Write-Host "RESULT: HEALTHCHECK OK" -ForegroundColor Green
  exit 0
}

Write-Host "RESULT: HEALTHCHECK FAIL" -ForegroundColor Red
exit 1
