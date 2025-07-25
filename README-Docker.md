# 🐳 Docker - Sistema de Gestão de Oficina Mecânica

Este documento contém todas as informações necessárias para executar o sistema usando Docker.

## 📋 Pré-requisitos

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM disponível
- 10GB espaço em disco

## 🚀 Início Rápido

### 1. Build e Deploy Automático

```bash
# Tornar o script executável (se necessário)
chmod +x docker-build.sh

# Executar build completo
./docker-build.sh full
```

### 2. Build Manual

```bash
# Build da aplicação
docker-compose build

# Subir os serviços
docker-compose up -d

# Executar migrações do banco
docker-compose exec oficina-app npx prisma migrate deploy

# Executar seed (opcional)
docker-compose exec oficina-app npm run db:seed
```

## 🏗️ Arquitetura dos Containers

### Serviços Disponíveis

1. **oficina-app**: Aplicação Node.js principal
   - Porta: 3000
   - Health check: `/health`
   - Logs: `docker-compose logs oficina-app`

2. **postgres**: Banco de dados PostgreSQL
   - Porta: 5432
   - Database: `oficina_mecanica`
   - User: `oficina_user`

3. **nginx**: Proxy reverso (opcional)
   - Porta: 80 (HTTP)
   - Porta: 443 (HTTPS)
   - Rate limiting configurado

## 🔧 Comandos Úteis

### Gerenciamento de Containers

```bash
# Subir todos os serviços
docker-compose up -d

# Parar todos os serviços
docker-compose down

# Reiniciar um serviço específico
docker-compose restart oficina-app

# Ver logs em tempo real
docker-compose logs -f

# Ver logs de um serviço específico
docker-compose logs -f oficina-app
```

### Banco de Dados

```bash
# Executar migrações
docker-compose exec oficina-app npx prisma migrate deploy

# Gerar cliente Prisma
docker-compose exec oficina-app npx prisma generate

# Executar seed
docker-compose exec oficina-app npm run db:seed

# Acessar banco diretamente
docker-compose exec postgres psql -U oficina_user -d oficina_mecanica

# Backup do banco
docker-compose exec postgres pg_dump -U oficina_user oficina_mecanica > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U oficina_user oficina_mecanica < backup.sql
```

### Desenvolvimento

```bash
# Executar comandos na aplicação
docker-compose exec oficina-app npm run [comando]

# Acessar shell do container
docker-compose exec oficina-app sh

# Instalar nova dependência
docker-compose exec oficina-app npm install [pacote]

# Rebuild após mudanças no código
docker-compose build oficina-app
docker-compose up -d oficina-app
```

## 🌍 Variáveis de Ambiente

### Principais Configurações

```env
# Banco de dados
DATABASE_URL=postgresql://oficina_user:oficina_password123@postgres:5432/oficina_mecanica

# Servidor
NODE_ENV=production
PORT=3000

# Segurança
JWT_SECRET=sua-chave-secreta-muito-longa-e-aleatoria
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost
```

### Arquivo .env.production

Copie e configure o arquivo `.env.production` com suas configurações:

```bash
cp .env.production .env
# Edite o arquivo .env com suas configurações
```

## 📊 Monitoramento

### Health Checks

```bash
# Verificar saúde da aplicação
curl http://localhost/health

# Verificar saúde do PostgreSQL
docker-compose exec postgres pg_isready -U oficina_user -d oficina_mecanica

# Status de todos os containers
docker-compose ps
```

### Logs e Debugging

```bash
# Logs detalhados
docker-compose logs --details

# Logs com timestamp
docker-compose logs -t

# Seguir logs de um serviço
docker-compose logs -f oficina-app

# Ver últimas 100 linhas
docker-compose logs --tail=100
```

## 🔒 Segurança

### Configurações Implementadas

1. **Container Security**:
   - Usuário não-root
   - Imagem Alpine (menor superfície de ataque)
   - Multi-stage build

2. **Network Security**:
   - Rede isolada para containers
   - Rate limiting no Nginx
   - Headers de segurança

3. **Data Security**:
   - Volumes persistentes
   - Backup automático configurável
   - Variáveis de ambiente seguras

### Recomendações para Produção

```bash
# 1. Alterar senhas padrão
# Edite docker-compose.yml e .env.production

# 2. Configurar HTTPS
# Adicione certificados SSL no nginx.conf

# 3. Configurar backup automático
# Configure cron job para backup do banco

# 4. Monitoramento
# Adicione ferramentas como Prometheus/Grafana
```

## 🚨 Troubleshooting

### Problemas Comuns

1. **Erro de conexão com banco**:
   ```bash
   # Verificar se PostgreSQL está rodando
   docker-compose ps postgres
   
   # Verificar logs do banco
   docker-compose logs postgres
   ```

2. **Aplicação não inicia**:
   ```bash
   # Verificar logs da aplicação
   docker-compose logs oficina-app
   
   # Verificar se build foi bem-sucedido
   docker images | grep oficina
   ```

3. **Erro de permissão**:
   ```bash
   # Verificar permissões do volume
   docker-compose exec oficina-app ls -la /app/uploads
   
   # Corrigir permissões se necessário
   docker-compose exec oficina-app chown -R oficina:nodejs /app/uploads
   ```

4. **Porta já em uso**:
   ```bash
   # Verificar processos usando a porta
   sudo netstat -tulpn | grep :3000
   
   # Alterar porta no docker-compose.yml se necessário
   ```

### Comandos de Diagnóstico

```bash
# Informações do sistema Docker
docker system info

# Uso de recursos
docker stats

# Espaço em disco
docker system df

# Limpeza geral
docker system prune -a
```

## 📈 Performance

### Otimizações Implementadas

1. **Build Otimizado**:
   - Multi-stage build
   - Cache de dependências
   - Imagem Alpine

2. **Runtime Otimizado**:
   - Health checks
   - Resource limits
   - Restart policies

3. **Nginx Optimizations**:
   - Gzip compression
   - Static file caching
   - Connection pooling

### Monitoramento de Performance

```bash
# Uso de recursos por container
docker stats --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}"

# Logs de performance
docker-compose logs nginx | grep -E "(upstream|timeout)"
```

## 🔄 Backup e Restore

### Backup Automático

```bash
# Script de backup (adicionar ao cron)
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U oficina_user oficina_mecanica > "backup_${DATE}.sql"
```

### Restore Manual

```bash
# Restaurar backup específico
docker-compose exec -T postgres psql -U oficina_user oficina_mecanica < backup_20240125_120000.sql
```

## 📞 Suporte

Para problemas ou dúvidas:

1. Verifique os logs: `docker-compose logs`
2. Consulte este README
3. Verifique issues no repositório
4. Execute o script de diagnóstico: `./docker-build.sh health`

---

**Desenvolvido com ❤️ para gestão eficiente de oficinas mecânicas**
