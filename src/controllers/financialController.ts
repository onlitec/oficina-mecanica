import { Request, Response } from 'express';
import prisma from '../config/database';

// Gerar fatura a partir de uma ordem de serviço
export const generateInvoice = async (req: Request, res: Response): Promise<void> => {
  try {
    const { serviceOrderId } = req.params;
    const { dueDate, notes, taxes = 0 } = req.body;

    if (!serviceOrderId) {
      res.status(400).json({
        success: false,
        error: 'ID da ordem de serviço é obrigatório'
      });
      return;
    }

    // Verificar se a OS existe
    const serviceOrder = await prisma.serviceOrder.findFirst({
      where: { id: serviceOrderId },
      include: {
        customer: true,
        parts: {
          include: { part: true }
        },
        services: {
          include: { service: true }
        }
      }
    });

    if (!serviceOrder) {
      res.status(404).json({
        success: false,
        error: 'Ordem de serviço não encontrada'
      });
      return;
    }

    // Verificar se já existe fatura para esta OS
    const existingInvoice = await prisma.invoice.findFirst({
      where: { serviceOrderId: serviceOrderId }
    });

    if (existingInvoice) {
      res.status(400).json({
        success: false,
        error: 'Esta ordem de serviço já possui uma fatura'
      });
      return;
    }

    // Gerar número da fatura
    const lastInvoice = await prisma.invoice.findFirst({
      orderBy: { number: 'desc' }
    });

    const nextNumber = lastInvoice 
      ? String(parseInt(lastInvoice.number) + 1).padStart(6, '0')
      : '000001';

    // Calcular valores
    const subtotal = Number(serviceOrder.totalValue);
    const taxAmount = Number(taxes);
    const discount = Number(serviceOrder.discount);
    const total = subtotal + taxAmount - discount;

    // Criar fatura
    const invoice = await prisma.invoice.create({
      data: {
        number: nextNumber,
        serviceOrderId: serviceOrder.id,
        customerId: serviceOrder.customerId,
        dueDate: new Date(dueDate),
        subtotal,
        discount,
        taxes: taxAmount,
        total,
        notes: notes || null
      },
      include: {
        customer: true,
        serviceOrder: {
          include: {
            parts: { include: { part: true } },
            services: { include: { service: true } }
          }
        }
      }
    });

    res.json({
      success: true,
      message: 'Fatura gerada com sucesso',
      data: invoice
    });
  } catch (error) {
    console.error('Erro ao gerar fatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Listar faturas
export const getInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status, 
      customerId,
      startDate,
      endDate 
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }
    
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate as string);
      if (endDate) where.issueDate.lte = new Date(endDate as string);
    }

    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          },
          serviceOrder: {
            select: {
              id: true,
              number: true,
              vehicle: {
                select: {
                  plate: true,
                  brand: true,
                  model: true
                }
              }
            }
          },
          payments: {
            select: {
              id: true,
              amount: true,
              method: true,
              paidAt: true
            }
          }
        },
        orderBy: { issueDate: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.invoice.count({ where })
    ]);

    // Calcular valores pagos para cada fatura
    const invoicesWithPayments = invoices.map(invoice => {
      const totalPaid = invoice.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
      const remainingAmount = Number(invoice.total) - totalPaid;

      return {
        ...invoice,
        totalPaid,
        remainingAmount,
        isPaid: remainingAmount <= 0
      };
    });

    res.json({
      success: true,
      data: invoicesWithPayments,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar faturas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Obter fatura por ID
export const getInvoiceById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da fatura é obrigatório'
      });
      return;
    }

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

    res.json({
      success: true,
      data: {
        ...invoice,
        totalPaid,
        remainingAmount,
        isPaid: remainingAmount <= 0
      }
    });
  } catch (error) {
    console.error('Erro ao buscar fatura:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Registrar pagamento
export const addPayment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { invoiceId } = req.params;
    const { amount, method, reference, notes } = req.body;

    if (!invoiceId) {
      res.status(400).json({
        success: false,
        error: 'ID da fatura é obrigatório'
      });
      return;
    }

    // Verificar se a fatura existe
    const invoice = await prisma.invoice.findFirst({
      where: { id: invoiceId },
      include: { payments: true }
    });

    if (!invoice) {
      res.status(404).json({
        success: false,
        error: 'Fatura não encontrada'
      });
      return;
    }

    // Calcular valor já pago
    const totalPaid = invoice.payments.reduce((sum: number, payment: any) => sum + Number(payment.amount), 0);
    const remainingAmount = Number(invoice.total) - totalPaid;

    if (Number(amount) > remainingAmount) {
      res.status(400).json({
        success: false,
        error: `Valor do pagamento (${amount}) é maior que o valor pendente (${remainingAmount})`
      });
      return;
    }

    // Registrar pagamento
    const payment = await prisma.payment.create({
      data: {
        invoiceId: invoiceId,
        amount: Number(amount),
        method: method,
        reference: reference || null,
        notes: notes || null
      }
    });

    // Atualizar status da fatura se necessário
    const newTotalPaid = totalPaid + Number(amount);
    const newRemainingAmount = Number(invoice.total) - newTotalPaid;

    if (newRemainingAmount <= 0) {
      await prisma.invoice.updateMany({
        where: { id: invoiceId },
        data: { status: 'PAID' }
      });
    }

    res.json({
      success: true,
      message: 'Pagamento registrado com sucesso',
      data: payment
    });
  } catch (error) {
    console.error('Erro ao registrar pagamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Dashboard financeiro
export const getFinancialDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;
    
    // Definir período padrão (mês atual)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date(defaultEndDate.getFullYear(), defaultEndDate.getMonth(), 1);
    
    const start = startDate ? new Date(startDate as string) : defaultStartDate;
    const end = endDate ? new Date(endDate as string) : defaultEndDate;

    // Estatísticas gerais
    const [
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      overdueInvoices,
      totalRevenue,
      totalPending
    ] = await Promise.all([
      prisma.invoice.count({
        where: {
          issueDate: { gte: start, lte: end }
        }
      }),
      prisma.invoice.count({
        where: {
          issueDate: { gte: start, lte: end },
          status: 'PAID'
        }
      }),
      prisma.invoice.count({
        where: {
          issueDate: { gte: start, lte: end },
          status: 'PENDING'
        }
      }),
      prisma.invoice.count({
        where: {
          issueDate: { gte: start, lte: end },
          status: 'OVERDUE'
        }
      }),
      prisma.payment.aggregate({
        _sum: { amount: true },
        where: {
          paidAt: { gte: start, lte: end }
        }
      }),
      prisma.invoice.aggregate({
        _sum: { total: true },
        where: {
          issueDate: { gte: start, lte: end },
          status: { in: ['PENDING', 'OVERDUE'] }
        }
      })
    ]);

    // Receita por dia (para gráfico)
    const dailyRevenue = await prisma.payment.groupBy({
      by: ['paidAt'],
      _sum: { amount: true },
      where: {
        paidAt: { gte: start, lte: end }
      },
      orderBy: { paidAt: 'asc' }
    });

    // Faturas recentes
    const recentInvoices = await prisma.invoice.findMany({
      where: {
        issueDate: { gte: start, lte: end }
      },
      include: {
        customer: {
          select: { name: true }
        }
      },
      orderBy: { issueDate: 'desc' },
      take: 10
    });

    res.json({
      success: true,
      data: {
        period: { startDate: start, endDate: end },
        summary: {
          totalInvoices,
          paidInvoices,
          pendingInvoices,
          overdueInvoices,
          totalRevenue: totalRevenue._sum.amount || 0,
          totalPending: totalPending._sum.total || 0,
          averageInvoiceValue: totalInvoices > 0 ? (Number(totalRevenue._sum.amount || 0) / totalInvoices) : 0
        },
        dailyRevenue: dailyRevenue.map(item => ({
          date: item.paidAt.toISOString().split('T')[0],
          amount: Number(item._sum.amount || 0)
        })),
        recentInvoices
      }
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard financeiro:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
