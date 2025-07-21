#!/bin/bash

# Script para iniciar o Sistema de Gestão de Oficina Mecânica

echo "🚗 Iniciando Sistema de Gestão de Oficina Mecânica..."

# Verificar se o Nginx está rodando
if ! systemctl is-active --quiet nginx; then
    echo "⚠️  Nginx não está rodando. Tentando iniciar..."
    sudo systemctl start nginx
    if [ $? -eq 0 ]; then
        echo "✅ Nginx iniciado com sucesso!"
    else
        echo "❌ Erro ao iniciar Nginx"
        exit 1
    fi
else
    echo "✅ Nginx já está rodando"
fi

# Carregar NVM
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Verificar se Node.js está disponível
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não encontrado. Certifique-se de que o NVM está configurado."
    exit 1
fi

echo "✅ Node.js $(node --version) encontrado"

# Ir para o diretório da aplicação
cd /var/www/html

# Verificar se as dependências estão instaladas
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    unset NODE_OPTIONS
    npm install
fi

# Iniciar a aplicação
echo "🚀 Iniciando aplicação Node.js..."
unset NODE_OPTIONS
echo ""
echo "📊 URLs disponíveis:"
echo "   🏠 Interface Web: http://localhost/"
echo "   🔧 API: http://localhost/api"
echo "   🏥 Health Check: http://localhost/health"
echo "   👥 Usuários: http://localhost/api/users"
echo "   🏢 Clientes: http://localhost/api/customers"
echo ""
echo "🔑 Credenciais de teste:"
echo "   Admin: admin@oficina.com / admin123"
echo "   Mecânico: mecanico@oficina.com / mecanico123"
echo ""
echo "⏹️  Para parar: Ctrl+C"
echo ""

# Executar a aplicação
npm run dev
