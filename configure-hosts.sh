#!/bin/bash

echo "🔗 Configurando /etc/hosts para oficina.local..."

# Verificar se já existe entrada
if grep -q "oficina.local" /etc/hosts; then
    echo "⚠️ Entrada já existe no /etc/hosts. Removendo entrada antiga..."
    sudo sed -i '/oficina.local/d' /etc/hosts
fi

# Adicionar nova entrada
echo "➕ Adicionando entrada ao /etc/hosts..."
echo "127.0.0.1 oficina.local www.oficina.local" | sudo tee -a /etc/hosts

echo "✅ Entrada adicionada com sucesso!"

# Mostrar conteúdo do /etc/hosts relacionado
echo ""
echo "📋 Entradas relacionadas no /etc/hosts:"
grep -E "(localhost|oficina)" /etc/hosts

# Testar resolução DNS
echo ""
echo "🔍 Testando resolução DNS..."
if ping -c 1 oficina.local >/dev/null 2>&1; then
    echo "✅ oficina.local está resolvendo corretamente"
else
    echo "❌ Problema na resolução de oficina.local"
fi

# Verificar se a porta 8080 está sendo usada
echo ""
echo "🔌 Verificando porta 8080..."
if netstat -tuln | grep -q ":8080"; then
    echo "✅ Porta 8080 está em uso"
    netstat -tuln | grep ":8080"
else
    echo "⚠️ Porta 8080 não está em uso - Docker pode não estar rodando"
fi

# Verificar status do Nginx
echo ""
echo "🌐 Verificando Nginx..."
if systemctl is-active --quiet nginx; then
    echo "✅ Nginx está ativo"
else
    echo "❌ Nginx não está ativo"
    echo "Para iniciar: sudo systemctl start nginx"
fi

# Testar configuração do Nginx
echo ""
echo "🔧 Testando configuração Nginx..."
if sudo nginx -t >/dev/null 2>&1; then
    echo "✅ Configuração Nginx está válida"
else
    echo "❌ Erro na configuração Nginx"
    sudo nginx -t
fi

echo ""
echo "📝 Próximos passos:"
echo "1. Certifique-se de que o Docker está rodando:"
echo "   cd /var/www/oficina-docker && sudo docker compose up -d"
echo ""
echo "2. Teste no navegador:"
echo "   http://oficina.local"
echo ""
echo "3. Se ainda não funcionar, teste diretamente a porta:"
echo "   http://localhost:8080"
