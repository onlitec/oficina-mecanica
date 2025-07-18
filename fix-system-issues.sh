#!/bin/bash

# Script para Corrigir Problemas do Sistema
echo "=== CORREÇÃO AUTOMÁTICA DE PROBLEMAS ==="
echo "Data: $(date)"
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

fixed_count=0

echo "🔧 1. CORRIGINDO LOGO-MANAGER EM PÁGINAS..."
echo "==========================================="

# Lista de páginas que devem ter logo-manager
pages_to_fix=(
    "index.html"
    "login.html"
    "dashboard.html"
    "customers.html"
    "service-orders.html"
    "parts.html"
    "quotes.html"
    "financial.html"
    "analytics.html"
    "settings.html"
    "reports.html"
    "notifications.html"
    "customer-form.html"
    "service-order-form.html"
    "part-form.html"
    "quote-form.html"
    "service-order-view.html"
    "part-view.html"
    "invoices.html"
    "email-config.html"
    "report-consumption.html"
    "report-movement.html"
    "report-low-stock.html"
)

for page in "${pages_to_fix[@]}"; do
    if [ -f "$page" ]; then
        # Verificar se já tem logo-manager.js
        if ! grep -q "logo-manager.js" "$page"; then
            # Verificar se tem global-menu.js
            if grep -q "global-menu.js" "$page"; then
                echo -e "🔄 Corrigindo ${YELLOW}$page${NC}..."
                # Adicionar logo-manager.js antes do global-menu.js
                sed -i 's|<script src="/js/global-menu.js"></script>|<script src="/js/logo-manager.js"></script>\n    <script src="/js/global-menu.js"></script>|g' "$page"
                echo -e "✅ ${GREEN}$page${NC} - Logo-manager.js adicionado"
                ((fixed_count++))
            else
                echo -e "⚠️ ${YELLOW}$page${NC} - Não possui global-menu.js, pulando"
            fi
        else
            echo -e "✅ ${GREEN}$page${NC} - Já possui logo-manager.js"
        fi
    else
        echo -e "❌ ${RED}$page${NC} - Arquivo não encontrado"
    fi
done

echo ""
echo "📁 2. VERIFICANDO E CRIANDO ESTRUTURAS NECESSÁRIAS..."
echo "===================================================="

# Criar pasta uploads se não existir
if [ ! -d "uploads" ]; then
    mkdir -p uploads
    chmod 755 uploads
    echo -e "✅ ${GREEN}Pasta uploads criada${NC}"
    ((fixed_count++))
else
    echo -e "✅ ${GREEN}Pasta uploads${NC} - OK"
fi

# Verificar permissões da pasta uploads
if [ -d "uploads" ]; then
    chmod 755 uploads
    echo -e "✅ ${GREEN}Permissões da pasta uploads${NC} - Corrigidas"
fi

echo ""
echo "🔗 3. VERIFICANDO LINKS QUEBRADOS EM PÁGINAS..."
echo "==============================================="

# Função para verificar e corrigir links comuns
fix_common_links() {
    local file=$1
    local changes=0
    
    # Corrigir links relativos comuns
    if grep -q 'href="customer-view.html"' "$file" 2>/dev/null; then
        # customer-view.html não existe, corrigir para customer-form.html
        sed -i 's|href="customer-view.html"|href="customer-form.html"|g' "$file"
        ((changes++))
    fi
    
    # Corrigir links para service-orders
    if grep -q 'href="service-order.html"' "$file" 2>/dev/null; then
        sed -i 's|href="service-order.html"|href="service-orders.html"|g' "$file"
        ((changes++))
    fi
    
    # Corrigir links para parts
    if grep -q 'href="part.html"' "$file" 2>/dev/null; then
        sed -i 's|href="part.html"|href="parts.html"|g' "$file"
        ((changes++))
    fi
    
    if [ $changes -gt 0 ]; then
        echo -e "✅ ${GREEN}$file${NC} - $changes link(s) corrigido(s)"
        ((fixed_count++))
    fi
}

