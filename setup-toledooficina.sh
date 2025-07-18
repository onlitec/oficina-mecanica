#!/bin/bash

# Script para configurar o virtual host toledooficina.local
echo "🌐 Configurando virtual host toledooficina.local..."

# Verificar se está rodando como root ou com sudo
if [ "$EUID" -ne 0 ]; then
    echo "❌ Este script precisa ser executado com sudo"
    echo "   Execute: sudo ./setup-toledooficina.sh"
    exit 1
fi

# 1. Copiar arquivo de configuração para sites-available
echo "📁 Copiando configuração do Nginx..."
cp toledooficina-nginx.conf /etc/nginx/sites-available/toledooficina.local

if [ $? -eq 0 ]; then
    echo "✅ Configuração copiada para /etc/nginx/sites-available/toledooficina.local"
else
    echo "❌ Erro ao copiar configuração"
    exit 1
fi

# 2. Criar link simbólico para sites-enabled
echo "🔗 Habilitando site..."
ln -sf /etc/nginx/sites-available/toledooficina.local /etc/nginx/sites-enabled/

if [ $? -eq 0 ]; then
    echo "✅ Site habilitado em /etc/nginx/sites-enabled/"
else
    echo "❌ Erro ao habilitar site"
    exit 1
fi

# 3. Adicionar entrada no /etc/hosts
echo "📝 Configurando /etc/hosts..."
if ! grep -q "toledooficina.local" /etc/hosts; then
    echo "127.0.0.1    toledooficina.local" >> /etc/hosts
    echo "127.0.0.1    www.toledooficina.local" >> /etc/hosts
    echo "✅ Entradas adicionadas ao /etc/hosts"
else
    echo "✅ Entradas já existem no /etc/hosts"
fi

# 4. Testar configuração do Nginx
echo "🧪 Testando configuração do Nginx..."
nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Configuração do Nginx válida"
else
    echo "❌ Erro na configuração do Nginx"
    exit 1
fi

# 5. Recarregar Nginx
echo "🔄 Recarregando Nginx..."
systemctl reload nginx

if [ $? -eq 0 ]; then
    echo "✅ Nginx recarregado com sucesso"
else
    echo "❌ Erro ao recarregar Nginx"
    exit 1
fi

# 6. Verificar se o serviço Node.js está rodando
echo "🔍 Verificando serviço Node.js..."
if systemctl is-active --quiet oficina-mecanica; then
    echo "✅ Serviço Node.js está ativo"
else
    echo "⚠️  Serviço Node.js não está ativo. Iniciando..."
    systemctl start oficina-mecanica
    if [ $? -eq 0 ]; then
        echo "✅ Serviço Node.js iniciado"
    else
        echo "❌ Erro ao iniciar serviço Node.js"
    fi
fi

echo ""
echo "🎉 VIRTUAL HOST CONFIGURADO COM SUCESSO!"
echo ""
echo "🌐 URLs disponíveis:"
echo "   http://toledooficina.local"
echo "   http://www.toledooficina.local"
echo ""
echo "🔄 Redirecionamentos automáticos:"
echo "   http://toledooficina.local/ → http://toledooficina.local/dashboard.html"
echo ""
echo "📊 Endpoints da API:"
echo "   http://toledooficina.local/api"
echo "   http://toledooficina.local/health"
echo ""
echo "🔑 Credenciais de teste:"
echo "   admin@oficina.com / admin123"
echo "   mecanico@oficina.com / mecanico123"
echo ""
echo "📋 Para testar:"
echo "   1. Abra o navegador"
echo "   2. Acesse: http://toledooficina.local"
echo "   3. Será redirecionado para o dashboard"
echo "   4. Faça login com as credenciais acima"
