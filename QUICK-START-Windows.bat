@echo off
chcp 65001 > nul
REM Quick Start Automático para Windows - Projeto ML Bootcamp CDIA

echo.
echo 🚀 QUICK START - Setup Automático Docker Windows
echo ================================================

REM Verificar se está executando como Admin
net session >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Executando como Administrador
) else (
    echo ❌ Execute este script como Administrador!
    echo    Clique com botão direito e "Executar como administrador"
    pause
    exit /b 1
)

echo.
echo 📁 Criando estrutura de diretórios...
if not exist "data" mkdir data
if not exist "models" mkdir models
if not exist "predictions" mkdir predictions
if not exist "metrics" mkdir metrics
if not exist "logs" mkdir logs
if not exist "reports" mkdir reports
if not exist "scripts" mkdir scripts

echo ✅ Diretórios criados!

echo.
echo 🔍 Verificando pré-requisitos...

REM Verificar Docker
docker --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Docker encontrado
    docker --version
) else (
    echo ❌ Docker não encontrado!
    echo    Download: https://www.docker.com/products/docker-desktop
    echo    Instale Docker Desktop e tente novamente
    pause
    exit /b 1
)

REM Verificar Docker Compose
docker-compose --version >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Docker Compose encontrado
    docker-compose --version
) else (
    echo ❌ Docker Compose não encontrado!
    echo    Instale Docker Desktop completo
    pause
    exit /b 1
)

echo.
echo 📄 Verificando arquivos necessários...

set missing_files=0

if not exist "Dockerfile" (
    echo ❌ Dockerfile não encontrado
    set missing_files=1
)

if not exist "docker-compose.yml" (
    echo ❌ docker-compose.yml não encontrado
    set missing_files=1
)

if not exist "requirement.txt" (
    echo ❌ requirement.txt não encontrado
    set missing_files=1
)

if not exist "main.py" (
    echo ❌ main.py não encontrado
    set missing_files=1
)

if not exist "config.py" (
    echo ❌ config.py não encontrado
    set missing_files=1
)

if not exist "data\bootcamp_train.csv" (
    echo ⚠️  bootcamp_train.csv não encontrado em data\
    echo    Copie seu arquivo de dados para data\bootcamp_train.csv
)

if %missing_files% == 1 (
    echo.
    echo ❌ Arquivos necessários não encontrados!
    echo    Copie todos os arquivos do projeto para esta pasta
    pause
    exit /b 1
)

echo ✅ Arquivos principais encontrados!

echo.
echo 🔐 Configurando PowerShell...
powershell -Command "Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope LocalMachine -Force" >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ PowerShell configurado
) else (
    echo ⚠️  Não foi possível configurar PowerShell automaticamente
    echo    Execute manualmente: Set-ExecutionPolicy RemoteSigned
)

echo.
echo 🐳 Iniciando Docker Desktop...
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

echo    Aguardando Docker Desktop inicializar...
timeout /t 10 /nobreak >nul

:wait_docker
docker info >nul 2>&1
if %errorLevel% == 0 (
    echo ✅ Docker Desktop está rodando
) else (
    echo    Ainda aguardando Docker Desktop...
    timeout /t 5 /nobreak >nul
    goto wait_docker
)

echo.
echo 🏗️  Construindo imagem Docker...
docker-compose build ml-pipeline

if %errorLevel% == 0 (
    echo ✅ Build concluído com sucesso!
) else (
    echo ❌ Erro no build!
    echo    Verifique os logs acima
    pause
    exit /b 1
)

echo.
echo 🎯 Setup concluído! Escolha uma opção:
echo.
echo 1 - Executar pipeline completo (recomendado)
echo 2 - Modo desenvolvimento (Jupyter)
echo 3 - Apenas treinamento
echo 4 - Apenas avaliação
echo 5 - Sair
echo.
set /p choice="Digite sua escolha (1-5): "

if "%choice%"=="1" (
    echo 🚀 Executando pipeline completo...
    docker-compose up ml-pipeline
) else if "%choice%"=="2" (
    echo 💻 Iniciando modo desenvolvimento...
    echo 📝 Jupyter estará em: http://localhost:8888
    docker-compose --profile dev up ml-dev
) else if "%choice%"=="3" (
    echo 🧠 Executando treinamento...
    docker-compose --profile train up ml-train
) else if "%choice%"=="4" (
    echo 📊 Executando avaliação...
    docker-compose --profile evaluate up ml-evaluate
) else (
    echo 👋 Até logo!
)

echo.
echo 📚 Para usar posteriormente:
echo    scripts\docker-commands.bat [comando]
echo    ou
echo    .\scripts\docker-commands.ps1 [comando]
echo.

pause
