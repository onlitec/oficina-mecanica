import { Request, Response } from 'express';
import puppeteer from 'puppeteer';
import prisma from '../config/database';
import { generateQuoteHTML } from '../templates/quoteTemplate';

// Gerar PDF da fatura
export const generateInvoicePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da fatura é obrigatório'
      });
      return;
    }

    // Buscar dados da fatura
    const invoice = await prisma.invoice.findFirst({
      where: { id },
      include: {
        customer: true,
        serviceOrder: {
          include: {
            vehicle: true,
            parts: {
              include: { part: true }
            },
            services: {
              include: { service: true }
            }
          }
        },
        payments: {
          orderBy: { paidAt: 'desc' }
        }
      }
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        error: 'Fatura não encontrada'
      });
      return;
    }

    // Calcular valores
    const totalPaid = invoice.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
    const remainingAmount = Number(invoice.total) - totalPaid;

    // Gerar HTML da fatura
    const html = generateInvoiceHTML(invoice, totalPaid, remainingAmount);

    // Gerar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Enviar PDF como resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="fatura-${invoice.number}.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('Erro ao gerar PDF da fatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Gerar PDF do relatório de peças
export const generatePartsReportPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    // Buscar dados das peças
    const parts = await prisma.part.findMany({
      where: { status: 'ACTIVE' },
      orderBy: { name: 'asc' }
    });

    // Calcular estatísticas
    const totalParts = parts.length;
    const totalValue = parts.reduce((sum, part) => sum + (Number(part.salePrice) * part.stock), 0);
    const lowStockParts = parts.filter(part => part.stock <= part.minStock).length;
    const outOfStockParts = parts.filter(part => part.stock === 0).length;

    const reportData = {
      summary: {
        totalParts,
        totalValue,
        lowStockParts,
        outOfStockParts
      },
      parts
    };

    // Gerar HTML do relatório
    const html = generatePartsReportHTML(reportData);

    // Gerar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Enviar PDF como resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-pecas.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('Erro ao gerar PDF do relatório de peças:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Gerar PDF do relatório de consumo
export const generateConsumptionReportPDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;

    // Buscar dados do relatório
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate as string);
    if (endDate) params.append('endDate', endDate as string);
    if (limit) params.append('limit', limit as string);

    // Simular chamada para API de relatório (em produção, reutilizar lógica do controller)
    const reportData = await getConsumptionReportData(
      startDate as string,
      endDate as string,
      Number(limit)
    );

    // Gerar HTML do relatório
    const html = generateConsumptionReportHTML(reportData);

    // Gerar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Enviar PDF como resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="relatorio-consumo.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('Erro ao gerar PDF do relatório:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Função auxiliar para buscar dados do relatório de consumo
async function getConsumptionReportData(startDate: string, endDate: string, limit: number) {
  const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const end = endDate ? new Date(endDate) : new Date();

  // Buscar movimentações de peças no período
  const movements = await prisma.serviceOrderPart.findMany({
    where: {
      serviceOrder: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    },
    include: {
      part: true,
      serviceOrder: {
        include: {
          customer: true,
          vehicle: true
        }
      }
    },
    orderBy: {
      serviceOrder: {
        createdAt: 'desc'
      }
    }
  });

  // Agrupar por peça
  const partConsumption: any = {};
  
  movements.forEach(movement => {
    const partId = movement.partId;
    
    if (!partConsumption[partId]) {
      partConsumption[partId] = {
        part: movement.part,
        totalQuantity: 0,
        totalValue: 0,
        timesUsed: 0,
        movements: []
      };
    }
    
    partConsumption[partId].totalQuantity += movement.quantity;
    partConsumption[partId].totalValue += Number(movement.totalPrice);
    partConsumption[partId].timesUsed += 1;
    partConsumption[partId].movements.push(movement);
  });

  // Converter para array e ordenar
  const parts = Object.values(partConsumption)
    .sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
    .slice(0, limit);

  // Calcular totais
  const summary = {
    totalQuantityConsumed: parts.reduce((sum: number, item: any) => sum + item.totalQuantity, 0),
    totalValueConsumed: parts.reduce((sum: number, item: any) => sum + item.totalValue, 0),
    totalPartsTypes: parts.length,
    averageValuePerPart: parts.length > 0 ? parts.reduce((sum: number, item: any) => sum + item.totalValue, 0) / parts.length : 0
  };

  return {
    period: { startDate: start, endDate: end },
    summary,
    parts
  };
}

