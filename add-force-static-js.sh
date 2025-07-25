#!/bin/bash

# Script para adicionar force-menu-static.js a todas as páginas

echo "🔧 Adicionando force-menu-static.js a todas as páginas..."

# Lista de arquivos HTML para corrigir
HTML_FILES=(
    "customers.html"
    "customer-form.html"
    "settings.html"
    "reports.html"
    "parts.html"
    "service-orders.html"
    "financial.html"
    "analytics.html"
    "notifications.html"
    "invoices.html"
    "quotes.html"
    "part-form.html"
    "part-view.html"
    "service-order-form.html"
    "service-order-view.html"
    "quote-form.html"
    "email-config.html"
    "report-consumption.html"
    "report-low-stock.html"
    "report-movement.html"
    "login.html"
    "test-menu-stability.html"
)

# Função para adicionar JS em um arquivo
add_js_to_file() {
    local file="$1"
    
    if [ -f "$file" ]; then
        echo "📝 Processando $file..."
        
        # Verificar se já tem o JS
        if grep -q "force-menu-static.js" "$file"; then
            echo "  ✅ $file já tem force-menu-static.js"
        else
            # Adicionar antes de </body>
            if grep -q "</body>" "$file"; then
                sed -i 's|</body>|    <script src="js/force-menu-static.js"></script>\n</body>|g' "$file"
                echo "  ✅ Adicionado force-menu-static.js a $file"
            else
                echo "  ⚠️ $file não tem </body>, pulando..."
            fi
        fi
    else
        echo "  ⚠️ $file não encontrado"
    fi
}

# Processar cada arquivo
for file in "${HTML_FILES[@]}"; do
    add_js_to_file "$file"
done

echo ""
echo "🎉 Processamento concluído!"
echo ""
echo "📋 Resumo:"
echo "  • Adicionado force-menu-static.js às páginas"
echo "  • JavaScript com monitoramento contínuo"
echo "  • Força estabilidade via DOM manipulation"
echo "  • Observer para detectar mudanças"
echo ""
echo "🔧 O menu agora deve ser forçado a permanecer estático!"
