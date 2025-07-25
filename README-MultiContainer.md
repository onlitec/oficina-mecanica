# 🐳 Solução Multi-Container - Oficina Mecânica

## 📋 Visão Geral

Esta é uma solução Docker multi-container completa para produção, que inclui todos os serviços necessários para executar o sistema de gestão de oficina mecânica de forma escalável e robusta.

## 🏗️ Arquitetura Multi-Container

### Containers Incluídos

1. **oficina-app** - Aplicação Node.js principal
2. **postgres** - Banco de dados PostgreSQL 15
3. **redis** - Cache e gerenciamento de sessões
4. **nginx** - Proxy reverso e load balancer
5. **backup** - Serviço de backup automático

### Diagrama da Arquitetura

```
┌─────────────────┐    ┌─────────────────┐
│     Internet    │────│      Nginx      │
│                 │    │   (Port 80/443) │
└─────────────────┘    └─────────┬───────┘
                                 │
                       ┌─────────▼───────┐
                       │  Oficina App    │
                       │   (Port 3000)   │
                       └─────────┬───────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼──────┐ ┌───▼────┐ ┌────▼─────┐
            │  PostgreSQL  │ │ Redis  │ │  Backup  │
            │ (Port 5432)  │ │(Port   │ │ Service  │
            │              │ │ 6379)  │ │          │
            └──────────────┘ └────────┘ └──────────┘
```

## 🚀 Deploy Rápido

### 1. Deploy Automático (Recomendado)

```bash
# Fazer deploy completo
make prod

# Ou usando o script diretamente
./deploy-production.sh deploy
```

### 2. Deploy Manual

```bash
# 1. Configurar ambiente
cp .env.production .env
# Editar .env com suas configurações

# 2. Build das imagens
make prod-build

# 3. Iniciar serviços
make prod-start

# 4. Executar migrações
make db-migrate
```

## ⚙️ Configuração

### Arquivo .env.production

```env
# Banco de Dados
POSTGRES_DB=oficina_mecanica
POSTGRES_USER=oficina_user
POSTGRES_PASSWORD=SUA_SENHA_SEGURA_AQUI

# Aplicação
JWT_SECRET=SUA_CHAVE_JWT_MUITO_LONGA_E_SEGURA
COMPANY_NAME=Sua Oficina Mecânica
COMPANY_EMAIL=contato@suaoficina.com

# Redis
REDIS_PASSWORD=SUA_SENHA_REDIS_SEGURA

# Domínio
CORS_ORIGIN=https://seudominio.com.br
```

### Estrutura de Diretórios

```
./data/
├── postgres/     # Dados do PostgreSQL
├── redis/        # Dados do Redis
├── uploads/      # Arquivos enviados
├── backups/      # Backups automáticos
└── logs/         # Logs dos serviços
    ├── app/      # Logs da aplicação
    └── nginx/    # Logs do Nginx
```

## 🔧 Comandos Úteis

### Makefile (Recomendado)

```bash
# Ver todos os comandos disponíveis
make help

# Desenvolvimento
make dev              # Ambiente de desenvolvimento
make dev-logs         # Logs de desenvolvimento

# Produção
make prod             # Deploy completo
make prod-logs        # Logs de produção
make prod-status      # Status dos serviços

# Banco de dados
make db-migrate       # Executar migrações
make db-seed          # Executar seed
make backup           # Fazer backup
make restore          # Restaurar backup

# Monitoramento
make health           # Verificar saúde
make monitor          # Monitorar recursos
```

### Docker Compose Direto

```bash
# Produção
docker compose -f docker-compose.prod.yml up -d
docker compose -f docker-compose.prod.yml logs -f
docker compose -f docker-compose.prod.yml down

# Desenvolvimento
docker compose up -d
docker compose logs -f
docker compose down
```

## 📊 Monitoramento

### Health Checks

Todos os containers possuem health checks configurados:

