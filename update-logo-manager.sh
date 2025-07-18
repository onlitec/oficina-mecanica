#!/bin/bash

# Script para adicionar logo-manager.js a todas as páginas HTML

echo "=== ATUALIZANDO PÁGINAS COM LOGO MANAGER ==="
echo ""

# Lista de páginas HTML principais (excluindo test e backup)
pages=(
    "analytics.html"
    "financial.html"
    "parts.html"
    "quotes.html"
    "service-orders.html"
    "reports.html"
    "notifications.html"
    "customer-form.html"
    "service-order-form.html"
    "part-form.html"
    "quote-form.html"
    "customer-view.html"
    "service-order-view.html"
    "part-view.html"
    "invoices.html"
    "email-config.html"
    "report-consumption.html"
    "report-movement.html"
    "report-low-stock.html"
)

updated_count=0
skipped_count=0

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "🔄 Processando: $page"
        
        # Verificar se já tem logo-manager.js
        if grep -q "logo-manager.js" "$page"; then
            echo "   ⏭️ Já possui logo-manager.js - pulando"
            ((skipped_count++))
        else
            # Verificar se tem global-menu.js
            if grep -q "global-menu.js" "$page"; then
                # Adicionar logo-manager.js antes do global-menu.js
                sed -i 's|<script src="/js/global-menu.js"></script>|<script src="/js/logo-manager.js"></script>\n    <script src="/js/global-menu.js"></script>|g' "$page"
                echo "   ✅ Logo-manager.js adicionado"
                ((updated_count++))
            else
                echo "   ⚠️ Não possui global-menu.js - pulando"
                ((skipped_count++))
            fi
        fi
    else
        echo "❌ Arquivo não encontrado: $page"
        ((skipped_count++))
    fi
done

echo ""
echo "=== RESUMO ==="
echo "✅ Páginas atualizadas: $updated_count"
echo "⏭️ Páginas puladas: $skipped_count"
echo ""

if [ $updated_count -gt 0 ]; then
    echo "🎉 Atualização concluída com sucesso!"
    echo ""
    echo "📋 Páginas atualizadas:"
    for page in "${pages[@]}"; do
        if [ -f "$page" ] && grep -q "logo-manager.js" "$page"; then
            echo "   ✅ $page"
        fi
    done
else
    echo "ℹ️ Nenhuma página precisou ser atualizada"
fi

echo ""
echo "🌐 Agora todas as páginas usarão o logo da configuração!"
echo "   Para testar: http://toledooficina.local/settings.html → Aba Aparência"
