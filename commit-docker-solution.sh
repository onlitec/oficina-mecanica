#!/bin/bash

echo "🚀 Fazendo commit da solução Docker multi-container..."
echo "====================================================="

# Navegar para o diretório do projeto
cd /var/www/html

# Verificar status do git
echo "📋 Status atual do repositório:"
git status --porcelain

# Adicionar todos os arquivos
echo ""
echo "➕ Adicionando arquivos ao staging..."
git add .

# Verificar arquivos adicionados
echo ""
echo "📁 Arquivos que serão commitados:"
git diff --cached --name-only

# Fazer commit com mensagem detalhada
echo ""
echo "💾 Fazendo commit..."
git commit -m "feat: Implementação completa da solução Docker multi-container

🐳 SOLUÇÃO DOCKER MULTI-CONTAINER PARA PRODUÇÃO

✨ Novos recursos implementados:
- Arquitetura multi-container com 5 serviços especializados
- Docker Compose para desenvolvimento e produção
- Virtual Host configurado (oficina.local)
- Nginx como proxy reverso com otimizações
- Redis para cache e sessões
- Backup automático com retenção configurável
- Scripts de automação e deploy

📦 Containers implementados:
- oficina-app: Aplicação Node.js principal
- postgres: Banco PostgreSQL 15 otimizado
- redis: Cache e gerenciamento de sessões
- nginx: Proxy reverso e load balancer
- backup: Serviço de backup automático

🔧 Arquivos de configuração:
- Dockerfile: Imagem multi-stage otimizada
- docker-compose.yml: Orquestração para desenvolvimento
- docker-compose.prod.yml: Configuração para produção
- docker-compose.simple.yml: Versão simplificada
- docker-compose-working.yml: Configuração funcional
- nginx.conf: Proxy reverso com otimizações
- redis.conf: Configuração Redis para produção

🛠️ Scripts de automação:
- deploy-production.sh: Deploy automatizado para produção
- docker-build.sh: Build e gerenciamento de containers
- install-docker-vhost.sh: Instalação com virtual host
- setup-vhost-simple.sh: Configuração simplificada
- configure-hosts.sh: Configuração do /etc/hosts
- diagnose-502.sh: Diagnóstico de problemas
- fix-vhost-complete.sh: Correção completa da instalação
- Makefile: Comandos simplificados de gerenciamento

📚 Documentação:
- README-Docker.md: Guia completo do Docker
- README-MultiContainer.md: Documentação da arquitetura
- .env.production: Template de configuração para produção

🔒 Recursos de segurança:
- Containers com usuários não-root
- Rede isolada para comunicação entre serviços
- Rate limiting configurado no Nginx
- Headers de segurança implementados
- Senhas via variáveis de ambiente

📈 Otimizações de performance:
- Multi-stage build para reduzir tamanho das imagens
- Cache Redis para sessões e dados temporários
- Compressão Gzip no Nginx
- Health checks automáticos
- Resource limits configurados

🌐 Virtual Host configurado:
- Domínio: oficina.local
- Porta Docker: 8080
- Proxy Nginx configurado
- /etc/hosts configurado automaticamente

🎯 Como usar:
- Desenvolvimento: make dev
- Produção: make prod
- Virtual Host: ./install-docker-vhost.sh
- Deploy completo: ./deploy-production.sh

Esta implementação fornece uma solução enterprise-grade completa
para deploy da aplicação oficina mecânica em ambiente Docker,
com alta disponibilidade, escalabilidade e facilidade de manutenção."

# Verificar se o commit foi bem-sucedido
if [ $? -eq 0 ]; then
    echo "✅ Commit realizado com sucesso!"
    
    # Fazer push
    echo ""
    echo "🌐 Fazendo push para o repositório remoto..."
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Push realizado com sucesso!"
        echo ""
        echo "🎉 Solução Docker multi-container commitada e enviada!"
        echo "📊 Resumo do que foi enviado:"
        echo "   • Arquitetura multi-container completa"
        echo "   • Scripts de automação e deploy"
        echo "   • Configurações para desenvolvimento e produção"
        echo "   • Virtual host configurado"
        echo "   • Documentação completa"
        echo "   • Makefile para gerenciamento simplificado"
    else
        echo "❌ Erro ao fazer push"
        echo "Verifique a conectividade e permissões do repositório"
    fi
else
    echo "❌ Erro ao fazer commit"
    echo "Verifique se há conflitos ou problemas no repositório"
fi

echo ""
echo "📋 Status final do repositório:"
git status --porcelain