```bash
# Verificar status de todos os serviços
make status

# Verificar saúde da aplicação
curl http://localhost/health

# Monitorar recursos em tempo real
make monitor
```

### Logs

```bash
# Logs de todos os serviços
make logs

# Logs específicos
docker compose logs -f oficina-app
docker compose logs -f postgres
docker compose logs -f nginx
```

## 💾 Backup e Restore

### Backup Automático

O sistema inclui backup automático configurado via cron:

```bash
# Fazer backup manual
make backup

# Listar backups
make backup-list

# Verificar integridade
make backup-verify
```

### Restore

```bash
# Restaurar backup específico
make restore
# Será solicitado o nome do arquivo
```

### Scripts de Backup

```bash
# Backup manual
docker compose exec postgres /backup.sh backup

# Listar backups
docker compose exec postgres /backup.sh list

# Restaurar
docker compose exec postgres /backup.sh restore backup_20240125_120000.sql
```

## 🔒 Segurança

### Configurações Implementadas

1. **Containers**:
   - Usuários não-root
   - Imagens Alpine (menor superfície de ataque)
   - Resource limits configurados

2. **Network**:
   - Rede isolada para containers
   - Rate limiting no Nginx
   - Headers de segurança

3. **Dados**:
   - Volumes persistentes
   - Backup automático
   - Senhas via variáveis de ambiente

### Checklist de Segurança

- [ ] Alterar todas as senhas padrão
- [ ] Configurar certificados SSL
- [ ] Configurar firewall
- [ ] Configurar backup automático
- [ ] Monitorar logs de segurança

## 📈 Performance

### Otimizações Implementadas

1. **Aplicação**:
   - Multi-stage build
   - Cache Redis para sessões
   - Compressão Gzip

2. **Banco de Dados**:
   - Configurações otimizadas
   - Índices automáticos via Prisma
   - Connection pooling

3. **Nginx**:
   - Cache de arquivos estáticos
   - Compressão
   - Keep-alive connections

### Resource Limits

```yaml
# Aplicação
limits:
  memory: 2G
  cpus: '2.0'

# PostgreSQL
limits:
  memory: 2G
  cpus: '2.0'

# Redis
limits:
  memory: 512M
  cpus: '1.0'
```

## 🔄 Escalabilidade

### Escalar Horizontalmente

```bash
# Escalar aplicação para 3 instâncias
docker compose -f docker-compose.prod.yml up -d --scale oficina-app=3

# Nginx fará load balancing automaticamente
```

### Configurar Load Balancer

O Nginx está configurado para fazer load balancing automático entre múltiplas instâncias da aplicação.

## 🛠️ Troubleshooting

### Problemas Comuns

1. **Aplicação não inicia**:
   ```bash
   # Verificar logs
   make logs
   
   # Verificar saúde
   make health
   ```

2. **Banco não conecta**:
   ```bash
   # Verificar PostgreSQL
   docker compose exec postgres pg_isready
   
   # Verificar logs do banco
   docker compose logs postgres
   ```

3. **Nginx não responde**:
   ```bash
   # Verificar configuração
   docker compose exec nginx nginx -t
   
   # Recarregar configuração
   docker compose exec nginx nginx -s reload
   ```

### Comandos de Diagnóstico

```bash
# Status detalhado
docker compose ps

# Uso de recursos
docker stats

# Logs com timestamp
docker compose logs -t

# Verificar rede
docker network ls
docker network inspect oficina_oficina_network
```

## 📞 Suporte

### Logs Importantes

1. **Aplicação**: `./data/logs/app/`
2. **Nginx**: `./data/logs/nginx/`
3. **PostgreSQL**: `docker compose logs postgres`
4. **Redis**: `docker compose logs redis`

### Comandos de Debug

```bash
# Acessar shell da aplicação
make shell

# Acessar banco de dados
make shell-db

# Acessar Redis
make shell-redis

# Verificar configurações
make info
```

---

**🚗 Sistema completo e robusto para gestão de oficinas mecânicas!**
