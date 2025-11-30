#!/bin/bash
# Scripts de conveniência para Docker - Projeto ML Bootcamp CDIA

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🐳 Scripts Docker - Projeto ML Bootcamp CDIA${NC}"

# Função para mostrar ajuda
show_help() {
    echo -e "${YELLOW}Comandos disponíveis:${NC}"
    echo ""
    echo -e "${GREEN}🏗️  BUILD & RUN:${NC}"
    echo "  build          - Construir imagem Docker"
    echo "  run            - Executar pipeline completo"
    echo "  dev            - Modo desenvolvimento com Jupyter"
    echo ""
    echo -e "${GREEN}🎯 EXECUÇÃO ESPECÍFICA:${NC}"
    echo "  train          - Apenas treinamento"
    echo "  evaluate       - Apenas avaliação"
    echo "  api            - Integração com API"
    echo ""
    echo -e "${GREEN}🔧 UTILITÁRIOS:${NC}"
    echo "  shell          - Abrir shell no container"
    echo "  logs           - Ver logs do container"
    echo "  clean          - Limpar containers e imagens"
    echo "  stop           - Parar todos os containers"
    echo ""
    echo -e "${GREEN}📊 MONITORAMENTO:${NC}"
    echo "  status         - Status dos containers"
    echo "  inspect        - Inspecionar container principal"
}

# Função para build
docker_build() {
    echo -e "${BLUE}🏗️  Construindo imagem Docker...${NC}"
    docker-compose build ml-pipeline
    echo -e "${GREEN}✅ Build concluído!${NC}"
}

# Função para executar pipeline completo
docker_run() {
    echo -e "${BLUE}🚀 Executando pipeline completo...${NC}"
    docker-compose up ml-pipeline
}

# Função para modo desenvolvimento
docker_dev() {
    echo -e "${BLUE}💻 Iniciando modo desenvolvimento...${NC}"
    echo -e "${YELLOW}📝 Jupyter estará disponível em: http://localhost:8888${NC}"
    docker-compose --profile dev up ml-dev
}

# Função para apenas treinamento
docker_train() {
    echo -e "${BLUE}🧠 Executando apenas treinamento...${NC}"
    docker-compose --profile train up ml-train
}

# Função para apenas avaliação
docker_evaluate() {
    echo -e "${BLUE}📊 Executando apenas avaliação...${NC}"
    docker-compose --profile evaluate up ml-evaluate
}

# Função para API
docker_api() {
    echo -e "${BLUE}🔌 Executando integração com API...${NC}"
    docker-compose --profile api up ml-api
}

# Função para abrir shell
docker_shell() {
    echo -e "${BLUE}🐚 Abrindo shell no container...${NC}"
    docker-compose run --rm ml-pipeline bash
}

# Função para ver logs
docker_logs() {
    echo -e "${BLUE}📋 Visualizando logs...${NC}"
    docker-compose logs -f ml-pipeline
}

# Função para limpar
docker_clean() {
    echo -e "${YELLOW}🧹 Limpando containers e imagens...${NC}"
    docker-compose down --rmi all --volumes --remove-orphans
    docker system prune -f
    echo -e "${GREEN}✅ Limpeza concluída!${NC}"
}

# Função para parar containers
docker_stop() {
    echo -e "${YELLOW}⏹️  Parando containers...${NC}"
    docker-compose down
    echo -e "${GREEN}✅ Containers parados!${NC}"
}

# Função para status
docker_status() {
    echo -e "${BLUE}📊 Status dos containers:${NC}"
    docker-compose ps
    echo ""
    echo -e "${BLUE}🖼️  Imagens:${NC}"
    docker images | grep ml-bootcamp
}

# Função para inspecionar
docker_inspect() {
    echo -e "${BLUE}🔍 Inspecionando container principal...${NC}"
    docker-compose exec ml-pipeline python -c "
import sys, os
print(f'🐍 Python: {sys.version}')
print(f'📁 Working Dir: {os.getcwd()}')
print(f'📦 PYTHONPATH: {os.environ.get(\"PYTHONPATH\", \"Not set\")}')
print(f'🌍 Environment: {os.environ.get(\"ML_PROJECT_ENV\", \"Not set\")}')
"
}

# Switch principal
case "$1" in
    "build")
        docker_build
        ;;
    "run")
        docker_run
        ;;
    "dev")
        docker_dev
        ;;
    "train")
        docker_train
        ;;
    "evaluate")
        docker_evaluate
        ;;
    "api")
        docker_api
        ;;
    "shell")
        docker_shell
        ;;
    "logs")
        docker_logs
        ;;
    "clean")
        docker_clean
        ;;
    "stop")
        docker_stop
        ;;
    "status")
        docker_status
        ;;
    "inspect")
        docker_inspect
        ;;
    *)
        show_help
        ;;
esac