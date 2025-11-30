@echo off
REM Scripts de conveniência para Docker no Windows - Projeto ML Bootcamp CDIA

echo 🐳 Scripts Docker - Projeto ML Bootcamp CDIA (Windows)

if "%1"=="" goto show_help
if "%1"=="help" goto show_help
if "%1"=="build" goto docker_build
if "%1"=="run" goto docker_run
if "%1"=="dev" goto docker_dev
if "%1"=="train" goto docker_train
if "%1"=="evaluate" goto docker_evaluate
if "%1"=="api" goto docker_api
if "%1"=="shell" goto docker_shell
if "%1"=="logs" goto docker_logs
if "%1"=="clean" goto docker_clean
if "%1"=="stop" goto docker_stop
if "%1"=="status" goto docker_status
if "%1"=="inspect" goto docker_inspect
goto show_help

:show_help
echo.
echo Comandos disponíveis:
echo.
echo 🏗️  BUILD ^& RUN:
echo   build          - Construir imagem Docker
echo   run            - Executar pipeline completo
echo   dev            - Modo desenvolvimento com Jupyter
echo.
echo 🎯 EXECUÇÃO ESPECÍFICA:
echo   train          - Apenas treinamento
echo   evaluate       - Apenas avaliação
echo   api            - Integração com API
echo.
echo 🔧 UTILITÁRIOS:
echo   shell          - Abrir shell no container
echo   logs           - Ver logs do container
echo   clean          - Limpar containers e imagens
echo   stop           - Parar todos os containers
echo.
echo 📊 MONITORAMENTO:
echo   status         - Status dos containers
echo   inspect        - Inspecionar container principal
echo.
echo Exemplos:
echo   docker-commands.bat build
echo   docker-commands.bat run
echo   docker-commands.bat dev
goto end

:docker_build
echo 🏗️  Construindo imagem Docker...
docker-compose build ml-pipeline
if %ERRORLEVEL% == 0 (
    echo ✅ Build concluído!
) else (
    echo ❌ Erro no build!
)
goto end

:docker_run
echo 🚀 Executando pipeline completo...
docker-compose up ml-pipeline
goto end

:docker_dev
echo 💻 Iniciando modo desenvolvimento...
echo 📝 Jupyter estará disponível em: http://localhost:8888
docker-compose --profile dev up ml-dev
goto end

:docker_train
echo 🧠 Executando apenas treinamento...
docker-compose --profile train up ml-train
goto end

:docker_evaluate
echo 📊 Executando apenas avaliação...
docker-compose --profile evaluate up ml-evaluate
goto end

:docker_api
echo 🔌 Executando integração com API...
docker-compose --profile api up ml-api
goto end

:docker_shell
echo 🐚 Abrindo shell no container...
docker-compose run --rm ml-pipeline bash
goto end

:docker_logs
echo 📋 Visualizando logs...
docker-compose logs -f ml-pipeline
goto end

:docker_clean
echo 🧹 Limpando containers e imagens...
docker-compose down --rmi all --volumes --remove-orphans
docker system prune -f
echo ✅ Limpeza concluída!
goto end

:docker_stop
echo ⏹️  Parando containers...
docker-compose down
echo ✅ Containers parados!
goto end

:docker_status
echo 📊 Status dos containers:
docker-compose ps
echo.
echo 🖼️  Imagens:
docker images | findstr ml-bootcamp
goto end

:docker_inspect
echo 🔍 Inspecionando container principal...
docker-compose exec ml-pipeline python -c "import sys, os; print(f'🐍 Python: {sys.version}'); print(f'📁 Working Dir: {os.getcwd()}'); print(f'📦 PYTHONPATH: {os.environ.get(\"PYTHONPATH\", \"Not set\")}'); print(f'🌍 Environment: {os.environ.get(\"ML_PROJECT_ENV\", \"Not set\")}')"
goto end

:end