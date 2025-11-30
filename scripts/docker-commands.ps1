# Scripts de conveniência para Docker no Windows PowerShell - Projeto ML Bootcamp CDIA

param(
    [Parameter(Position=0)]
    [string]$Command
)

function Show-Help {
    Write-Host "🐳 Scripts Docker - Projeto ML Bootcamp CDIA (PowerShell)" -ForegroundColor Blue
    Write-Host ""
    Write-Host "Comandos disponíveis:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "🏗️  BUILD & RUN:" -ForegroundColor Green
    Write-Host "  build          - Construir imagem Docker"
    Write-Host "  run            - Executar pipeline completo"
    Write-Host "  dev            - Modo desenvolvimento com Jupyter"
    Write-Host ""
    Write-Host "🎯 EXECUÇÃO ESPECÍFICA:" -ForegroundColor Green
    Write-Host "  train          - Apenas treinamento"
    Write-Host "  evaluate       - Apenas avaliação"
    Write-Host "  api            - Integração com API"
    Write-Host ""
    Write-Host "🔧 UTILITÁRIOS:" -ForegroundColor Green
    Write-Host "  shell          - Abrir shell no container"
    Write-Host "  logs           - Ver logs do container"
    Write-Host "  clean          - Limpar containers e imagens"
    Write-Host "  stop           - Parar todos os containers"
    Write-Host ""
    Write-Host "📊 MONITORAMENTO:" -ForegroundColor Green
    Write-Host "  status         - Status dos containers"
    Write-Host "  inspect        - Inspecionar container principal"
    Write-Host ""
    Write-Host "Exemplos:" -ForegroundColor Cyan
    Write-Host "  .\docker-commands.ps1 build"
    Write-Host "  .\docker-commands.ps1 run"
    Write-Host "  .\docker-commands.ps1 dev"
}

function Docker-Build {
    Write-Host "🏗️  Construindo imagem Docker..." -ForegroundColor Blue
    docker-compose build ml-pipeline
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build concluído!" -ForegroundColor Green
    } else {
        Write-Host "❌ Erro no build!" -ForegroundColor Red
    }
}

function Docker-Run {
    Write-Host "🚀 Executando pipeline completo..." -ForegroundColor Blue
    docker-compose up ml-pipeline
}

function Docker-Dev {
    Write-Host "💻 Iniciando modo desenvolvimento..." -ForegroundColor Blue
    Write-Host "📝 Jupyter estará disponível em: http://localhost:8888" -ForegroundColor Yellow
    docker-compose --profile dev up ml-dev
}

function Docker-Train {
    Write-Host "🧠 Executando apenas treinamento..." -ForegroundColor Blue
    docker-compose --profile train up ml-train
}

function Docker-Evaluate {
    Write-Host "📊 Executando apenas avaliação..." -ForegroundColor Blue
    docker-compose --profile evaluate up ml-evaluate
}

function Docker-Api {
    Write-Host "🔌 Executando integração com API..." -ForegroundColor Blue
    docker-compose --profile api up ml-api
}

function Docker-Shell {
    Write-Host "🐚 Abrindo shell no container..." -ForegroundColor Blue
    docker-compose run --rm ml-pipeline bash
}

function Docker-Logs {
    Write-Host "📋 Visualizando logs..." -ForegroundColor Blue
    docker-compose logs -f ml-pipeline
}

function Docker-Clean {
    Write-Host "🧹 Limpando containers e imagens..." -ForegroundColor Yellow
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    Write-Host "✅ Limpeza concluída!" -ForegroundColor Green
}

function Docker-Stop {
    Write-Host "⏹️  Parando containers..." -ForegroundColor Yellow
    docker-compose down
    Write-Host "✅ Containers parados!" -ForegroundColor Green
}

function Docker-Status {
    Write-Host "📊 Status dos containers:" -ForegroundColor Blue
    docker-compose ps
    Write-Host ""
    Write-Host "🖼️  Imagens:" -ForegroundColor Blue
    docker images | Select-String "ml-bootcamp"
}

function Docker-Inspect {
    Write-Host "🔍 Inspecionando container principal..." -ForegroundColor Blue
    $pythonCode = @"
import sys, os
print(f'🐍 Python: {sys.version}')
print(f'📁 Working Dir: {os.getcwd()}')
print(f'📦 PYTHONPATH: {os.environ.get("PYTHONPATH", "Not set")}')
print(f'🌍 Environment: {os.environ.get("ML_PROJECT_ENV", "Not set")}')
"@
    docker-compose exec ml-pipeline python -c $pythonCode
}

# Switch principal
switch ($Command.ToLower()) {
    "build" { Docker-Build }
    "run" { Docker-Run }
    "dev" { Docker-Dev }
    "train" { Docker-Train }
    "evaluate" { Docker-Evaluate }
    "api" { Docker-Api }
    "shell" { Docker-Shell }
    "logs" { Docker-Logs }
    "clean" { Docker-Clean }
    "stop" { Docker-Stop }
    "status" { Docker-Status }
    "inspect" { Docker-Inspect }
    default { Show-Help }
}