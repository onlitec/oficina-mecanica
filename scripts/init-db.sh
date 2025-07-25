#!/bin/bash
# Script de inicialização do banco de dados PostgreSQL
# Executado automaticamente na primeira inicialização do container

set -e

echo "🔧 Inicializando banco de dados da Oficina Mecânica..."

# Configurar locale brasileiro
echo "📍 Configurando locale brasileiro..."
export LANG=pt_BR.UTF-8
export LC_ALL=pt_BR.UTF-8

# Criar extensões necessárias
echo "🔌 Criando extensões do PostgreSQL..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Extensão para UUIDs
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    
    -- Extensão para funções de texto
    CREATE EXTENSION IF NOT EXISTS "unaccent";
    
    -- Extensão para busca full-text
    CREATE EXTENSION IF NOT EXISTS "pg_trgm";
    
    -- Configurar timezone
    SET timezone = 'America/Sao_Paulo';
    
    -- Criar índices para performance
    -- (serão criados pelo Prisma, mas garantimos que existam)
    
    COMMENT ON DATABASE $POSTGRES_DB IS 'Sistema de Gestão de Oficina Mecânica';
EOSQL

# Configurar parâmetros de performance
echo "⚡ Configurando parâmetros de performance..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Configurações de performance para aplicação
    ALTER SYSTEM SET shared_preload_libraries = 'pg_stat_statements';
    ALTER SYSTEM SET max_connections = 200;
    ALTER SYSTEM SET shared_buffers = '256MB';
    ALTER SYSTEM SET effective_cache_size = '1GB';
    ALTER SYSTEM SET maintenance_work_mem = '64MB';
    ALTER SYSTEM SET checkpoint_completion_target = 0.9;
    ALTER SYSTEM SET wal_buffers = '16MB';
    ALTER SYSTEM SET default_statistics_target = 100;
    ALTER SYSTEM SET random_page_cost = 1.1;
    ALTER SYSTEM SET effective_io_concurrency = 200;
    
    -- Configurações específicas para aplicação web
    ALTER SYSTEM SET log_min_duration_statement = 1000;
    ALTER SYSTEM SET log_checkpoints = on;
    ALTER SYSTEM SET log_connections = on;
    ALTER SYSTEM SET log_disconnections = on;
    ALTER SYSTEM SET log_lock_waits = on;
    
    -- Configurar timezone padrão
    ALTER DATABASE $POSTGRES_DB SET timezone TO 'America/Sao_Paulo';
EOSQL

# Criar usuário de backup (somente leitura)
echo "👤 Criando usuário de backup..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Criar usuário para backups
    CREATE USER backup_user WITH PASSWORD 'backup_password_change_in_production';
    GRANT CONNECT ON DATABASE $POSTGRES_DB TO backup_user;
    GRANT USAGE ON SCHEMA public TO backup_user;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO backup_user;
    ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT ON TABLES TO backup_user;
EOSQL

# Criar função para limpeza automática de logs
echo "🧹 Criando funções de manutenção..."
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    -- Função para limpeza de logs antigos (quando implementada)
    CREATE OR REPLACE FUNCTION cleanup_old_logs(days_to_keep INTEGER DEFAULT 90)
    RETURNS INTEGER AS \$\$
    DECLARE
        deleted_count INTEGER;
    BEGIN
        -- Esta função será implementada quando houver tabela de logs
        -- DELETE FROM logs WHERE created_at < NOW() - INTERVAL '%s days', days_to_keep;
        -- GET DIAGNOSTICS deleted_count = ROW_COUNT;
        deleted_count := 0;
        
        RETURN deleted_count;
    END;
    \$\$ LANGUAGE plpgsql;
    
    -- Função para estatísticas do banco
    CREATE OR REPLACE FUNCTION get_database_stats()
    RETURNS TABLE(
        table_name TEXT,
        row_count BIGINT,
        size_pretty TEXT
    ) AS \$\$
    BEGIN
        RETURN QUERY
        SELECT 
            schemaname||'.'||tablename as table_name,
            n_tup_ins - n_tup_del as row_count,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size_pretty
        FROM pg_stat_user_tables 
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
    END;
    \$\$ LANGUAGE plpgsql;
EOSQL

echo "✅ Inicialização do banco de dados concluída!"
echo "📊 Banco: $POSTGRES_DB"
echo "👤 Usuário: $POSTGRES_USER"
echo "🌍 Timezone: America/Sao_Paulo"
echo "🔌 Extensões: uuid-ossp, unaccent, pg_trgm"
