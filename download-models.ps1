# PowerShell script to download Face API models
$modelsDir = "public\models"
$baseUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js-models/master/weights/"

$models = @(
    "tiny_face_detector_model-weights_manifest.json",
    "tiny_face_detector_model-shard1",
    "face_landmark_68_model-weights_manifest.json",
    "face_landmark_68_model-shard1",
    "face_expression_model-weights_manifest.json",
    "face_expression_model-shard1"
)

if (-not (Test-Path $modelsDir)) {
    New-Item -ItemType Directory -Path $modelsDir -Force
    Write-Host "Created directory: $modelsDir" -ForegroundColor Green
}

foreach ($model in $models) {
    $url = $baseUrl + $model
    $output = Join-Path $modelsDir $model
    Write-Host "Downloading: $model..." -ForegroundColor Yellow
    try {
        Invoke-WebRequest -Uri $url -OutFile $output -ErrorAction Stop
        Write-Host "Downloaded: $model" -ForegroundColor Green
    } catch {
        Write-Host "Failed to download $model" -ForegroundColor Red
    }
}

Write-Host "Download complete!" -ForegroundColor Green
