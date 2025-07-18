import { Request, Response } from 'express';
import nodemailer from 'nodemailer';
import prisma from '../config/database';
import { generateQuoteHTML } from '../templates/quoteTemplate';
import puppeteer from 'puppeteer';

// Configuração padrão do SMTP (pode ser alterada via API)
let emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER || '',
    pass: process.env.EMAIL_PASS || ''
  }
};

// Criar transporter do Nodemailer
function createTransporter() {
  return nodemailer.createTransport(emailConfig);
}

// Enviar email de fatura
export const sendInvoiceEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    const { recipientEmail, subject, message } = req.body;

    if (!invoiceId) {
      res.status(400).json({
        success: false,
        error: 'ID da fatura é obrigatório'
      });
      return;
    }

    // Buscar dados da fatura
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId },
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

    // Email do destinatário (parâmetro ou email do cliente)
    const toEmail = recipientEmail || invoice.customer.email;
    
    if (!toEmail) {
      res.status(400).json({
        success: false,
        error: 'Email do destinatário não informado'
      });
      return;
    }

    // Calcular valores
    const totalPaid = invoice.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
    const remainingAmount = Number(invoice.total) - totalPaid;

    // Gerar HTML do email
    const emailHtml = generateInvoiceEmailHTML(invoice, totalPaid, remainingAmount);

    // Configurar email
    const mailOptions = {
      from: `"Oficina Mecânica" <${emailConfig.auth.user}>`,
      to: toEmail,
      subject: subject || `Fatura #${invoice.number} - Oficina Mecânica`,
      html: emailHtml,
      attachments: [
        {
          filename: `fatura-${invoice.number}.pdf`,
          path: `/api/pdf/invoice/${invoice.id}`,
          contentType: 'application/pdf'
        }
      ]
    };

    // Enviar email
    const transporter = createTransporter();
    const info = await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Email enviado com sucesso',
      data: {
        messageId: info.messageId,
        recipient: toEmail,
        invoiceNumber: invoice.number
      }
    });

  } catch (error) {
    console.error('Erro ao enviar email da fatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Enviar alertas de vencimento
export const sendDueInvoiceAlerts = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Buscar faturas vencendo amanhã
    const dueTomorrowInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        customer: true
      }
    });

    // Buscar faturas vencidas
    const overdueInvoices = await prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today
        }
      },
      include: {
        customer: true
      }
    });

    const transporter = createTransporter();
    let emailsSent = 0;

    // Enviar alertas para faturas vencendo amanhã
    for (const invoice of dueTomorrowInvoices) {
      if (invoice.customer.email) {
        try {
          const emailHtml = generateDueAlertEmailHTML(invoice, 'vencendo');
          
          await transporter.sendMail({
            from: `"Oficina Mecânica" <${emailConfig.auth.user}>`,
            to: invoice.customer.email,
            subject: `⚠️ Fatura #${invoice.number} vence amanhã`,
            html: emailHtml
          });

          emailsSent++;
        } catch (error) {
          console.error(`Erro ao enviar email para ${invoice.customer.email}:`, error);
        }
      }
    }

    // Enviar alertas para faturas vencidas
    for (const invoice of overdueInvoices) {
      if (invoice.customer.email) {
        try {
          const emailHtml = generateDueAlertEmailHTML(invoice, 'vencida');
          
          await transporter.sendMail({
            from: `"Oficina Mecânica" <${emailConfig.auth.user}>`,
            to: invoice.customer.email,
            subject: `🚨 Fatura #${invoice.number} está vencida`,
            html: emailHtml
          });

          emailsSent++;
        } catch (error) {
          console.error(`Erro ao enviar email para ${invoice.customer.email}:`, error);
        }
      }
    }

    res.json({
      success: true,
      message: 'Alertas de vencimento enviados',
      data: {
        dueTomorrow: dueTomorrowInvoices.length,
        overdue: overdueInvoices.length,
        emailsSent
      }
    });

  } catch (error) {
    console.error('Erro ao enviar alertas de vencimento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Configurar SMTP
export const configureEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { host, port, secure, user, pass } = req.body;

    if (!host || !port || !user || !pass) {
      res.status(400).json({
        success: false,
        error: 'Todos os campos são obrigatórios'
      });
      return;
    }

    // Atualizar configuração
    emailConfig = {
      host,
      port: Number(port),
      secure: Boolean(secure),
      auth: {
        user,
        pass
      }
    };

    // Testar configuração
    const transporter = createTransporter();
    await transporter.verify();

    res.json({
      success: true,
      message: 'Configuração de email atualizada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao configurar email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao testar configuração de email'
    });
  }
};

