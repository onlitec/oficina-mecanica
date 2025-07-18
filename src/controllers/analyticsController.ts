import { Request, Response } from 'express';
import prisma from '../config/database';

// Dashboard de analytics geral
export const getAnalyticsDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate } = req.query;

    // Definir período padrão (últimos 30 dias)
    const start = startDate ? new Date(startDate as string) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const end = endDate ? new Date(endDate as string) : new Date();

    // Buscar dados básicos primeiro
    const quotesMetrics = await getQuotesMetrics(start, end);
    const salesMetrics = await getSalesMetrics(start, end);
    const conversionMetrics = await getConversionMetrics(start, end);

    res.json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
          days: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        },
        quotes: quotesMetrics,
        sales: salesMetrics,
        conversion: conversionMetrics
      }
    });
  } catch (error) {
    console.error('Erro ao buscar analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Métricas de orçamentos
async function getQuotesMetrics(startDate: Date, endDate: Date) {
  const [total, byStatus] = await Promise.all([
    // Total de orçamentos
    prisma.quote.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),

    // Orçamentos por status
    prisma.quote.groupBy({
      by: ['status'],
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })
  ]);

  return {
    total,
    byStatus: byStatus.reduce((acc: any, item) => {
      acc[item.status] = item._count.id;
      return acc;
    }, {})
  };
}

// Métricas de vendas
async function getSalesMetrics(startDate: Date, endDate: Date) {
  const [totalOrders, completedOrders] = await Promise.all([
    // Total de ordens de serviço
    prisma.serviceOrder.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),

    // Ordens completadas
    prisma.serviceOrder.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'COMPLETED'
      }
    })
  ]);

  return {
    totalOrders,
    completedOrders,
    completionRate: totalOrders > 0 ? Math.round((completedOrders / totalOrders) * 100) : 0
  };
}

// Métricas de conversão
async function getConversionMetrics(startDate: Date, endDate: Date) {
  const [quotesCreated, quotesApproved, quotesConverted] = await Promise.all([
    // Orçamentos criados
    prisma.quote.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),

    // Orçamentos aprovados
    prisma.quote.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'APPROVED'
      }
    }),

    // Orçamentos convertidos
    prisma.quote.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'CONVERTED'
      }
    })
  ]);

  const approvalRate = quotesCreated > 0 ? Math.round((quotesApproved / quotesCreated) * 100) : 0;
  const conversionRate = quotesApproved > 0 ? Math.round((quotesConverted / quotesApproved) * 100) : 0;
  const overallConversionRate = quotesCreated > 0 ? Math.round((quotesConverted / quotesCreated) * 100) : 0;

  return {
    quotesCreated,
    quotesApproved,
    quotesConverted,
    approvalRate,
    conversionRate,
    overallConversionRate
  };
}

// Métricas de receita
async function getRevenueMetrics(startDate: Date, endDate: Date) {
  const [totalRevenue, paidInvoices, pendingRevenue, revenueByPeriod] = await Promise.all([
    // Receita total
    prisma.invoice.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'PAID'
      },
      _sum: {
        total: true
      }
    }),
    
    // Faturas pagas
    prisma.invoice.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'PAID'
      }
    }),
    
    // Receita pendente
    prisma.invoice.aggregate({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: 'PENDING'
      },
      _sum: {
        total: true
      }
    }),
    
    // Receita por período
    prisma.$queryRaw`
      SELECT
        DATE(createdAt) as date,
        SUM(CASE WHEN status = 'PAID' THEN total ELSE 0 END) as paidRevenue,
        SUM(CASE WHEN status = 'PENDING' THEN total ELSE 0 END) as pendingRevenue,
        COUNT(*) as invoiceCount
      FROM invoices
      WHERE createdAt >= ${startDate} AND createdAt <= ${endDate}
      GROUP BY DATE(createdAt)
      ORDER BY date DESC
      LIMIT 30
    `
  ]);

  return {
    totalRevenue: Number(totalRevenue._sum?.total || 0),
    pendingRevenue: Number(pendingRevenue._sum?.total || 0),
    paidInvoices,
    avgInvoiceValue: paidInvoices > 0 ? Number(totalRevenue._sum?.total || 0) / paidInvoices : 0,
    timeline: revenueByPeriod
  };
}

// Métricas de clientes
async function getCustomerMetrics(startDate: Date, endDate: Date) {
  const [newCustomers, activeCustomers, topCustomers, customerRetention] = await Promise.all([
    // Novos clientes
    prisma.customer.count({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        }
      }
    }),
    
    // Clientes ativos (com ordens no período)
    prisma.customer.count({
      where: {
        serviceOrders: {
          some: {
            createdAt: {
              gte: startDate,
              lte: endDate
            }
          }
        }
      }
    }),
    
    // Top clientes por valor
    prisma.$queryRaw`
      SELECT
        c.id,
        c.name,
        COUNT(DISTINCT so.id) as orderCount,
        SUM(i.total) as totalSpent
      FROM customers c
      LEFT JOIN service_orders so ON c.id = so.customerId
      LEFT JOIN invoices i ON so.id = i.serviceOrderId
      WHERE so.createdAt >= ${startDate} AND so.createdAt <= ${endDate}
        AND i.status = 'PAID'
      GROUP BY c.id, c.name
      ORDER BY totalSpent DESC
      LIMIT 10
    `,
    
    // Taxa de retenção (clientes que voltaram)
    prisma.$queryRaw`
      SELECT 
        COUNT(DISTINCT customerId) as returningCustomers
      FROM service_orders 
      WHERE customerId IN (
        SELECT customerId 
        FROM service_orders 
        WHERE createdAt < ${startDate}
      )
      AND createdAt >= ${startDate} AND createdAt <= ${endDate}
    `
  ]);

  const retentionRate = newCustomers > 0 ? ((customerRetention as any[])[0]?.returningCustomers || 0) / newCustomers * 100 : 0;

  return {
    newCustomers,
    activeCustomers,
    retentionRate,
    topCustomers
  };
}

