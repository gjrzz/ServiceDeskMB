# Script de Deploy para GitHub Pages
# Execute: .\deploy.ps1

Write-Host "🚀 Iniciando deploy do ServiceDesk..." -ForegroundColor Cyan

# 1. Salvar mudanças na main
Write-Host "`n📦 Salvando mudanças na branch main..." -ForegroundColor Yellow
git add .
git commit -m "Configure Railway backend URL and CORS"
git push origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer push na main" -ForegroundColor Red
    exit 1
}

# 2. Ir para branch pages
Write-Host "`n🌐 Mudando para branch pages..." -ForegroundColor Yellow
git checkout pages

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao mudar para branch pages" -ForegroundColor Red
    exit 1
}

# 3. Copiar arquivos compilados
Write-Host "`n📋 Copiando arquivos compilados..." -ForegroundColor Yellow
Copy-Item -Path dist/* -Destination . -Recurse -Force

# 4. Fazer commit e push
Write-Host "`n🚀 Fazendo deploy..." -ForegroundColor Yellow
git add .
$timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
git commit -m "Deploy: $timestamp"
git push origin pages

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erro ao fazer push na pages" -ForegroundColor Red
    git checkout main
    exit 1
}

# 5. Voltar para main
Write-Host "`n🔙 Voltando para branch main..." -ForegroundColor Yellow
git checkout main

Write-Host "`n✅ Deploy concluído com sucesso!" -ForegroundColor Green
Write-Host "🔗 Acesse: https://gjrzz.github.io/ServiceDeskMB/" -ForegroundColor Cyan
Write-Host "`n⏳ Aguarde 1-2 minutos para o GitHub Pages atualizar..." -ForegroundColor Yellow