// Testar configuração de email
export const testEmailConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    const { testEmail } = req.body;

    if (!testEmail) {
      res.status(400).json({
        success: false,
        error: 'Email de teste é obrigatório'
      });
      return;
    }

    const transporter = createTransporter();

    // Enviar email de teste
    const info = await transporter.sendMail({
      from: `"Oficina Mecânica" <${emailConfig.auth.user}>`,
      to: testEmail,
      subject: '✅ Teste de Configuração - Oficina Mecânica',
      html: generateTestEmailHTML()
    });

    res.json({
      success: true,
      message: 'Email de teste enviado com sucesso',
      data: {
        messageId: info.messageId,
        recipient: testEmail
      }
    });

  } catch (error) {
    console.error('Erro ao enviar email de teste:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao enviar email de teste'
    });
  }
};

// Obter configuração atual
export const getEmailConfig = async (req: Request, res: Response): Promise<void> => {
  try {
    res.json({
      success: true,
      data: {
        host: emailConfig.host,
        port: emailConfig.port,
        secure: emailConfig.secure,
        user: emailConfig.auth.user,
        // Não retornar a senha por segurança
        hasPassword: !!emailConfig.auth.pass
      }
    });
  } catch (error) {
    console.error('Erro ao obter configuração de email:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Template HTML para email de fatura
function generateInvoiceEmailHTML(invoice: any, totalPaid: number, remainingAmount: number): string {
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
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .company-tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .invoice-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .info-label { font-weight: bold; color: #666; }
        .info-value { color: #333; }
        .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
        .status-pending { background: #fff3cd; color: #856404; }
        .status-paid { background: #d4edda; color: #155724; }
        .status-overdue { background: #f8d7da; color: #721c24; }
        .total-section { background: #667eea; color: white; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .total-amount { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .total-label { font-size: 14px; opacity: 0.9; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-name">🚗 Oficina Mecânica</div>
          <div class="company-tagline">Sistema de Gestão Automotiva</div>
        </div>
        
        <div class="content">
          <h2>Fatura #${invoice.number}</h2>
          
          <div class="invoice-info">
            <div class="info-row">
              <span class="info-label">Cliente:</span>
              <span class="info-value">${invoice.customer.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data de Emissão:</span>
              <span class="info-value">${formatDate(invoice.issueDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data de Vencimento:</span>
              <span class="info-value">${formatDate(invoice.dueDate)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="status status-${invoice.status.toLowerCase()}">${getStatusLabel(invoice.status)}</span>
            </div>
            ${invoice.serviceOrder.vehicle ? `
            <div class="info-row">
              <span class="info-label">Veículo:</span>
              <span class="info-value">${invoice.serviceOrder.vehicle.brand} ${invoice.serviceOrder.vehicle.model} (${invoice.serviceOrder.vehicle.plate})</span>
            </div>
            ` : ''}
          </div>

          <div class="total-section">
            <div class="total-amount">${formatCurrency(invoice.total)}</div>
            <div class="total-label">Valor Total da Fatura</div>
            ${remainingAmount > 0 ? `
            <div style="margin-top: 15px; font-size: 14px;">
              <div>Valor Pago: ${formatCurrency(totalPaid)}</div>
              <div>Saldo Restante: ${formatCurrency(remainingAmount)}</div>
            </div>
            ` : ''}
          </div>

          ${invoice.notes ? `
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <strong>Observações:</strong><br>
            ${invoice.notes}
          </div>
          ` : ''}

          <div style="text-align: center; margin: 30px 0;">
            <p>Em anexo você encontra a fatura detalhada em PDF.</p>
            <p>Para dúvidas ou esclarecimentos, entre em contato conosco.</p>
          </div>
        </div>

        <div class="footer">
          <p><strong>Oficina Mecânica</strong> - Sistema de Gestão Automotiva</p>
          <p>Este é um email automático. Por favor, não responda.</p>
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template HTML para alertas de vencimento
function generateDueAlertEmailHTML(invoice: any, type: 'vencendo' | 'vencida'): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const isOverdue = type === 'vencida';
  const title = isOverdue ? '🚨 Fatura Vencida' : '⚠️ Fatura Vencendo';
  const message = isOverdue 
    ? `Sua fatura #${invoice.number} está vencida desde ${formatDate(invoice.dueDate)}.`
    : `Sua fatura #${invoice.number} vence amanhã (${formatDate(invoice.dueDate)}).`;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: ${isOverdue ? '#dc3545' : '#ffc107'}; color: ${isOverdue ? 'white' : '#333'}; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .alert-box { background: ${isOverdue ? '#f8d7da' : '#fff3cd'}; border: 1px solid ${isOverdue ? '#f5c6cb' : '#ffeaa7'}; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .amount { font-size: 24px; font-weight: bold; color: ${isOverdue ? '#721c24' : '#856404'}; text-align: center; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>${title}</h1>
        </div>
        
        <div class="content">
          <p>Olá, <strong>${invoice.customer.name}</strong>!</p>
          
          <div class="alert-box">
            <p><strong>${message}</strong></p>
            <div class="amount">${formatCurrency(invoice.total)}</div>
            <p>Fatura: #${invoice.number}</p>
            <p>Vencimento: ${formatDate(invoice.dueDate)}</p>
          </div>

          <p>Por favor, regularize sua situação o quanto antes para evitar ${isOverdue ? 'juros e multas' : 'o vencimento'}.</p>
          
          <p>Para dúvidas ou negociação, entre em contato conosco.</p>
        </div>

        <div class="footer">
          <p><strong>Oficina Mecânica</strong> - Sistema de Gestão Automotiva</p>
          <p>Este é um email automático. Por favor, não responda.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Template HTML para email de teste
function generateTestEmailHTML(): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Teste de Email</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; text-align: center; }
        .success-icon { font-size: 48px; margin-bottom: 20px; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚗 Oficina Mecânica</h1>
          <p>Sistema de Gestão Automotiva</p>
        </div>
        
        <div class="content">
          <div class="success-icon">✅</div>
          <h2>Configuração de Email Funcionando!</h2>
          <p>Este é um email de teste para verificar se a configuração SMTP está funcionando corretamente.</p>
          <p>Se você recebeu este email, significa que o sistema está pronto para enviar:</p>
          <ul style="text-align: left; display: inline-block;">
            <li>Faturas por email</li>
            <li>Alertas de vencimento</li>
            <li>Notificações automáticas</li>
            <li>Comunicações com clientes</li>
          </ul>
        </div>

        <div class="footer">
          <p><strong>Oficina Mecânica</strong> - Sistema de Gestão Automotiva</p>
          <p>Email de teste enviado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// Enviar orçamento por email
export const sendQuoteEmail = async (req: Request, res: Response): Promise<void> => {
  try {
    const { quoteId } = req.params;
    const { recipientEmail, subject, message } = req.body;

    if (!quoteId) {
      res.status(400).json({
        success: false,
        error: 'ID do orçamento é obrigatório'
      });
      return;
    }

    // Buscar dados do orçamento
    const quote = await prisma.quote.findUnique({
      where: { id: quoteId },
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

    // Email do destinatário (parâmetro ou email do cliente)
    const toEmail = recipientEmail || quote.customer.email;

    if (!toEmail) {
      res.status(400).json({
        success: false,
        error: 'Email do destinatário não informado'
      });
      return;
    }

    // Gerar PDF do orçamento
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const html = generateQuoteHTML(quote);
    await page.setContent(html, { waitUntil: 'networkidle0' });

    const pdfBuffer = await page.pdf({
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

    // Gerar HTML do email
    const emailHtml = generateQuoteEmailHTML(quote, message);

    // Configurar email
    const mailOptions = {
      from: `"Oficina Mecânica" <${emailConfig.auth.user}>`,
      to: toEmail,
      subject: subject || `Orçamento #${quote.number} - Oficina Mecânica`,
      html: emailHtml,
      attachments: [
        {
          filename: `orcamento-${quote.number}.pdf`,
          content: Buffer.from(pdfBuffer),
          contentType: 'application/pdf'
        }
      ]
    };

    // Enviar email
    const transporter = createTransporter();
    const info: any = await transporter.sendMail(mailOptions);

    // Atualizar status do orçamento para SENT se ainda estiver DRAFT
    if (quote.status === 'DRAFT') {
      await prisma.quote.update({
        where: { id: quoteId },
        data: { status: 'SENT' }
      });
    }

    res.json({
      success: true,
      message: 'Email enviado com sucesso',
      data: {
        messageId: info.messageId,
        recipient: toEmail,
        quoteNumber: quote.number
      }
    });

  } catch (error) {
    console.error('Erro ao enviar email do orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Template HTML para email de orçamento
function generateQuoteEmailHTML(quote: any, additionalMessage?: string): string {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value || 0);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
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

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Orçamento #${quote.number}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #333; background: #f8f9fa; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .company-name { font-size: 24px; font-weight: bold; margin-bottom: 5px; }
        .company-tagline { font-size: 14px; opacity: 0.9; }
        .content { padding: 30px; }
        .quote-info { background: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
        .info-label { font-weight: bold; color: #666; }
        .info-value { color: #333; }
        .status { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; background: #667eea; color: white; }
        .total-section { background: #667eea; color: white; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
        .total-amount { font-size: 32px; font-weight: bold; margin-bottom: 5px; }
        .total-label { font-size: 14px; opacity: 0.9; }
        .validity-warning { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0; color: #856404; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .btn { display: inline-block; background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 10px 5px; }
        .btn-secondary { background: #dc3545; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="company-name">🚗 Oficina Mecânica</div>
          <div class="company-tagline">Sistema de Gestão Automotiva</div>
        </div>

        <div class="content">
          <h2>Orçamento #${quote.number}</h2>

          <div class="quote-info">
            <div class="info-row">
              <span class="info-label">Cliente:</span>
              <span class="info-value">${quote.customer.name}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Título:</span>
              <span class="info-value">${quote.title}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Data de Criação:</span>
              <span class="info-value">${formatDate(quote.createdAt)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Válido até:</span>
              <span class="info-value">${formatDate(quote.validUntil)}</span>
            </div>
            <div class="info-row">
              <span class="info-label">Status:</span>
              <span class="status">${getStatusLabel(quote.status)}</span>
            </div>
            ${quote.vehicle ? `
            <div class="info-row">
              <span class="info-label">Veículo:</span>
              <span class="info-value">${quote.vehicle.brand} ${quote.vehicle.model} (${quote.vehicle.plate})</span>
            </div>
            ` : ''}
          </div>

          ${quote.description ? `
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <strong>Descrição:</strong><br>
            ${quote.description}
          </div>
          ` : ''}

          ${additionalMessage ? `
          <div style="background: #e7f3ff; border-radius: 8px; padding: 15px; margin: 20px 0; border-left: 4px solid #667eea;">
            <strong>Mensagem:</strong><br>
            ${additionalMessage}
          </div>
          ` : ''}

          <div class="total-section">
            <div class="total-amount">${formatCurrency(quote.total)}</div>
            <div class="total-label">Valor Total do Orçamento</div>
            ${quote.items.length > 0 ? `
            <div style="margin-top: 15px; font-size: 14px;">
              <div>${quote.items.length} ${quote.items.length === 1 ? 'item' : 'itens'} incluído${quote.items.length === 1 ? '' : 's'}</div>
            </div>
            ` : ''}
          </div>

          <div class="validity-warning">
            <strong>⏰ Atenção:</strong> Este orçamento é válido até <strong>${formatDate(quote.validUntil)}</strong>.
            Após esta data, os valores e condições podem ser alterados.
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <p>Em anexo você encontra o orçamento detalhado em PDF.</p>
            <p>Para aprovar este orçamento ou esclarecer dúvidas, entre em contato conosco.</p>

            <div style="margin: 20px 0;">
              <a href="#" class="btn">✅ Aprovar Orçamento</a>
              <a href="#" class="btn btn-secondary">❌ Recusar Orçamento</a>
            </div>
          </div>

          ${quote.terms || quote.paymentTerms || quote.deliveryTerms ? `
          <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin: 20px 0;">
            <strong>Termos e Condições:</strong><br>
            ${quote.paymentTerms ? `<div><strong>Pagamento:</strong> ${quote.paymentTerms}</div>` : ''}
            ${quote.deliveryTerms ? `<div><strong>Prazo:</strong> ${quote.deliveryTerms}</div>` : ''}
            ${quote.terms ? `<div><strong>Observações:</strong> ${quote.terms}</div>` : ''}
          </div>
          ` : ''}
        </div>

        <div class="footer">
          <p><strong>Oficina Mecânica</strong> - Sistema de Gestão Automotiva</p>
          <p>📞 (11) 3456-7890 | 📧 contato@oficina.com</p>
          <p>Este é um email automático. Para responder, use nossos canais de contato.</p>
          <p>Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

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
