#!/bin/bash

# Script de Deploy para Produção - Oficina Mecânica
# Automatiza o processo completo de deploy em ambiente de produção

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configurações
COMPOSE_FILE="docker-compose.prod.yml"
ENV_FILE=".env.production"
DATA_DIR="./data"
SSL_DIR="./ssl"
BACKUP_DIR="${DATA_DIR}/backups"

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

log_step() {
    echo -e "${PURPLE}[STEP]${NC} $1"
}

# Banner
show_banner() {
    echo -e "${BLUE}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                    OFICINA MECÂNICA                          ║"
    echo "║                   Deploy para Produção                       ║"
    echo "║                                                              ║"
    echo "║  🚗 Sistema Completo de Gestão Automotiva                   ║"
    echo "║  🐳 Deploy Multi-Container Docker                           ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar pré-requisitos
check_prerequisites() {
    log_step "Verificando pré-requisitos..."
    
    # Verificar Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker não está instalado!"
        exit 1
    fi
    
    # Verificar Docker Compose
    if ! docker compose version &> /dev/null; then
        log_error "Docker Compose não está instalado!"
        exit 1
    fi
    
    # Verificar arquivos necessários
    local required_files=("$COMPOSE_FILE" "Dockerfile" "nginx.conf" "redis.conf")
    for file in "${required_files[@]}"; do
        if [[ ! -f "$file" ]]; then
            log_error "Arquivo necessário não encontrado: $file"
            exit 1
        fi
    done
    
    log_success "Pré-requisitos verificados"
}

# Configurar ambiente
setup_environment() {
    log_step "Configurando ambiente de produção..."
    
    # Criar arquivo .env se não existir
    if [[ ! -f "$ENV_FILE" ]]; then
        log_warning "Arquivo $ENV_FILE não encontrado, criando template..."
        cp .env.production.template "$ENV_FILE" 2>/dev/null || {
            log_error "Template de ambiente não encontrado!"
            exit 1
        }
    fi
    
    # Verificar se senhas padrão foram alteradas
    if grep -q "ALTERE_ESTA_SENHA" "$ENV_FILE"; then
        log_error "ATENÇÃO: Senhas padrão detectadas no arquivo $ENV_FILE"
        log_error "Altere todas as senhas antes de continuar!"
        exit 1
    fi
    
    # Criar estrutura de diretórios
    log_info "Criando estrutura de diretórios..."
    mkdir -p "$DATA_DIR"/{postgres,redis,uploads,backups,logs/{app,nginx}}
    mkdir -p "$SSL_DIR"
    
    # Definir permissões
    chmod 755 "$DATA_DIR"
    chmod 755 "$DATA_DIR"/{postgres,redis,uploads,backups}
    chmod 755 "$DATA_DIR"/logs/{app,nginx}
    
    log_success "Ambiente configurado"
}

# Configurar SSL (opcional)
setup_ssl() {
    log_step "Configurando SSL..."
    
    if [[ ! -f "$SSL_DIR/cert.pem" ]] || [[ ! -f "$SSL_DIR/key.pem" ]]; then
        log_warning "Certificados SSL não encontrados"
        
        read -p "Deseja gerar certificados auto-assinados para desenvolvimento? (y/N): " -n 1 -r
        echo
        
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            log_info "Gerando certificados auto-assinados..."
            
            openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
                -keyout "$SSL_DIR/key.pem" \
                -out "$SSL_DIR/cert.pem" \
                -subj "/C=BR/ST=SP/L=SaoPaulo/O=OficinaMecanica/CN=localhost"
            
            chmod 600 "$SSL_DIR"/{key.pem,cert.pem}
            log_success "Certificados auto-assinados criados"
        else
            log_info "Pulando configuração SSL"
        fi
    else
        log_success "Certificados SSL encontrados"
    fi
}

# Build das imagens
build_images() {
    log_step "Construindo imagens Docker..."
    
    # Build com cache otimizado
    docker compose -f "$COMPOSE_FILE" build --no-cache oficina-app
    
    if [[ $? -eq 0 ]]; then
        log_success "Imagens construídas com sucesso"
    else
        log_error "Falha na construção das imagens"
        exit 1
    fi
}

# Deploy dos serviços
deploy_services() {
    log_step "Fazendo deploy dos serviços..."
    
    # Carregar variáveis de ambiente
    export $(cat "$ENV_FILE" | grep -v '^#' | xargs)
    
    # Subir serviços em ordem
    log_info "Iniciando PostgreSQL..."
    docker compose -f "$COMPOSE_FILE" up -d postgres
    
    log_info "Aguardando PostgreSQL estar pronto..."
    sleep 15
    
    log_info "Iniciando Redis..."
    docker compose -f "$COMPOSE_FILE" up -d redis
    
    log_info "Aguardando Redis estar pronto..."
    sleep 10
    
    log_info "Iniciando aplicação..."
    docker compose -f "$COMPOSE_FILE" up -d oficina-app
    
    log_info "Aguardando aplicação estar pronta..."
    sleep 20
    
    log_info "Iniciando Nginx..."
    docker compose -f "$COMPOSE_FILE" up -d nginx
    
    log_success "Serviços iniciados"
}

# Executar migrações
run_migrations() {
    log_step "Executando migrações do banco de dados..."
    
    # Aguardar aplicação estar totalmente pronta
    sleep 10
    
    # Executar migrações
    docker compose -f "$COMPOSE_FILE" exec oficina-app npx prisma migrate deploy
    
    if [[ $? -eq 0 ]]; then
        log_success "Migrações executadas com sucesso"
    else
        log_warning "Falha nas migrações - verifique logs"
    fi
    
    # Gerar cliente Prisma
    docker compose -f "$COMPOSE_FILE" exec oficina-app npx prisma generate
    
    # Executar seed (opcional)
    read -p "Deseja executar o seed do banco de dados? (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        docker compose -f "$COMPOSE_FILE" exec oficina-app npm run db:seed
        log_success "Seed executado"
    fi
}

# Verificar saúde dos serviços
health_check() {
    log_step "Verificando saúde dos serviços..."
    
    local services=("postgres" "redis" "oficina-app" "nginx")
    local all_healthy=true
    
    for service in "${services[@]}"; do
        log_info "Verificando $service..."
        
        if docker compose -f "$COMPOSE_FILE" ps "$service" | grep -q "healthy"; then
            log_success "$service está saudável"
        else
            log_warning "$service pode não estar totalmente pronto"
            all_healthy=false
        fi
    done
    
    # Verificar endpoint da aplicação
    sleep 5
    if curl -f http://localhost/health &>/dev/null; then
        log_success "Aplicação respondendo corretamente"
    else
        log_warning "Aplicação pode não estar totalmente pronta"
        all_healthy=false
    fi
    
    if $all_healthy; then
        log_success "Todos os serviços estão saudáveis"
    else
        log_warning "Alguns serviços podem precisar de mais tempo"
    fi
}

# Mostrar informações finais
show_final_info() {
    log_step "Deploy concluído!"
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                     DEPLOY CONCLUÍDO                        ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo "🌍 Aplicação disponível em:"
    echo "   • Frontend: http://localhost"
    echo "   • API: http://localhost/api"
    echo "   • Health Check: http://localhost/health"
    echo ""
    echo "📊 Serviços ativos:"
    docker compose -f "$COMPOSE_FILE" ps
    echo ""
    echo "📋 Comandos úteis:"
    echo "   • Ver logs: docker compose -f $COMPOSE_FILE logs -f"
    echo "   • Parar: docker compose -f $COMPOSE_FILE down"
    echo "   • Backup: docker compose -f $COMPOSE_FILE exec backup /backup.sh"
    echo "   • Status: docker compose -f $COMPOSE_FILE ps"
}

# Função principal
main() {
    show_banner
    
    case "${1:-deploy}" in
        "deploy")
            check_prerequisites
            setup_environment
            setup_ssl
            build_images
            deploy_services
            run_migrations
            health_check
            show_final_info
            ;;
        "build")
            check_prerequisites
            build_images
            ;;
        "start")
            deploy_services
            health_check
            ;;
        "stop")
            log_info "Parando serviços..."
            docker compose -f "$COMPOSE_FILE" down
            log_success "Serviços parados"
            ;;
        "restart")
            log_info "Reiniciando serviços..."
            docker compose -f "$COMPOSE_FILE" restart
            health_check
            ;;
        "logs")
            docker compose -f "$COMPOSE_FILE" logs -f
            ;;
        "status")
            docker compose -f "$COMPOSE_FILE" ps
            ;;
        *)
            echo "Uso: $0 {deploy|build|start|stop|restart|logs|status}"
            echo ""
            echo "Comandos:"
            echo "  deploy   - Deploy completo (padrão)"
            echo "  build    - Apenas build das imagens"
            echo "  start    - Apenas iniciar serviços"
            echo "  stop     - Parar serviços"
            echo "  restart  - Reiniciar serviços"
            echo "  logs     - Mostrar logs"
            echo "  status   - Status dos serviços"
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
