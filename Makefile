# Makefile para Oficina Mecânica
# Facilita o gerenciamento dos containers Docker

.PHONY: help dev prod build start stop restart logs status clean backup restore health

# Configurações
COMPOSE_DEV = docker-compose.yml
COMPOSE_PROD = docker-compose.prod.yml
ENV_DEV = .env
ENV_PROD = .env.production

# Cores para output
GREEN = \033[0;32m
YELLOW = \033[1;33m
BLUE = \033[0;34m
RED = \033[0;31m
NC = \033[0m # No Color

# Help
help: ## Mostrar esta ajuda
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║                    OFICINA MECÂNICA                          ║$(NC)"
	@echo "$(BLUE)║                   Comandos Disponíveis                       ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "$(GREEN)%-20s$(NC) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(YELLOW)Exemplos de uso:$(NC)"
	@echo "  make dev          # Ambiente de desenvolvimento"
	@echo "  make prod         # Deploy para produção"
	@echo "  make logs         # Ver logs em tempo real"
	@echo "  make backup       # Fazer backup do banco"

# Desenvolvimento
dev: ## Iniciar ambiente de desenvolvimento
	@echo "$(BLUE)[INFO]$(NC) Iniciando ambiente de desenvolvimento..."
	@docker compose -f $(COMPOSE_DEV) up -d
	@echo "$(GREEN)[SUCCESS]$(NC) Ambiente de desenvolvimento iniciado"
	@echo "$(BLUE)Aplicação disponível em: http://localhost:3000$(NC)"

dev-build: ## Build e iniciar desenvolvimento
	@echo "$(BLUE)[INFO]$(NC) Fazendo build para desenvolvimento..."
	@docker compose -f $(COMPOSE_DEV) up -d --build
	@echo "$(GREEN)[SUCCESS]$(NC) Build de desenvolvimento concluído"

dev-logs: ## Ver logs do desenvolvimento
	@docker compose -f $(COMPOSE_DEV) logs -f

dev-stop: ## Parar ambiente de desenvolvimento
	@echo "$(BLUE)[INFO]$(NC) Parando ambiente de desenvolvimento..."
	@docker compose -f $(COMPOSE_DEV) down
	@echo "$(GREEN)[SUCCESS]$(NC) Ambiente de desenvolvimento parado"

# Produção
prod: ## Deploy completo para produção
	@echo "$(BLUE)[INFO]$(NC) Iniciando deploy para produção..."
	@./deploy-production.sh deploy

prod-build: ## Build apenas para produção
	@echo "$(BLUE)[INFO]$(NC) Fazendo build para produção..."
	@./deploy-production.sh build

prod-start: ## Iniciar serviços de produção
	@echo "$(BLUE)[INFO]$(NC) Iniciando serviços de produção..."
	@./deploy-production.sh start

prod-stop: ## Parar serviços de produção
	@echo "$(BLUE)[INFO]$(NC) Parando serviços de produção..."
	@./deploy-production.sh stop

prod-restart: ## Reiniciar serviços de produção
	@echo "$(BLUE)[INFO]$(NC) Reiniciando serviços de produção..."
	@./deploy-production.sh restart

prod-logs: ## Ver logs de produção
	@./deploy-production.sh logs

prod-status: ## Status dos serviços de produção
	@./deploy-production.sh status

# Comandos gerais
build: ## Build das imagens Docker
	@echo "$(BLUE)[INFO]$(NC) Fazendo build das imagens..."
	@docker compose -f $(COMPOSE_DEV) build --no-cache

start: ## Iniciar serviços (desenvolvimento)
	@echo "$(BLUE)[INFO]$(NC) Iniciando serviços..."
	@docker compose -f $(COMPOSE_DEV) up -d

stop: ## Parar serviços
	@echo "$(BLUE)[INFO]$(NC) Parando serviços..."
	@docker compose -f $(COMPOSE_DEV) down

restart: ## Reiniciar serviços
	@echo "$(BLUE)[INFO]$(NC) Reiniciando serviços..."
	@docker compose -f $(COMPOSE_DEV) restart

logs: ## Ver logs em tempo real
	@docker compose -f $(COMPOSE_DEV) logs -f

status: ## Status dos containers
	@echo "$(BLUE)[INFO]$(NC) Status dos containers:"
	@docker compose -f $(COMPOSE_DEV) ps

# Banco de dados
db-migrate: ## Executar migrações do banco
	@echo "$(BLUE)[INFO]$(NC) Executando migrações..."
	@docker compose -f $(COMPOSE_DEV) exec oficina-app npx prisma migrate deploy
	@echo "$(GREEN)[SUCCESS]$(NC) Migrações executadas"

db-seed: ## Executar seed do banco
	@echo "$(BLUE)[INFO]$(NC) Executando seed..."
	@docker compose -f $(COMPOSE_DEV) exec oficina-app npm run db:seed
	@echo "$(GREEN)[SUCCESS]$(NC) Seed executado"

db-studio: ## Abrir Prisma Studio
	@echo "$(BLUE)[INFO]$(NC) Abrindo Prisma Studio..."
	@docker compose -f $(COMPOSE_DEV) exec oficina-app npx prisma studio

db-reset: ## Reset completo do banco
	@echo "$(RED)[WARNING]$(NC) Esta operação irá apagar todos os dados!"
	@read -p "Tem certeza? (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker compose -f $(COMPOSE_DEV) exec oficina-app npx prisma migrate reset --force
	@echo "$(GREEN)[SUCCESS]$(NC) Banco resetado"

# Backup e Restore
backup: ## Fazer backup do banco de dados
	@echo "$(BLUE)[INFO]$(NC) Fazendo backup do banco de dados..."
	@docker compose -f $(COMPOSE_PROD) exec postgres /backup.sh backup
	@echo "$(GREEN)[SUCCESS]$(NC) Backup concluído"

backup-list: ## Listar backups disponíveis
	@echo "$(BLUE)[INFO]$(NC) Backups disponíveis:"
	@docker compose -f $(COMPOSE_PROD) exec postgres /backup.sh list

backup-verify: ## Verificar integridade de um backup
	@read -p "Nome do arquivo de backup: " backup_file; \
	docker compose -f $(COMPOSE_PROD) exec postgres /backup.sh verify $$backup_file

restore: ## Restaurar backup do banco
	@echo "$(RED)[WARNING]$(NC) Esta operação irá sobrescrever o banco atual!"
	@read -p "Nome do arquivo de backup: " backup_file; \
	read -p "Tem certeza? (y/N): " confirm && [ "$$confirm" = "y" ]; \
	docker compose -f $(COMPOSE_PROD) exec postgres /backup.sh restore $$backup_file

# Monitoramento
health: ## Verificar saúde dos serviços
	@echo "$(BLUE)[INFO]$(NC) Verificando saúde dos serviços..."
	@curl -f http://localhost/health && echo "$(GREEN)[SUCCESS]$(NC) Aplicação saudável" || echo "$(RED)[ERROR]$(NC) Aplicação com problemas"

monitor: ## Monitorar recursos dos containers
	@echo "$(BLUE)[INFO]$(NC) Monitorando recursos..."
	@docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"

# Limpeza
clean: ## Limpar containers, imagens e volumes não utilizados
	@echo "$(BLUE)[INFO]$(NC) Limpando recursos não utilizados..."
	@docker system prune -f
	@echo "$(GREEN)[SUCCESS]$(NC) Limpeza concluída"

clean-all: ## Limpeza completa (CUIDADO: remove volumes)
	@echo "$(RED)[WARNING]$(NC) Esta operação irá remover TODOS os dados!"
	@read -p "Tem certeza? (y/N): " confirm && [ "$$confirm" = "y" ]
	@docker compose -f $(COMPOSE_DEV) down -v
	@docker compose -f $(COMPOSE_PROD) down -v
	@docker system prune -af --volumes
	@echo "$(GREEN)[SUCCESS]$(NC) Limpeza completa concluída"

# Desenvolvimento
shell: ## Acessar shell do container da aplicação
	@docker compose -f $(COMPOSE_DEV) exec oficina-app sh

shell-db: ## Acessar shell do PostgreSQL
	@docker compose -f $(COMPOSE_DEV) exec postgres psql -U oficina_user -d oficina_mecanica

shell-redis: ## Acessar shell do Redis
	@docker compose -f $(COMPOSE_DEV) exec redis redis-cli

# Testes
test: ## Executar testes (quando implementados)
	@echo "$(BLUE)[INFO]$(NC) Executando testes..."
	@docker compose -f $(COMPOSE_DEV) exec oficina-app npm test

# Informações
info: ## Mostrar informações do sistema
	@echo "$(BLUE)╔══════════════════════════════════════════════════════════════╗$(NC)"
	@echo "$(BLUE)║                  INFORMAÇÕES DO SISTEMA                     ║$(NC)"
	@echo "$(BLUE)╚══════════════════════════════════════════════════════════════╝$(NC)"
	@echo ""
	@echo "$(GREEN)Docker:$(NC)"
	@docker --version
	@docker compose version
	@echo ""
	@echo "$(GREEN)Containers ativos:$(NC)"
	@docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
	@echo ""
	@echo "$(GREEN)Uso de espaço:$(NC)"
	@docker system df

# Default target
.DEFAULT_GOAL := help