// Template HTML para fatura
function generateInvoiceHTML(invoice: any, totalPaid: number, remainingAmount: number): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Fatura #${invoice.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .company-info { font-size: 14px; color: #666; }
        .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .invoice-details, .customer-details { width: 48%; }
        .section-title { font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #667eea; }
        .info-line { margin-bottom: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background: #f8f9fa; font-weight: bold; }
        .totals { margin-top: 20px; }
        .total-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
        .total-line.final { font-weight: bold; font-size: 18px; border-top: 2px solid #667eea; padding-top: 10px; }
        .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        .status-paid { background: #d4edda; color: #155724; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-overdue { background: #f8d7da; color: #721c24; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🚗 Oficina Mecânica</div>
        <div class="company-info">Sistema de Gestão Automotiva</div>
      </div>

      <div class="invoice-info">
        <div class="invoice-details">
          <div class="section-title">Dados da Fatura</div>
          <div class="info-line"><strong>Número:</strong> #${invoice.number}</div>
          <div class="info-line"><strong>Data de Emissão:</strong> ${formatDate(invoice.issueDate)}</div>
          <div class="info-line"><strong>Data de Vencimento:</strong> ${formatDate(invoice.dueDate)}</div>
          <div class="info-line"><strong>Status:</strong> 
            <span class="status status-${invoice.status.toLowerCase()}">${getStatusLabel(invoice.status)}</span>
          </div>
        </div>

        <div class="customer-details">
          <div class="section-title">Cliente</div>
          <div class="info-line"><strong>Nome:</strong> ${invoice.customer.name}</div>
          <div class="info-line"><strong>Email:</strong> ${invoice.customer.email || 'N/A'}</div>
          <div class="info-line"><strong>Telefone:</strong> ${invoice.customer.phone || 'N/A'}</div>
          <div class="info-line"><strong>Veículo:</strong> ${invoice.serviceOrder.vehicle.brand} ${invoice.serviceOrder.vehicle.model} (${invoice.serviceOrder.vehicle.plate})</div>
        </div>
      </div>

      <div class="section-title">Peças e Serviços</div>
      <table class="table">
        <thead>
          <tr>
            <th>Descrição</th>
            <th>Quantidade</th>
            <th>Valor Unitário</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          ${invoice.serviceOrder.parts.map((item: any) => `
            <tr>
              <td>${item.part.name}</td>
              <td>${item.quantity} ${item.part.unit || 'UN'}</td>
              <td>${formatCurrency(item.unitPrice)}</td>
              <td>${formatCurrency(item.totalPrice)}</td>
            </tr>
          `).join('')}
          ${invoice.serviceOrder.services.map((item: any) => `
            <tr>
              <td>${item.service.name}</td>
              <td>1</td>
              <td>${formatCurrency(item.price)}</td>
              <td>${formatCurrency(item.price)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="totals">
        <div class="total-line">
          <span>Subtotal:</span>
          <span>${formatCurrency(invoice.subtotal)}</span>
        </div>
        ${Number(invoice.discount) > 0 ? `
        <div class="total-line">
          <span>Desconto:</span>
          <span>-${formatCurrency(invoice.discount)}</span>
        </div>
        ` : ''}
        ${Number(invoice.taxes) > 0 ? `
        <div class="total-line">
          <span>Impostos:</span>
          <span>${formatCurrency(invoice.taxes)}</span>
        </div>
        ` : ''}
        <div class="total-line final">
          <span>Total:</span>
          <span>${formatCurrency(invoice.total)}</span>
        </div>
        ${totalPaid > 0 ? `
        <div class="total-line">
          <span>Valor Pago:</span>
          <span>${formatCurrency(totalPaid)}</span>
        </div>
        <div class="total-line">
          <span>Saldo Restante:</span>
          <span>${formatCurrency(remainingAmount)}</span>
        </div>
        ` : ''}
      </div>

      ${invoice.notes ? `
      <div style="margin-top: 30px;">
        <div class="section-title">Observações</div>
        <p>${invoice.notes}</p>
      </div>
      ` : ''}

      <div class="footer">
        <p>Fatura gerada automaticamente pelo Sistema de Gestão de Oficina Mecânica</p>
        <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </body>
    </html>
  `;
}

// Template HTML para relatório de consumo
function generateConsumptionReportHTML(data: any): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Consumo de Peças</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .report-title { font-size: 18px; color: #666; margin-bottom: 10px; }
        .period { font-size: 14px; color: #666; }
        .summary { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
        .table th { background: #f8f9fa; font-weight: bold; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🚗 Oficina Mecânica</div>
        <div class="report-title">📈 Relatório de Consumo de Peças</div>
        <div class="period">Período: ${formatDate(data.period.startDate)} até ${formatDate(data.period.endDate)}</div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${data.summary.totalQuantityConsumed}</div>
          <div class="summary-label">Quantidade Total</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(data.summary.totalValueConsumed)}</div>
          <div class="summary-label">Valor Total</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.summary.totalPartsTypes}</div>
          <div class="summary-label">Tipos de Peças</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(data.summary.averageValuePerPart)}</div>
          <div class="summary-label">Valor Médio</div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Peça</th>
            <th>Código</th>
            <th>Qtd. Total</th>
            <th>Valor Total</th>
            <th>Vezes Usada</th>
            <th>Média por Uso</th>
          </tr>
        </thead>
        <tbody>
          ${data.parts.map((item: any, index: number) => `
            <tr>
              <td><strong>${item.part.name}</strong><br><small>${item.part.brand || 'N/A'}</small></td>
              <td>${item.part.internalCode || 'N/A'}</td>
              <td>${item.totalQuantity} ${item.part.unit || 'UN'}</td>
              <td><strong>${formatCurrency(item.totalValue)}</strong></td>
              <td>${item.timesUsed}</td>
              <td>${(item.totalQuantity / item.timesUsed).toFixed(2)} ${item.part.unit || 'UN'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema de Gestão de Oficina Mecânica</p>
        <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </body>
    </html>
  `;
}

// Template HTML para relatório de peças
function generatePartsReportHTML(data: any): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Relatório de Peças</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #667eea; padding-bottom: 20px; }
        .company-name { font-size: 24px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
        .report-title { font-size: 18px; color: #666; margin-bottom: 10px; }
        .summary { display: flex; justify-content: space-around; margin-bottom: 30px; background: #f8f9fa; padding: 20px; border-radius: 8px; }
        .summary-item { text-align: center; }
        .summary-value { font-size: 24px; font-weight: bold; color: #667eea; }
        .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
        .table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        .table th, .table td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; font-size: 12px; }
        .table th { background: #f8f9fa; font-weight: bold; }
        .status { padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
        .status-ok { background: #d4edda; color: #155724; }
        .status-low { background: #fff3cd; color: #856404; }
        .status-out { background: #f8d7da; color: #721c24; }
        .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="company-name">🚗 Oficina Mecânica</div>
        <div class="report-title">📦 Relatório de Peças em Estoque</div>
        <div class="period">Data: ${new Date().toLocaleDateString('pt-BR')}</div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-value">${data.summary.totalParts}</div>
          <div class="summary-label">Total de Peças</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${formatCurrency(data.summary.totalValue)}</div>
          <div class="summary-label">Valor Total</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.summary.lowStockParts}</div>
          <div class="summary-label">Estoque Baixo</div>
        </div>
        <div class="summary-item">
          <div class="summary-value">${data.summary.outOfStockParts}</div>
          <div class="summary-label">Sem Estoque</div>
        </div>
      </div>

      <table class="table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Marca</th>
            <th>Categoria</th>
            <th>Estoque</th>
            <th>Mín.</th>
            <th>Status</th>
            <th>Preço Custo</th>
            <th>Preço Venda</th>
            <th>Valor Total</th>
          </tr>
        </thead>
        <tbody>
          ${data.parts.map((part: any) => {
            const stockStatus = part.stock === 0 ? 'out' : (part.stock <= part.minStock ? 'low' : 'ok');
            const stockLabel = part.stock === 0 ? 'Sem Estoque' : (part.stock <= part.minStock ? 'Baixo' : 'OK');
            const totalValue = Number(part.salePrice) * part.stock;

            return `
            <tr>
              <td>${part.internalCode || 'N/A'}</td>
              <td><strong>${part.name}</strong></td>
              <td>${part.brand || 'N/A'}</td>
              <td>${part.category || 'N/A'}</td>
              <td>${part.stock} ${part.unit || 'UN'}</td>
              <td>${part.minStock}</td>
              <td><span class="status status-${stockStatus}">${stockLabel}</span></td>
              <td>${formatCurrency(part.costPrice)}</td>
              <td><strong>${formatCurrency(part.salePrice)}</strong></td>
              <td><strong>${formatCurrency(totalValue)}</strong></td>
            </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <div class="footer">
        <p>Relatório gerado automaticamente pelo Sistema de Gestão de Oficina Mecânica</p>
        <p>Data de geração: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
      </div>
    </body>
    </html>
  `;
}

// Gerar PDF do orçamento
export const generateQuotePDF = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID do orçamento é obrigatório'
      });
      return;
    }

    // Buscar dados do orçamento
    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        items: {
          include: {
            part: true,
            service: true
          }
        },
        creator: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!quote) {
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    // Gerar HTML do orçamento
    const html = generateQuoteHTML(quote);

    // Gerar PDF
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '20mm',
        left: '15mm'
      }
    });

    await browser.close();

    // Enviar PDF como resposta
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="orcamento-${quote.number}.pdf"`);
    res.send(pdf);

  } catch (error) {
    console.error('Erro ao gerar PDF do orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Função auxiliar para obter label do status
function getStatusLabel(status: string): string {
  const labels: { [key: string]: string } = {
    'PENDING': 'Pendente',
    'PAID': 'Pago',
    'OVERDUE': 'Vencido',
    'CANCELLED': 'Cancelado'
  };
  return labels[status] || status;
}
