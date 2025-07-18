export function generateQuoteHTML(quote: any): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'DRAFT': 'Rascunho',
      'SENT': 'Enviado',
      'VIEWED': 'Visualizado',
      'APPROVED': 'Aprovado',
      'REJECTED': 'Rejeitado',
      'EXPIRED': 'Expirado',
      'CONVERTED': 'Convertido'
    };
    return labels[status] || status;
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'DRAFT': '#6c757d',
      'SENT': '#17a2b8',
      'VIEWED': '#28a745',
      'APPROVED': '#28a745',
      'REJECTED': '#dc3545',
      'EXPIRED': '#dc3545',
      'CONVERTED': '#667eea'
    };
    return colors[status] || '#6c757d';
  };

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Orçamento #${quote.number}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: 40px 20px;
        }
        
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 3px solid #667eea;
        }
        
        .company-info {
            flex: 1;
        }
        
        .company-logo {
            font-size: 2em;
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
        }
        
        .company-details {
            color: #666;
            font-size: 0.9em;
            line-height: 1.4;
        }
        
        .quote-info {
            text-align: right;
            flex: 1;
        }
        
        .quote-number {
            font-size: 1.8em;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .quote-status {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 20px;
            color: white;
            font-size: 0.8em;
            font-weight: bold;
            background: ${getStatusColor(quote.status)};
            margin-bottom: 15px;
        }
        
        .quote-dates {
            color: #666;
            font-size: 0.9em;
        }
        
        .section {
            margin-bottom: 30px;
        }
        
        .section-title {
            font-size: 1.3em;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
            padding-bottom: 8px;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .customer-vehicle-row {
            display: flex;
            gap: 40px;
            margin-bottom: 30px;
        }
        
        .customer-info, .vehicle-info {
            flex: 1;
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
        }
        
        .info-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 10px;
            font-size: 1.1em;
        }
        
        .info-item {
            margin-bottom: 5px;
            display: flex;
        }
        
        .info-label {
            font-weight: 500;
            min-width: 80px;
            color: #555;
        }
        
        .info-value {
            color: #333;
        }
        
        .quote-details {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }
        
        .quote-title {
            font-size: 1.4em;
            font-weight: bold;
            color: #333;
            margin-bottom: 15px;
        }
        
        .quote-description {
            color: #666;
            margin-bottom: 10px;
            line-height: 1.6;
        }
        
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            background: white;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .items-table th {
            background: #667eea;
            color: white;
            padding: 15px 12px;
            text-align: left;
            font-weight: 600;
        }
        
        .items-table td {
            padding: 12px;
            border-bottom: 1px solid #eee;
        }
        
        .items-table tr:last-child td {
            border-bottom: none;
        }
        
        .items-table tr:nth-child(even) {
            background: #f8f9fa;
        }
        
        .item-type {
            display: inline-block;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: bold;
            color: white;
        }
        
        .type-part { background: #28a745; }
        .type-service { background: #17a2b8; }
        .type-labor { background: #ffc107; color: #333; }
        .type-other { background: #6c757d; }
        
        .text-right {
            text-align: right;
        }
        
        .text-center {
            text-align: center;
        }
        
        .totals-section {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-top: 20px;
        }
        
        .totals-table {
            width: 100%;
            max-width: 300px;
            margin-left: auto;
        }
        
        .totals-table td {
            padding: 8px 0;
            border-bottom: 1px solid #ddd;
        }
        
        .totals-table .total-row {
            font-size: 1.2em;
            font-weight: bold;
            color: #667eea;
            border-top: 2px solid #667eea;
            padding-top: 12px;
        }
        
        .totals-table .total-row td {
            border-bottom: none;
        }
        
        .terms-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
        }
        
        .terms-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-top: 20px;
        }
        
        .terms-item {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 8px;
        }
        
        .terms-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
        }
        
        .terms-content {
            color: #666;
            font-size: 0.9em;
            line-height: 1.5;
        }
        
        .footer {
            margin-top: 50px;
            padding-top: 20px;
            border-top: 2px solid #f0f0f0;
            text-align: center;
            color: #666;
            font-size: 0.9em;
        }
        
        .footer-company {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 5px;
        }
        
        @media print {
            .container {
                padding: 20px 0;
            }
            
            .header {
                margin-bottom: 30px;
            }
            
            .section {
                margin-bottom: 25px;
            }
        }
        
        @media (max-width: 600px) {
            .customer-vehicle-row {
                flex-direction: column;
                gap: 20px;
            }
            
            .terms-grid {
                grid-template-columns: 1fr;
                gap: 20px;
            }
            
            .header {
                flex-direction: column;
                gap: 20px;
            }
            
            .quote-info {
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <div class="company-info">
                <div class="company-logo">🚗 Oficina Mecânica</div>
                <div class="company-details">
                    <strong>Oficina Mecânica Ltda.</strong><br>
                    Rua das Oficinas, 123 - Centro<br>
                    São Paulo - SP - CEP: 01234-567<br>
                    📞 (11) 3456-7890 | 📧 contato@oficina.com<br>
                    CNPJ: 12.345.678/0001-90
                </div>
            </div>
            
            <div class="quote-info">
                <div class="quote-number">Orçamento #${quote.number}</div>
                <div class="quote-status">${getStatusLabel(quote.status)}</div>
                <div class="quote-dates">
                    <strong>Criado em:</strong> ${formatDate(quote.createdAt)}<br>
                    <strong>Válido até:</strong> ${formatDate(quote.validUntil)}
                </div>
            </div>
        </div>
        
        <!-- Cliente e Veículo -->
        <div class="customer-vehicle-row">
            <div class="customer-info">
                <div class="info-title">👤 Cliente</div>
                <div class="info-item">
                    <span class="info-label">Nome:</span>
                    <span class="info-value">${quote.customer.name}</span>
                </div>
                ${quote.customer.email ? `
                <div class="info-item">
                    <span class="info-label">Email:</span>
                    <span class="info-value">${quote.customer.email}</span>
                </div>
                ` : ''}
                ${quote.customer.phone ? `
                <div class="info-item">
                    <span class="info-label">Telefone:</span>
                    <span class="info-value">${quote.customer.phone}</span>
                </div>
                ` : ''}
                ${quote.customer.cpfCnpj ? `
                <div class="info-item">
                    <span class="info-label">${quote.customer.type === 'INDIVIDUAL' ? 'CPF' : 'CNPJ'}:</span>
                    <span class="info-value">${quote.customer.cpfCnpj}</span>
                </div>
                ` : ''}
            </div>
            
            ${quote.vehicle ? `
            <div class="vehicle-info">
                <div class="info-title">🚗 Veículo</div>
                <div class="info-item">
                    <span class="info-label">Modelo:</span>
                    <span class="info-value">${quote.vehicle.brand} ${quote.vehicle.model}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Ano:</span>
                    <span class="info-value">${quote.vehicle.year}/${quote.vehicle.modelYear || quote.vehicle.year}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Placa:</span>
                    <span class="info-value">${quote.vehicle.plate}</span>
                </div>
                ${quote.vehicle.color ? `
                <div class="info-item">
                    <span class="info-label">Cor:</span>
                    <span class="info-value">${quote.vehicle.color}</span>
                </div>
                ` : ''}
            </div>
            ` : ''}
        </div>
        
        <!-- Detalhes do Orçamento -->
        <div class="quote-details">
            <div class="quote-title">${quote.title}</div>
            ${quote.description ? `<div class="quote-description">${quote.description}</div>` : ''}
            ${quote.customerRequest ? `
            <div style="margin-top: 15px;">
                <strong>Solicitação do Cliente:</strong><br>
                <span style="color: #666;">${quote.customerRequest}</span>
            </div>
            ` : ''}
        </div>
        
        <!-- Itens do Orçamento -->
        <div class="section">
            <div class="section-title">📦 Itens do Orçamento</div>
            
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Tipo</th>
                        <th>Descrição</th>
                        <th class="text-center">Qtd</th>
                        <th class="text-right">Valor Unit.</th>
                        <th class="text-right">Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${quote.items.map((item: any) => `
                    <tr>
                        <td>
                            <span class="item-type type-${item.type.toLowerCase()}">
                                ${item.type === 'PART' ? 'Peça' : 
                                  item.type === 'SERVICE' ? 'Serviço' : 
                                  item.type === 'LABOR' ? 'M.O.' : 'Outros'}
                            </span>
                        </td>
                        <td>
                            <strong>${item.description}</strong>
                            ${item.notes ? `<br><small style="color: #666;">${item.notes}</small>` : ''}
                        </td>
                        <td class="text-center">${item.quantity}</td>
                        <td class="text-right">${formatCurrency(item.unitPrice)}</td>
                        <td class="text-right"><strong>${formatCurrency(item.totalPrice)}</strong></td>
                    </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Totais -->
            <div class="totals-section">
                <table class="totals-table">
                    <tr>
                        <td>Subtotal:</td>
                        <td class="text-right">${formatCurrency(quote.subtotal)}</td>
                    </tr>
                    ${quote.discount > 0 ? `
                    <tr>
                        <td>Desconto:</td>
                        <td class="text-right">- ${formatCurrency(quote.discount)}</td>
                    </tr>
                    ` : ''}
                    ${quote.taxes > 0 ? `
                    <tr>
                        <td>Impostos:</td>
                        <td class="text-right">+ ${formatCurrency(quote.taxes)}</td>
                    </tr>
                    ` : ''}
                    <tr class="total-row">
                        <td><strong>TOTAL:</strong></td>
                        <td class="text-right"><strong>${formatCurrency(quote.total)}</strong></td>
                    </tr>
                </table>
            </div>
        </div>
        
        <!-- Termos e Condições -->
        ${(quote.terms || quote.paymentTerms || quote.deliveryTerms || quote.notes) ? `
        <div class="terms-section">
            <div class="section-title">📄 Termos e Condições</div>
            
            <div class="terms-grid">
                ${quote.paymentTerms ? `
                <div class="terms-item">
                    <div class="terms-title">💳 Condições de Pagamento</div>
                    <div class="terms-content">${quote.paymentTerms}</div>
                </div>
                ` : ''}
                
                ${quote.deliveryTerms ? `
                <div class="terms-item">
                    <div class="terms-title">⏰ Prazo de Entrega</div>
                    <div class="terms-content">${quote.deliveryTerms}</div>
                </div>
                ` : ''}
                
                ${quote.terms ? `
                <div class="terms-item">
                    <div class="terms-title">📋 Termos Gerais</div>
                    <div class="terms-content">${quote.terms}</div>
                </div>
                ` : ''}
                
                ${quote.notes ? `
                <div class="terms-item">
                    <div class="terms-title">📝 Observações</div>
                    <div class="terms-content">${quote.notes}</div>
                </div>
                ` : ''}
            </div>
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
            <div class="footer-company">🚗 Oficina Mecânica - Qualidade e Confiança</div>
            <div>Este orçamento foi gerado automaticamente em ${formatDate(new Date().toISOString())}</div>
            <div style="margin-top: 10px; font-size: 0.8em;">
                📞 (11) 3456-7890 | 📧 contato@oficina.com | 🌐 www.oficina.com
            </div>
        </div>
    </div>
</body>
</html>
  `;
}
