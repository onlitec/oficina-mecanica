#!/bin/bash

# Script de Instalação Docker com Virtual Host
# Instala a aplicação oficina mecânica em um virtual host separado

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configurações
DOCKER_DIR="/var/www/oficina-docker"
DOMAIN="oficina.local"
DOCKER_PORT="8080"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

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
    echo "║              Instalação Docker + Virtual Host                ║"
    echo "║                                                              ║"
    echo "║  🚗 Sistema Multi-Container                                  ║"
    echo "║  🌐 Virtual Host: $DOMAIN                           ║"
    echo "║  🐳 Docker Port: $DOCKER_PORT                                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
}

# Verificar se é root ou sudo
check_permissions() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script precisa ser executado como root ou com sudo"
        exit 1
    fi
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
    
    # Verificar Nginx
    if ! command -v nginx &> /dev/null; then
        log_error "Nginx não está instalado!"
        exit 1
    fi
    
    log_success "Pré-requisitos verificados"
}

# Criar estrutura de diretórios
create_directories() {
    log_step "Criando estrutura de diretórios..."
    
    # Criar diretório principal
    mkdir -p "$DOCKER_DIR"
    cd "$DOCKER_DIR"
    
    # Criar diretórios necessários
    mkdir -p {data/{postgres,redis,uploads,backups,logs/{app,nginx}},ssl,scripts}
    
    # Definir permissões
    chown -R www-data:www-data "$DOCKER_DIR"
    chmod -R 755 "$DOCKER_DIR"
    
    log_success "Estrutura de diretórios criada"
}

