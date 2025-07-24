#!/bin/bash

# Script para verificar consistência do menu em todas as páginas HTML

echo "🔍 Verificando consistência do menu em todas as páginas..."
echo "============================================================"

# Lista de páginas HTML para verificar
pages=(
    "dashboard.html"
    "customers.html"
    "customer-form.html"
    "service-orders.html"
    "service-order-form.html"
    "service-order-view.html"
    "parts.html"
    "part-form.html"
    "part-view.html"
    "financial.html"
    "reports.html"
    "report-consumption.html"
    "report-low-stock.html"
    "report-movement.html"
    "settings.html"
    "quotes.html"
    "quote-form.html"
    "invoices.html"
    "notifications.html"
)

# Itens obrigatórios do menu
required_items=(
    "Dashboard"
    "Clientes"
    "Ordens de Serviço"
    "Peças"
    "Financeiro"
    "Relatórios"
    "Configurações"
)

missing_items=0
total_pages=0

for page in "${pages[@]}"; do
    if [ -f "$page" ]; then
        echo "📄 Verificando: $page"
        total_pages=$((total_pages + 1))
        
        page_missing=0
        
        for item in "${required_items[@]}"; do
            if ! grep -q "$item" "$page"; then
                echo "  ❌ Faltando: $item"
                missing_items=$((missing_items + 1))
                page_missing=1
            fi
        done
        
        if [ $page_missing -eq 0 ]; then
            echo "  ✅ Menu completo"
        fi
        
        echo ""
    else
        echo "⚠️  Arquivo não encontrado: $page"
        echo ""
    fi
done

echo "============================================================"
echo "📊 Resumo da verificação:"
echo "  📄 Páginas verificadas: $total_pages"
echo "  ❌ Itens faltando: $missing_items"

if [ $missing_items -eq 0 ]; then
    echo "  ✅ Todos os menus estão consistentes!"
    exit 0
else
    echo "  ⚠️  Alguns menus precisam de correção"
    exit 1
fi
