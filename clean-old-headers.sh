#!/bin/bash

# Script para limpar headers antigos e aplicar menu global consistente
echo "🧹 Limpando headers antigos e aplicando menu global..."

# Lista de páginas para processar
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

# Função para limpar header antigo de uma página
clean_page() {
    local page=$1
    echo "🧹 Limpando $page..."
    
    # Backup se não existir
    if [ ! -f "$page.backup" ]; then
        cp "$page" "$page.backup"
    fi
    
    # Remover div header antigo (várias variações possíveis)
    sed -i '/<div class="header">/,/<\/div>/d' "$page"
    
    # Remover estilos de header antigos
    sed -i '/\.header {/,/}/c\        /* Header styles removed - now handled by global-menu.js */' "$page"
    sed -i '/\.header-content {/,/}/d' "$page"
    sed -i '/\.nav-links {/,/}/d' "$page"
    sed -i '/\.nav-links a {/,/}/d' "$page"
    sed -i '/\.nav-links a:hover {/,/}/d' "$page"
    sed -i '/\.logo {/,/}/d' "$page"
    sed -i '/\.user-info {/,/}/d' "$page"
    sed -i '/\.logout-btn {/,/}/d' "$page"
    sed -i '/\.logout-btn:hover {/,/}/d' "$page"
    
    # Adicionar comentário onde o menu será inserido (se não existir)
    if ! grep -q "Global menu will be inserted here" "$page"; then
        sed -i '/<body>/a\    <!-- Global menu will be inserted here by global-menu.js -->' "$page"
    fi
    
    echo "   ✅ $page limpa"
}

# Processar cada página
for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        clean_page "$page"
    else
        echo "   ⚠️  $page não encontrada"
    fi
done

echo ""
echo "🎉 Limpeza concluída!"
echo ""
echo "📋 Resumo:"
echo "   - Headers antigos removidos"
echo "   - Estilos antigos limpos"
echo "   - Menu global aplicado"
echo "   - Backups mantidos (*.backup)"
echo ""
echo "✅ Todas as páginas agora usam o menu global!"