# Copiar arquivos do projeto
copy_project_files() {
    log_step "Copiando arquivos do projeto..."
    
    # Copiar arquivos principais
    cp /var/www/html/Dockerfile "$DOCKER_DIR/"
    cp /var/www/html/docker-compose.prod.yml "$DOCKER_DIR/docker-compose.yml"
    cp /var/www/html/.env.production "$DOCKER_DIR/.env"
    cp /var/www/html/package*.json "$DOCKER_DIR/"
    cp /var/www/html/tsconfig.json "$DOCKER_DIR/"
    cp /var/www/html/redis.conf "$DOCKER_DIR/"
    cp /var/www/html/Makefile "$DOCKER_DIR/"
    cp /var/www/html/deploy-production.sh "$DOCKER_DIR/"
    
    # Copiar diretórios
    cp -r /var/www/html/src "$DOCKER_DIR/"
    cp -r /var/www/html/prisma "$DOCKER_DIR/"
    cp -r /var/www/html/css "$DOCKER_DIR/"
    cp -r /var/www/html/js "$DOCKER_DIR/"
    cp -r /var/www/html/styles "$DOCKER_DIR/"
    cp -r /var/www/html/scripts "$DOCKER_DIR/"
    
    # Copiar arquivos HTML
    cp /var/www/html/*.html "$DOCKER_DIR/"
    cp /var/www/html/manifest.json "$DOCKER_DIR/" 2>/dev/null || true
    cp /var/www/html/sw.js "$DOCKER_DIR/" 2>/dev/null || true
    
    # Criar uploads inicial
    mkdir -p "$DOCKER_DIR/uploads"
    cp /var/www/html/uploads/* "$DOCKER_DIR/uploads/" 2>/dev/null || true
    
    log_success "Arquivos do projeto copiados"
}

# Configurar ambiente Docker
configure_docker_environment() {
    log_step "Configurando ambiente Docker..."
    
    cd "$DOCKER_DIR"
    
    # Atualizar .env com configurações específicas
    cat > .env << EOF
# ===========================================
# CONFIGURAÇÃO DOCKER - OFICINA MECÂNICA
# ===========================================

# Ambiente
NODE_ENV=production
LOG_LEVEL=info

# Portas dos serviços
APP_PORT=$DOCKER_PORT
HTTP_PORT=80
HTTPS_PORT=443
POSTGRES_PORT=5433
REDIS_PORT=6380

# Banco de Dados PostgreSQL
POSTGRES_DB=oficina_docker
POSTGRES_USER=oficina_docker_user
POSTGRES_PASSWORD=oficina_docker_pass_$(date +%s)
DATABASE_URL=postgresql://oficina_docker_user:oficina_docker_pass_$(date +%s)@postgres:5432/oficina_docker

# Segurança JWT
JWT_SECRET=oficina_docker_jwt_secret_$(openssl rand -hex 32)
JWT_EXPIRES_IN=7d

# CORS e Domínio
CORS_ORIGIN=http://$DOMAIN
DOMAIN=$DOMAIN

# Dados da Empresa
COMPANY_NAME=Oficina Mecânica Docker
COMPANY_EMAIL=contato@$DOMAIN
COMPANY_PHONE=(11) 99999-9999

# Caminhos de Dados
DATA_PATH=./data

# Timezone
TZ=America/Sao_Paulo
EOF
    
    # Tornar scripts executáveis
    chmod +x deploy-production.sh
    chmod +x scripts/*.sh 2>/dev/null || true
    
    log_success "Ambiente Docker configurado"
}

# Criar virtual host Nginx
create_nginx_vhost() {
    log_step "Criando virtual host Nginx..."
    
    # Verificar se diretórios existem, se não, criar
    mkdir -p "$NGINX_SITES_AVAILABLE" 2>/dev/null || true
    mkdir -p "$NGINX_SITES_ENABLED" 2>/dev/null || true
    
    # Criar configuração do virtual host
    cat > "$NGINX_SITES_AVAILABLE/$DOMAIN" << EOF
# Virtual Host para Oficina Mecânica Docker
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    
    # Logs específicos
    access_log /var/log/nginx/${DOMAIN}_access.log;
    error_log /var/log/nginx/${DOMAIN}_error.log;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Proxy para aplicação Docker
    location / {
        proxy_pass http://127.0.0.1:$DOCKER_PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
    
    # Health check
    location /health {
        proxy_pass http://127.0.0.1:$DOCKER_PORT/health;
        access_log off;
    }
    
    # Rate limiting para API
    location /api/ {
        limit_req zone=api burst=20 nodelay;
        proxy_pass http://127.0.0.1:$DOCKER_PORT;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
    
    # Cache para arquivos estáticos
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:$DOCKER_PORT;
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }
}
EOF
    
    # Habilitar site
    ln -sf "$NGINX_SITES_AVAILABLE/$DOMAIN" "$NGINX_SITES_ENABLED/$DOMAIN" 2>/dev/null || {
        # Se não existir sites-enabled, adicionar ao nginx.conf principal
        log_warning "Diretório sites-enabled não existe, adicionando ao nginx.conf"
        
        # Backup do nginx.conf
        cp /etc/nginx/nginx.conf /etc/nginx/nginx.conf.backup
        
        # Adicionar configuração ao nginx.conf
        cat >> /etc/nginx/nginx.conf << EOF

# Virtual Host Oficina Docker
$(cat "$NGINX_SITES_AVAILABLE/$DOMAIN")
EOF
    }
    
    log_success "Virtual host criado: $DOMAIN"
}

# Configurar /etc/hosts
configure_hosts() {
    log_step "Configurando /etc/hosts..."
    
    # Verificar se já existe entrada
    if ! grep -q "$DOMAIN" /etc/hosts; then
        echo "127.0.0.1 $DOMAIN www.$DOMAIN" >> /etc/hosts
        log_success "Entrada adicionada ao /etc/hosts"
    else
        log_info "Entrada já existe no /etc/hosts"
    fi
}

# Iniciar Docker
start_docker() {
    log_step "Iniciando serviços Docker..."
    
    cd "$DOCKER_DIR"
    
    # Iniciar Docker daemon se não estiver rodando
    systemctl start docker
    systemctl enable docker
    
    # Build e start dos containers
    docker compose build --no-cache
    docker compose up -d
    
    # Aguardar serviços estarem prontos
    log_info "Aguardando serviços estarem prontos..."
    sleep 30
    
    # Executar migrações
    docker compose exec -T oficina-app npx prisma migrate deploy || true
    docker compose exec -T oficina-app npx prisma generate || true
    
    log_success "Serviços Docker iniciados"
}

# Reiniciar Nginx
restart_nginx() {
    log_step "Reiniciando Nginx..."
    
    # Testar configuração
    nginx -t
    
    if [[ $? -eq 0 ]]; then
        systemctl reload nginx
        log_success "Nginx recarregado com sucesso"
    else
        log_error "Erro na configuração do Nginx"
        exit 1
    fi
}

# Verificar instalação
verify_installation() {
    log_step "Verificando instalação..."
    
    # Verificar containers
    cd "$DOCKER_DIR"
    docker compose ps
    
    # Verificar health check
    sleep 10
    if curl -f "http://$DOMAIN/health" &>/dev/null; then
        log_success "Aplicação respondendo corretamente"
    else
        log_warning "Aplicação pode não estar totalmente pronta"
    fi
    
    # Verificar Nginx
    if systemctl is-active --quiet nginx; then
        log_success "Nginx está ativo"
    else
        log_warning "Nginx pode ter problemas"
    fi
}

# Mostrar informações finais
show_final_info() {
    log_step "Instalação concluída!"
    
    echo -e "${GREEN}"
    echo "╔══════════════════════════════════════════════════════════════╗"
    echo "║                   INSTALAÇÃO CONCLUÍDA                      ║"
    echo "╚══════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    
    echo "🌍 Aplicação Docker disponível em:"
    echo "   • Frontend: http://$DOMAIN"
    echo "   • API: http://$DOMAIN/api"
    echo "   • Health Check: http://$DOMAIN/health"
    echo ""
    echo "📁 Diretório de instalação: $DOCKER_DIR"
    echo "🐳 Porta Docker: $DOCKER_PORT"
    echo ""
    echo "📋 Comandos úteis:"
    echo "   • Ver logs: cd $DOCKER_DIR && docker compose logs -f"
    echo "   • Parar: cd $DOCKER_DIR && docker compose down"
    echo "   • Reiniciar: cd $DOCKER_DIR && docker compose restart"
    echo "   • Status: cd $DOCKER_DIR && docker compose ps"
    echo ""
    echo "🔧 Gerenciamento:"
    echo "   • Makefile: cd $DOCKER_DIR && make help"
    echo "   • Deploy: cd $DOCKER_DIR && ./deploy-production.sh"
}

# Função principal
main() {
    show_banner
    
    check_permissions
    check_prerequisites
    create_directories
    copy_project_files
    configure_docker_environment
    create_nginx_vhost
    configure_hosts
    start_docker
    restart_nginx
    verify_installation
    show_final_info
}

# Executar função principal
main "$@"