// Métricas de performance
async function getPerformanceMetrics(startDate: Date, endDate: Date) {
  const [avgQuoteTime, avgServiceTime, stockTurnover, profitability] = await Promise.all([
    // Tempo médio de aprovação de orçamentos
    prisma.$queryRaw`
      SELECT 
        AVG(JULIANDAY(updatedAt) - JULIANDAY(createdAt)) as avgDays
      FROM quotes 
      WHERE status = 'APPROVED' 
        AND createdAt >= ${startDate} AND createdAt <= ${endDate}
    `,
    
    // Tempo médio de conclusão de serviços
    prisma.$queryRaw`
      SELECT 
        AVG(JULIANDAY(updatedAt) - JULIANDAY(createdAt)) as avgDays
      FROM service_orders 
      WHERE status = 'COMPLETED' 
        AND createdAt >= ${startDate} AND createdAt <= ${endDate}
    `,
    
    // Giro de estoque (peças mais usadas)
    prisma.serviceOrderPart.groupBy({
      by: ['partId'],
      where: {
        serviceOrder: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      },
      _sum: {
        quantity: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    }),
    
    // Margem de lucro estimada
    prisma.$queryRaw`
      SELECT
        SUM(i.total) as totalRevenue,
        SUM(sop.totalPrice) as totalCosts
      FROM invoices i
      LEFT JOIN service_orders so ON i.serviceOrderId = so.id
      LEFT JOIN service_order_parts sop ON so.id = sop.serviceOrderId
      WHERE i.status = 'PAID'
        AND i.createdAt >= ${startDate} AND i.createdAt <= ${endDate}
    `
  ]);

  const profitData = (profitability as any[])[0];
  const profitMargin = profitData?.totalRevenue > 0 ? 
    ((profitData.totalRevenue - (profitData.totalCosts || 0)) / profitData.totalRevenue) * 100 : 0;

  return {
    avgQuoteApprovalTime: (avgQuoteTime as any[])[0]?.avgDays || 0,
    avgServiceCompletionTime: (avgServiceTime as any[])[0]?.avgDays || 0,
    topMovingParts: stockTurnover,
    profitMargin
  };
}

// Insights automáticos
export const getBusinessInsights = async (req: Request, res: Response): Promise<void> => {
  try {
    const insights = [];
    
    // Período de análise (últimos 30 dias vs 30 dias anteriores)
    const now = new Date();
    const last30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const previous30Days = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Comparar métricas
    const [currentMetrics, previousMetrics] = await Promise.all([
      getConversionMetrics(last30Days, now),
      getConversionMetrics(previous30Days, last30Days)
    ]);

    // Insight: Taxa de conversão
    const conversionChange = currentMetrics.overallConversionRate - previousMetrics.overallConversionRate;
    if (Math.abs(conversionChange) > 5) {
      insights.push({
        type: conversionChange > 0 ? 'positive' : 'negative',
        title: 'Taxa de Conversão',
        message: `Sua taxa de conversão ${conversionChange > 0 ? 'aumentou' : 'diminuiu'} ${Math.abs(conversionChange).toFixed(1)}% nos últimos 30 dias`,
        value: `${currentMetrics.overallConversionRate.toFixed(1)}%`,
        change: `${conversionChange > 0 ? '+' : ''}${conversionChange.toFixed(1)}%`,
        recommendation: conversionChange < 0 ? 
          'Considere revisar seus orçamentos e melhorar o follow-up com clientes' :
          'Continue com as estratégias atuais que estão funcionando bem'
      });
    }

    // Insight: Orçamentos pendentes
    const pendingQuotes = await prisma.quote.count({
      where: {
        status: 'SENT',
        createdAt: {
          gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        }
      }
    });

    if (pendingQuotes > 0) {
      insights.push({
        type: 'warning',
        title: 'Orçamentos Pendentes',
        message: `Você tem ${pendingQuotes} orçamentos aguardando resposta`,
        value: pendingQuotes.toString(),
        recommendation: 'Faça follow-up com os clientes para acelerar as aprovações'
      });
    }

    // Insight: Receita
    const [currentRevenue, previousRevenue] = await Promise.all([
      getRevenueMetrics(last30Days, now),
      getRevenueMetrics(previous30Days, last30Days)
    ]);

    const revenueChange = previousRevenue.totalRevenue > 0 ?
      ((Number(currentRevenue.totalRevenue) - Number(previousRevenue.totalRevenue)) / Number(previousRevenue.totalRevenue)) * 100 : 0;
    if (Math.abs(revenueChange) > 10) {
      insights.push({
        type: revenueChange > 0 ? 'positive' : 'negative',
        title: 'Receita',
        message: `Sua receita ${revenueChange > 0 ? 'cresceu' : 'diminuiu'} ${Math.abs(revenueChange).toFixed(1)}% nos últimos 30 dias`,
        value: `R$ ${currentRevenue.totalRevenue.toLocaleString('pt-BR')}`,
        change: `${revenueChange > 0 ? '+' : ''}${revenueChange.toFixed(1)}%`,
        recommendation: revenueChange < 0 ? 
          'Analise os motivos da queda e considere estratégias de recuperação' :
          'Excelente performance! Considere expandir as estratégias que estão funcionando'
      });
    }

    res.json({
      success: true,
      data: {
        insights,
        generatedAt: new Date(),
        period: {
          current: { start: last30Days, end: now },
          previous: { start: previous30Days, end: last30Days }
        }
      }
    });

  } catch (error) {
    console.error('Erro ao gerar insights:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