# Verificar links em páginas principais
for page in "${pages_to_fix[@]}"; do
    if [ -f "$page" ]; then
        fix_common_links "$page"
    fi
done

echo ""
echo "🔐 4. VERIFICANDO SISTEMA DE AUTENTICAÇÃO..."
echo "==========================================="

# Verificar se auth.js existe
if [ -f "js/auth.js" ]; then
    echo -e "✅ ${GREEN}js/auth.js${NC} - OK"
else
    echo -e "❌ ${RED}js/auth.js${NC} - Arquivo não encontrado"
    echo "   Criando arquivo básico de autenticação..."
    
    mkdir -p js
    cat > js/auth.js << 'EOF'
// Sistema de Autenticação Básico
function checkAuth() {
    const user = localStorage.getItem('user');
    if (!user) {
        // Redirecionar para login apenas se não estiver na página de login
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = '/login.html';
        }
        return null;
    }
    return JSON.parse(user);
}

function logout() {
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// Verificar autenticação automaticamente
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuth);
} else {
    checkAuth();
}
EOF
    echo -e "✅ ${GREEN}js/auth.js${NC} - Criado"
    ((fixed_count++))
fi

echo ""
echo "📄 5. VERIFICANDO PÁGINAS ESSENCIAIS..."
echo "======================================"

# Verificar se index.html redireciona corretamente
if [ -f "index.html" ]; then
    if ! grep -q "dashboard.html" "index.html"; then
        echo -e "🔄 Corrigindo redirecionamento em ${YELLOW}index.html${NC}..."
        # Adicionar redirecionamento se não existir
        if ! grep -q "window.location.href" "index.html"; then
            sed -i '/<head>/a\    <script>window.location.href = "/dashboard.html";</script>' "index.html"
            echo -e "✅ ${GREEN}index.html${NC} - Redirecionamento adicionado"
            ((fixed_count++))
        fi
    fi
else
    echo -e "⚠️ ${YELLOW}index.html${NC} - Criando arquivo de redirecionamento..."
    cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sistema de Gestão de Oficina Mecânica</title>
    <script>
        // Redirecionar para dashboard
        window.location.href = "/dashboard.html";
    </script>
</head>
<body>
    <p>Redirecionando para o sistema...</p>
</body>
</html>
EOF
    echo -e "✅ ${GREEN}index.html${NC} - Criado"
    ((fixed_count++))
fi

echo ""
echo "🎨 6. VERIFICANDO CONSISTÊNCIA DE ESTILOS..."
echo "==========================================="

# Verificar se todas as páginas têm o comentário sobre global-menu
pages_checked=0
for page in "${pages_to_fix[@]}"; do
    if [ -f "$page" ]; then
        if ! grep -q "Global menu will be inserted here" "$page"; then
            # Adicionar comentário se não existir
            if grep -q "<body>" "$page"; then
                sed -i '/<body>/a\    <!-- Global menu will be inserted here by global-menu.js -->' "$page"
                echo -e "✅ ${GREEN}$page${NC} - Comentário do menu global adicionado"
                ((fixed_count++))
            fi
        fi
        ((pages_checked++))
    fi
done

echo -e "📄 Páginas verificadas: ${BLUE}$pages_checked${NC}"

echo ""
echo "📊 7. RESUMO DAS CORREÇÕES"
echo "========================="
echo -e "🔧 Total de correções aplicadas: ${GREEN}$fixed_count${NC}"

if [ $fixed_count -gt 0 ]; then
    echo -e "✅ ${GREEN}CORREÇÕES APLICADAS COM SUCESSO!${NC}"
    echo ""
    echo "🔄 Recomendações pós-correção:"
    echo "   1. Teste as páginas principais"
    echo "   2. Verifique se o logo aparece em todas as páginas"
    echo "   3. Teste o sistema de autenticação"
    echo "   4. Execute novamente o health check:"
    echo "      ./system-health-check.sh"
else
    echo -e "ℹ️ ${BLUE}NENHUMA CORREÇÃO NECESSÁRIA${NC} - Sistema já está funcionando corretamente!"
fi

echo ""
echo "🌐 Teste o sistema em: http://toledooficina.local"
