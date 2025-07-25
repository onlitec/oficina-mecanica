#!/bin/bash

# Script para adicionar logo-immutable.js a todas as páginas

echo "🔒 Adicionando sistema de logo imutável a todas as páginas..."

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

# Função para adicionar JS em um arquivo
add_logo_immutable_to_file() {
    local file="$1"
    
    if [ -f "$file" ]; then
        echo "📝 Processando $file..."
        
        # Verificar se já tem o JS
        if grep -q "logo-immutable.js" "$file"; then
            echo "  ✅ $file já tem logo-immutable.js"
        else
            # Adicionar antes de global-settings.js se existir
            if grep -q "global-settings.js" "$file"; then
                sed -i '/global-settings.js/i\    <script src="js/logo-immutable.js"></script>' "$file"
                echo "  ✅ Adicionado logo-immutable.js antes de global-settings.js em $file"
            elif grep -q "</body>" "$file"; then
                # Adicionar antes de </body> se não tiver global-settings.js
                sed -i 's|</body>|    <script src="js/logo-immutable.js"></script>\n</body>|g' "$file"
                echo "  ✅ Adicionado logo-immutable.js antes de </body> em $file"
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
    add_logo_immutable_to_file "$file"
done

echo ""
echo "🎉 Sistema de logo imutável aplicado!"
echo ""
echo "📋 Resumo:"
echo "  • Adicionado logo-immutable.js a todas as páginas"
echo "  • Sistema de monitoramento contínuo ativado"
echo "  • Observers para detectar mudanças no DOM"
echo "  • Interceptação de mudanças de estilo"
echo "  • Força absoluta para manter logo em 32x32px"
echo ""
echo "🔒 O logo agora deve ser completamente imutável!"
