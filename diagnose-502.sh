#!/bin/bash

echo "🔍 Diagnosticando erro 502 Bad Gateway..."
echo "========================================"

# 1. Verificar se Docker está rodando
echo "🐳 Verificando Docker..."
if systemctl is-active --quiet docker; then
    echo "✅ Docker daemon está ativo"
else
    echo "❌ Docker daemon não está ativo"
    echo "Para iniciar: sudo systemctl start docker"
    exit 1
fi

# 2. Verificar containers
echo ""
echo "📦 Verificando containers..."
if [ -d "/var/www/oficina-docker" ]; then
    cd /var/www/oficina-docker
    echo "Containers ativos:"
    sudo docker compose ps
    echo ""
    echo "Status detalhado:"
    sudo docker ps -a | grep oficina
else
    echo "❌ Diretório /var/www/oficina-docker não existe"
    echo "Execute primeiro a instalação do virtual host"
    exit 1
fi

# 3. Verificar porta 8080
echo ""
echo "🔌 Verificando porta 8080..."
if netstat -tuln | grep -q ":8080"; then
    echo "✅ Porta 8080 está em uso:"
    netstat -tuln | grep ":8080"
else
    echo "❌ Porta 8080 não está em uso"
    echo "A aplicação Docker não está rodando na porta 8080"
fi

# 4. Testar conexão direta
echo ""
echo "🌐 Testando conexão direta..."
echo "Testando http://localhost:8080..."
if curl -s -o /dev/null -w "%{http_code}" http://localhost:8080 | grep -q "200\|404\|500"; then
    echo "✅ Aplicação está respondendo na porta 8080"
    echo "Status: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)"
else
    echo "❌ Aplicação não está respondendo na porta 8080"
    echo "Status: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:8080)"
fi

# 5. Verificar logs dos containers
echo ""
echo "📋 Logs dos containers (últimas 10 linhas)..."
if [ -d "/var/www/oficina-docker" ]; then
    cd /var/www/oficina-docker
    echo "--- Logs da aplicação ---"
    sudo docker compose logs --tail=10 oficina-app 2>/dev/null || echo "Container oficina-app não encontrado"
    echo ""
    echo "--- Logs do PostgreSQL ---"
    sudo docker compose logs --tail=10 postgres 2>/dev/null || echo "Container postgres não encontrado"
fi

# 6. Verificar configuração Nginx
echo ""
echo "🔧 Verificando configuração Nginx..."
echo "Testando configuração:"
sudo nginx -t

echo ""
echo "Verificando virtual host oficina.local:"
if [ -f "/etc/nginx/sites-available/oficina.local" ]; then
    echo "✅ Arquivo de configuração existe"
    echo "Proxy configurado para:"
    grep "proxy_pass" /etc/nginx/sites-available/oficina.local
else
    echo "❌ Arquivo de configuração não encontrado"
fi

# 7. Verificar logs do Nginx
echo ""
echo "📄 Logs do Nginx (últimas 5 linhas)..."
echo "--- Error log ---"
sudo tail -5 /var/log/nginx/error.log 2>/dev/null || echo "Log de erro não encontrado"
echo ""
echo "--- Access log ---"
sudo tail -5 /var/log/nginx/access.log 2>/dev/null || echo "Log de acesso não encontrado"

# 8. Verificar /etc/hosts
echo ""
echo "🔗 Verificando /etc/hosts..."
if grep -q "oficina.local" /etc/hosts; then
    echo "✅ Entrada encontrada:"
    grep "oficina.local" /etc/hosts
else
    echo "❌ Entrada não encontrada no /etc/hosts"
fi

echo ""
echo "🛠️ SOLUÇÕES POSSÍVEIS:"
echo "======================"

# Verificar se containers estão rodando
if ! sudo docker ps | grep -q "oficina"; then
    echo "1. ❌ Containers não estão rodando"
    echo "   Solução: cd /var/www/oficina-docker && sudo docker compose up -d --build"
fi

# Verificar se porta 8080 está livre
if ! netstat -tuln | grep -q ":8080"; then
    echo "2. ❌ Aplicação não está na porta 8080"
    echo "   Solução: Verificar se containers iniciaram corretamente"
fi

# Verificar se há erro de build
echo ""
echo "3. 🔧 Para reconstruir containers:"
echo "   cd /var/www/oficina-docker"
echo "   sudo docker compose down"
echo "   sudo docker compose up -d --build"

echo ""
echo "4. 📋 Para ver logs em tempo real:"
echo "   cd /var/www/oficina-docker"
echo "   sudo docker compose logs -f"

echo ""
echo "5. 🌐 Para testar diretamente:"
echo "   curl http://localhost:8080/health"
