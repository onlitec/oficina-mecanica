#!/bin/bash

# Script para atualizar o menu global em todas as páginas HTML
# Este script automatiza a aplicação do menu global consistente

echo "🔧 Iniciando atualização do menu global em todas as páginas..."

# Lista de páginas que precisam do menu global (excluindo login e páginas especiais)
PAGES=(
    "analytics.html"
    "customer-form.html"
    "email-config.html"
    "financial.html"
    "invoices.html"
    "mobile-customers.html"
    "mobile.html"
    "mobile-orders.html"
    "notifications.html"
    "part-form.html"
    "parts.html"
    "part-view.html"
    "quote-form.html"
    "quotes.html"
    "report-consumption.html"
    "report-low-stock.html"
    "report-movement.html"
    "reports.html"
    "service-order-form.html"
    "service-orders.html"
    "service-order-view.html"
)

# Função para atualizar uma página
update_page() {
    local page=$1
    echo "📄 Atualizando $page..."
    
    # Backup da página original
    cp "$page" "$page.backup"
    
    # Verificar se a página já tem o script do menu global
    if grep -q "global-menu.js" "$page"; then
        echo "   ✅ $page já tem o menu global"
        return
    fi
    
    # Adicionar o script do menu global antes do </body>
    sed -i 's|</body>|    <script src="/js/global-menu.js"></script>\n</body>|' "$page"
    
    echo "   ✅ $page atualizada com sucesso"
}

# Atualizar cada página
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        update_page "$page"
    else
        echo "   ⚠️  $page não encontrada"
    fi
done

echo ""
echo "🎉 Atualização do menu global concluída!"
echo ""
echo "📋 Resumo:"
echo "   - Script do menu global: /js/global-menu.js"
echo "   - Páginas atualizadas: ${#PAGES[@]}"
echo "   - Backups criados: *.backup"
echo ""
echo "🔍 Para verificar se funcionou:"
echo "   1. Acesse qualquer página do sistema"
echo "   2. Verifique se o menu está visível no topo"
echo "   3. Teste a navegação entre páginas"
echo ""
echo "✅ Menu global aplicado com sucesso!"
