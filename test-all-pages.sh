#!/bin/bash

echo "🧪 Testando todas as páginas com layout moderno..."

# Lista de todas as páginas
pages=(
    "dashboard.html"
    "customers.html"
    "parts.html"
    "service-orders.html"
    "financial.html"
    "reports.html"
    "settings.html"
    "analytics.html"
    "customer-form.html"
    "part-form.html"
    "service-order-form.html"
    "quote-form.html"
    "part-view.html"
    "service-order-view.html"
    "report-consumption.html"
    "report-low-stock.html"
    "report-movement.html"
    "email-config.html"
    "invoices.html"
    "notifications.html"
    "quotes.html"
)

# Contadores
total=0
success=0
failed=0

echo "📊 Testando ${#pages[@]} páginas..."
echo ""

# Testar cada página
for page in "${pages[@]}"; do
    total=$((total + 1))
    
    if [[ -f "$page" ]]; then
        # Testar se a página carrega (HTTP 200)
        status=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000/$page")
        
        if [[ "$status" == "200" ]]; then
            echo "✅ $page - OK ($status)"
            success=$((success + 1))
        else
            echo "❌ $page - ERRO ($status)"
            failed=$((failed + 1))
        fi
    else
        echo "⚠️ $page - ARQUIVO NÃO ENCONTRADO"
        failed=$((failed + 1))
    fi
done

echo ""
echo "📈 Resultados do Teste:"
echo "  Total de páginas: $total"
echo "  Sucessos: $success"
echo "  Falhas: $failed"
echo "  Taxa de sucesso: $(( (success * 100) / total ))%"

if [[ $failed -eq 0 ]]; then
    echo ""
    echo "🎉 Todos os testes passaram! Layout moderno aplicado com sucesso!"
else
    echo ""
    echo "⚠️ Algumas páginas apresentaram problemas. Verifique os logs acima."
fi

echo ""
echo "🔍 Verificando estrutura do layout moderno..."

# Verificar se as páginas têm a estrutura moderna
modern_count=0
for page in "${pages[@]}"; do
    if [[ -f "$page" ]]; then
        if grep -q "dashboard-layout" "$page" && grep -q "header class=\"header\"" "$page"; then
            modern_count=$((modern_count + 1))
        fi
    fi
done

echo "📱 Páginas com layout moderno: $modern_count/${#pages[@]}"
echo "📊 Percentual modernizado: $(( (modern_count * 100) / ${#pages[@]} ))%"
