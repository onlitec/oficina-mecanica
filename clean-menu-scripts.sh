#!/bin/bash

# Script para limpar e organizar os scripts do menu em todas as páginas

echo "🧹 Limpando e organizando scripts do menu..."

PAGES=(
    "customers.html"
    "parts.html" 
    "quotes.html"
    "financial.html"
    "analytics.html"
    "dashboard.html"
    "customer-form.html"
    "service-order-form.html"
    "part-form.html"
    "quote-form.html"
    "service-order-view.html"
    "part-view.html"
    "reports.html"
    "settings.html"
)

for page in "${PAGES[@]}"; do
    if [ -f "$page" ]; then
        echo "📄 Processando $page..."
        
        # Criar backup
        cp "$page" "$page.backup-clean"
        
        # Remover scripts duplicados e desnecessários
        sed -i '/force-menu-size.js/d' "$page"
        sed -i '/debug-menu-styles.js/d' "$page"
        sed -i '/emergency-menu-fix.js/d' "$page"
        sed -i '/fix-menu-alignment.js/d' "$page"
        
        # Garantir que simple-menu-fix.css está no head
        if ! grep -q "simple-menu-fix.css" "$page"; then
            sed -i '/<head>/a\    <link rel="stylesheet" href="/simple-menu-fix.css">' "$page"
            echo "  ✅ CSS adicionado"
        fi
        
        # Garantir que simple-menu-fix.js está após global-menu.js
        if ! grep -q "simple-menu-fix.js" "$page"; then
            sed -i '/global-menu.js/a\    <script src="/simple-menu-fix.js"></script>' "$page"
            echo "  ✅ JS adicionado"
        fi
        
        echo "  ✅ $page limpa e organizada"
    else
        echo "  ❌ $page não encontrada"
    fi
done

echo ""
echo "🎉 Limpeza concluída!"
echo ""
echo "📋 RESUMO:"
echo "   - Scripts removidos: force-menu-size.js, debug-menu-styles.js, emergency-menu-fix.js"
echo "   - Scripts mantidos: simple-menu-fix.css, simple-menu-fix.js"
echo "   - Backups criados: *.backup-clean"
echo ""
echo "🌐 TESTE AGORA:"
echo "   - http://toledooficina.local/service-orders.html"
echo "   - http://toledooficina.local/customers.html"
echo "   - http://toledooficina.local/parts.html"
echo ""
echo "✅ Todas as páginas devem ter o menu limpo (apenas texto, sem bordas, sem zoom)!"
