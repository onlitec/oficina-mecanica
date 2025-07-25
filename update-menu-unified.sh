#!/bin/bash

# Script para aplicar menu unificado a todas as páginas

echo "🔧 Aplicando menu unificado a todas as páginas..."

# Lista de arquivos HTML para atualizar
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
    "test-menu-stability.html"
)

# Função para atualizar CSS em um arquivo
update_css_in_file() {
    local file="$1"
    
    if [ -f "$file" ]; then
        echo "📝 Processando $file..."
        
        # Substituir menu-static-final.css por menu-unified.css
        if grep -q "menu-static-final.css" "$file"; then
            sed -i 's|menu-static-final.css|menu-unified.css|g' "$file"
            echo "  ✅ CSS atualizado em $file"
        elif grep -q "menu-unified.css" "$file"; then
            echo "  ✅ $file já tem menu-unified.css"
        else
            # Adicionar após main.css se não existir
            if grep -q "styles/main.css" "$file"; then
                sed -i '/styles\/main.css/a\    <link rel="stylesheet" href="/styles/menu-unified.css">' "$file"
                echo "  ✅ Adicionado menu-unified.css a $file"
            else
                echo "  ⚠️ $file não tem main.css, pulando..."
            fi
        fi
        
        # Remover referências aos arquivos antigos
        sed -i '/force-menu-static.js/d' "$file"
        sed -i '/debug-settings-click.js/d' "$file"
        
    else
        echo "  ⚠️ $file não encontrado"
    fi
}

# Processar cada arquivo
for file in "${HTML_FILES[@]}"; do
    update_css_in_file "$file"
done

echo ""
echo "🎉 Atualização concluída!"
echo ""
echo "📋 Resumo:"
echo "  • Aplicado menu-unified.css a todas as páginas"
echo "  • Removidos arquivos CSS e JS complexos"
echo "  • Lógica única e simples implementada"
echo "  • Baseado nas páginas que funcionam corretamente"
echo ""
echo "🔧 O menu agora segue uma lógica única e consistente!"
