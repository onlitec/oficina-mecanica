#!/bin/bash
# Script de backup automático para PostgreSQL
# Executa backup completo do banco de dados

set -e

# Configurações
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="oficina_backup_${DATE}.sql"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"
RETENTION_DAYS=${BACKUP_RETENTION_DAYS:-30}

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Verificar se o diretório de backup existe
if [ ! -d "$BACKUP_DIR" ]; then
    log_info "Criando diretório de backup: $BACKUP_DIR"
    mkdir -p "$BACKUP_DIR"
fi

# Função para verificar se o PostgreSQL está acessível
check_postgres() {
    log_info "Verificando conexão com PostgreSQL..."
    
    if pg_isready -h postgres -U "$POSTGRES_USER" -d "$POSTGRES_DB" > /dev/null 2>&1; then
        log_success "PostgreSQL está acessível"
        return 0
    else
        log_error "PostgreSQL não está acessível"
        return 1
    fi
}

# Função para executar backup
execute_backup() {
    log_info "Iniciando backup do banco de dados..."
    log_info "Arquivo: $BACKUP_FILE"
    
    # Executar pg_dump
    PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
        -h postgres \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --verbose \
        --clean \
        --if-exists \
        --create \
        --format=custom \
        --compress=9 \
        --file="$BACKUP_PATH"
    
    if [ $? -eq 0 ]; then
        log_success "Backup criado com sucesso: $BACKUP_FILE"
        
        # Verificar tamanho do arquivo
        BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
        log_info "Tamanho do backup: $BACKUP_SIZE"
        
        # Criar link simbólico para o backup mais recente
        ln -sf "$BACKUP_FILE" "${BACKUP_DIR}/latest.sql"
        log_info "Link simbólico criado: latest.sql"
        
        return 0
    else
        log_error "Falha ao criar backup"
        return 1
    fi
}

# Função para limpar backups antigos
cleanup_old_backups() {
    log_info "Limpando backups antigos (mais de $RETENTION_DAYS dias)..."
    
    # Encontrar e remover backups antigos
    DELETED_COUNT=$(find "$BACKUP_DIR" -name "oficina_backup_*.sql" -type f -mtime +$RETENTION_DAYS -delete -print | wc -l)
    
    if [ "$DELETED_COUNT" -gt 0 ]; then
        log_success "Removidos $DELETED_COUNT backups antigos"
    else
        log_info "Nenhum backup antigo para remover"
    fi
}

# Função para listar backups existentes
list_backups() {
    log_info "Backups existentes:"
    
    if [ -d "$BACKUP_DIR" ] && [ "$(ls -A $BACKUP_DIR)" ]; then
        ls -lah "$BACKUP_DIR"/oficina_backup_*.sql 2>/dev/null | while read line; do
            echo "  $line"
        done
    else
        log_warning "Nenhum backup encontrado"
    fi
}

# Função para verificar integridade do backup
verify_backup() {
    local backup_file="$1"
    
    log_info "Verificando integridade do backup: $(basename $backup_file)"
    
    # Verificar se o arquivo existe e não está vazio
    if [ ! -f "$backup_file" ] || [ ! -s "$backup_file" ]; then
        log_error "Arquivo de backup inválido ou vazio"
        return 1
    fi
    
    # Verificar se é um arquivo pg_dump válido
    if pg_restore --list "$backup_file" > /dev/null 2>&1; then
        log_success "Backup verificado com sucesso"
        return 0
    else
        log_error "Backup corrompido ou inválido"
        return 1
    fi
}

# Função para restaurar backup
restore_backup() {
    local backup_file="$1"
    
    if [ -z "$backup_file" ]; then
        log_error "Nome do arquivo de backup não especificado"
        return 1
    fi
    
    local full_path="${BACKUP_DIR}/${backup_file}"
    
    if [ ! -f "$full_path" ]; then
        log_error "Arquivo de backup não encontrado: $backup_file"
        return 1
    fi
    
    log_warning "ATENÇÃO: Esta operação irá sobrescrever o banco de dados atual!"
    log_info "Restaurando backup: $backup_file"
    
    # Verificar integridade antes de restaurar
    if ! verify_backup "$full_path"; then
        log_error "Backup inválido, restauração cancelada"
        return 1
    fi
    
    # Executar restore
    PGPASSWORD="$POSTGRES_PASSWORD" pg_restore \
        -h postgres \
        -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" \
        --verbose \
        --clean \
        --if-exists \
        "$full_path"
    
    if [ $? -eq 0 ]; then
        log_success "Backup restaurado com sucesso"
        return 0
    else
        log_error "Falha ao restaurar backup"
        return 1
    fi
}

# Função principal
main() {
    local action="${1:-backup}"
    
    case "$action" in
        "backup")
            if check_postgres; then
                execute_backup && cleanup_old_backups
            else
                exit 1
            fi
            ;;
        "list")
            list_backups
            ;;
        "verify")
            local backup_file="$2"
            if [ -z "$backup_file" ]; then
                log_error "Especifique o nome do arquivo de backup"
                exit 1
            fi
            verify_backup "${BACKUP_DIR}/${backup_file}"
            ;;
        "restore")
            local backup_file="$2"
            if [ -z "$backup_file" ]; then
                log_error "Especifique o nome do arquivo de backup"
                exit 1
            fi
            restore_backup "$backup_file"
            ;;
        "cleanup")
            cleanup_old_backups
            ;;
        *)
            echo "Uso: $0 {backup|list|verify|restore|cleanup} [arquivo]"
            echo ""
            echo "Comandos:"
            echo "  backup   - Criar novo backup (padrão)"
            echo "  list     - Listar backups existentes"
            echo "  verify   - Verificar integridade de um backup"
            echo "  restore  - Restaurar um backup"
            echo "  cleanup  - Limpar backups antigos"
            exit 1
            ;;
    esac
}

# Executar função principal
main "$@"
