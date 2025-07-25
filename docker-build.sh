#!/bin/bash

# Script para build e deploy da aplicação Oficina Mecânica
# Autor: Sistema de Gestão de Oficina
# Data: $(date)

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se Docker está instalado
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        exit 1
    fi
    
    if ! command -v docker &> /dev/null || ! docker compose version &> /dev/null; then
        log_error "Docker Compose não está instalado!"
        exit 1
    fi
    
    log_success "Docker e Docker Compose estão instalados"
}

# Verificar se os arquivos necessários existem
check_files() {
    local files=("Dockerfile" "docker-compose.yml" "package.json" "src/index.ts")
    
    for file in "${files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Arquivo necessário não encontrado: $file"
            exit 1
        fi
    done
    
    log_success "Todos os arquivos necessários estão presentes"
}

# Limpar containers e imagens antigas
cleanup() {
    log_info "Limpando containers e imagens antigas..."
    
    # Parar containers se estiverem rodando
    docker compose down --remove-orphans 2>/dev/null || true

    # Remover imagens antigas da oficina
    docker images | grep oficina | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    
    # Limpar volumes órfãos
    docker volume prune -f 2>/dev/null || true
    
    log_success "Limpeza concluída"
}

# Build da aplicação
build_app() {
    log_info "Iniciando build da aplicação..."
    
    # Build da imagem
    docker compose build --no-cache oficina-app
    
    if [[ $? -eq 0 ]]; then
        log_success "Build da aplicação concluído com sucesso"
    else
        log_error "Falha no build da aplicação"
        exit 1
    fi
}

# Inicializar banco de dados
init_database() {
    log_info "Inicializando banco de dados..."
    
    # Subir apenas o PostgreSQL primeiro
    docker compose up -d postgres

    # Aguardar o PostgreSQL estar pronto
    log_info "Aguardando PostgreSQL estar pronto..."
    sleep 10

    # Executar migrações
    docker compose run --rm oficina-app npx prisma migrate deploy

    # Gerar cliente Prisma
    docker compose run --rm oficina-app npx prisma generate

    # Executar seed (opcional)
    read -p "Deseja executar o seed do banco de dados? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose run --rm oficina-app npm run db:seed
        log_success "Seed executado com sucesso"
    fi
    
    log_success "Banco de dados inicializado"
}

# Deploy completo
deploy() {
    log_info "Iniciando deploy completo..."
    
    # Subir todos os serviços
    docker compose up -d
    
    # Aguardar serviços estarem prontos
    log_info "Aguardando serviços estarem prontos..."
    sleep 15
    
    # Verificar health checks
    check_health
    
    log_success "Deploy concluído com sucesso!"
    log_info "Aplicação disponível em: http://localhost"
    log_info "API disponível em: http://localhost/api"
    log_info "Health check: http://localhost/health"
}

# Verificar saúde dos serviços
check_health() {
    log_info "Verificando saúde dos serviços..."
    
    # Verificar PostgreSQL
    if docker compose exec postgres pg_isready -U oficina_user -d oficina_mecanica &>/dev/null; then
        log_success "PostgreSQL está saudável"
    else
        log_warning "PostgreSQL pode não estar totalmente pronto"
    fi
    
    # Verificar aplicação
    sleep 5
    if curl -f http://localhost/health &>/dev/null; then
        log_success "Aplicação está saudável"
    else
        log_warning "Aplicação pode não estar totalmente pronta"
    fi
}

# Mostrar logs
show_logs() {
    log_info "Mostrando logs dos serviços..."
    docker compose logs -f
}

# Parar serviços
stop_services() {
    log_info "Parando serviços..."
    docker compose down
    log_success "Serviços parados"
}

# Menu principal
show_menu() {
    echo
    echo "=== Sistema de Build - Oficina Mecânica ==="
    echo "1. Build completo (cleanup + build + deploy)"
    echo "2. Apenas build da aplicação"
    echo "3. Apenas deploy"
    echo "4. Inicializar banco de dados"
    echo "5. Verificar saúde dos serviços"
    echo "6. Mostrar logs"
    echo "7. Parar serviços"
    echo "8. Cleanup (limpar containers/imagens)"
    echo "0. Sair"
    echo
}

# Função principal
main() {
    log_info "Iniciando script de build da Oficina Mecânica"
    
    # Verificações iniciais
    check_docker
    check_files
    
    if [[ $# -eq 0 ]]; then
        # Modo interativo
        while true; do
            show_menu
            read -p "Escolha uma opção: " choice
            
            case $choice in
                1)
                    cleanup
                    build_app
                    init_database
                    deploy
                    ;;
                2)
                    build_app
                    ;;
                3)
                    deploy
                    ;;
                4)
                    init_database
                    ;;
                5)
                    check_health
                    ;;
                6)
                    show_logs
                    ;;
                7)
                    stop_services
                    ;;
                8)
                    cleanup
                    ;;
                0)
                    log_info "Saindo..."
                    exit 0
                    ;;
                *)
                    log_error "Opção inválida!"
                    ;;
            esac
            
            echo
            read -p "Pressione Enter para continuar..."
        done
    else
        # Modo não-interativo
        case $1 in
            "build")
                build_app
                ;;
            "deploy")
                deploy
                ;;
            "full")
                cleanup
                build_app
                init_database
                deploy
                ;;
            "cleanup")
                cleanup
                ;;
            "stop")
                stop_services
                ;;
            "logs")
                show_logs
                ;;
            "health")
                check_health
                ;;
            *)
                echo "Uso: $0 [build|deploy|full|cleanup|stop|logs|health]"
                exit 1
                ;;
        esac
    fi
}

# Executar função principal
main "$@"
