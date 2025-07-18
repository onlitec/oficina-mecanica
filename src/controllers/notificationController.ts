import { Request, Response } from 'express';
import prisma from '../config/database';

// Listar notificações do usuário
export const getNotifications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20, unreadOnly = false } = req.query;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
      return;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const where: any = { userId };

    if (unreadOnly === 'true') {
      where.isRead = false;
    }

    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    res.json({
      success: true,
      data: notifications,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      },
      unreadCount
    });
  } catch (error) {
    console.error('Erro ao listar notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Marcar notificação como lida
export const markAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da notificação é obrigatório'
      });
      return;
    }

    const notification = await prisma.notification.update({
      where: { id },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Notificação marcada como lida',
      data: notification
    });
  } catch (error) {
    console.error('Erro ao marcar notificação como lida:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Marcar todas as notificações como lidas
export const markAllAsRead = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
      return;
    }

    await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true,
        readAt: new Date()
      }
    });

    res.json({
      success: true,
      message: 'Todas as notificações foram marcadas como lidas'
    });
  } catch (error) {
    console.error('Erro ao marcar todas como lidas:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Criar notificação
export const createNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { 
      type, 
      title, 
      message, 
      priority = 'MEDIUM',
      userId,
      relatedId,
      relatedType,
      data 
    } = req.body;

    const notification = await prisma.notification.create({
      data: {
        type,
        title,
        message,
        priority,
        userId: userId || null,
        relatedId: relatedId || null,
        relatedType: relatedType || null,
        data: data ? JSON.stringify(data) : null
      }
    });

    res.json({
      success: true,
      message: 'Notificação criada com sucesso',
      data: notification
    });
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Verificar faturas vencendo
export const checkDueInvoices = async (req: Request, res: Response): Promise<void> => {
  try {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // Faturas vencendo amanhã
    const dueTomorrow = await prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: tomorrow,
          lt: new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000)
        }
      },
      include: {
        customer: { select: { name: true } }
      }
    });

    // Faturas vencendo na próxima semana
    const dueNextWeek = await prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          gte: tomorrow,
          lte: nextWeek
        }
      },
      include: {
        customer: { select: { name: true } }
      }
    });

    // Faturas vencidas
    const overdue = await prisma.invoice.findMany({
      where: {
        status: 'PENDING',
        dueDate: {
          lt: today
        }
      },
      include: {
        customer: { select: { name: true } }
      }
    });

    // Criar notificações para faturas vencendo amanhã
    for (const invoice of dueTomorrow) {
      await prisma.notification.create({
        data: {
          type: 'INVOICE_DUE',
          title: 'Fatura vence amanhã',
          message: `A fatura #${invoice.number} do cliente ${invoice.customer.name} vence amanhã (${invoice.dueDate.toLocaleDateString('pt-BR')})`,
          priority: 'HIGH',
          relatedId: invoice.id,
          relatedType: 'invoice',
          data: JSON.stringify({
            invoiceNumber: invoice.number,
            customerName: invoice.customer.name,
            amount: invoice.total,
            dueDate: invoice.dueDate
          })
        }
      });
    }

    // Criar notificações para faturas vencidas
    for (const invoice of overdue) {
      await prisma.notification.create({
        data: {
          type: 'INVOICE_OVERDUE',
          title: 'Fatura vencida',
          message: `A fatura #${invoice.number} do cliente ${invoice.customer.name} está vencida desde ${invoice.dueDate.toLocaleDateString('pt-BR')}`,
          priority: 'URGENT',
          relatedId: invoice.id,
          relatedType: 'invoice',
          data: JSON.stringify({
            invoiceNumber: invoice.number,
            customerName: invoice.customer.name,
            amount: invoice.total,
            dueDate: invoice.dueDate,
            daysOverdue: Math.floor((today.getTime() - invoice.dueDate.getTime()) / (1000 * 60 * 60 * 24))
          })
        }
      });

      // Atualizar status da fatura para OVERDUE
      await prisma.invoice.update({
        where: { id: invoice.id },
        data: { status: 'OVERDUE' }
      });
    }

    res.json({
      success: true,
      message: 'Verificação de faturas concluída',
      data: {
        dueTomorrow: dueTomorrow.length,
        dueNextWeek: dueNextWeek.length,
        overdue: overdue.length,
        notificationsCreated: dueTomorrow.length + overdue.length
      }
    });
  } catch (error) {
    console.error('Erro ao verificar faturas vencendo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Verificar estoque baixo
export const checkLowStock = async (req: Request, res: Response): Promise<void> => {
  try {
    // Peças com estoque baixo
    const lowStockParts = await prisma.part.findMany({
      where: {
        status: 'ACTIVE',
        stock: {
          lte: prisma.part.fields.minStock
        }
      }
    });

    // Peças sem estoque
    const outOfStockParts = await prisma.part.findMany({
      where: {
        status: 'ACTIVE',
        stock: 0
      }
    });

    // Criar notificações para peças sem estoque
    for (const part of outOfStockParts) {
      await prisma.notification.create({
        data: {
          type: 'OUT_OF_STOCK',
          title: 'Peça sem estoque',
          message: `A peça ${part.name} (${part.internalCode || 'S/C'}) está sem estoque`,
          priority: 'URGENT',
          relatedId: part.id,
          relatedType: 'part',
          data: JSON.stringify({
            partName: part.name,
            partCode: part.internalCode,
            currentStock: part.stock,
            minStock: part.minStock
          })
        }
      });
    }

    // Criar notificações para peças com estoque baixo
    for (const part of lowStockParts.filter(p => p.stock > 0)) {
      await prisma.notification.create({
        data: {
          type: 'LOW_STOCK',
          title: 'Estoque baixo',
          message: `A peça ${part.name} (${part.internalCode || 'S/C'}) está com estoque baixo: ${part.stock} unidades`,
          priority: 'HIGH',
          relatedId: part.id,
          relatedType: 'part',
          data: JSON.stringify({
            partName: part.name,
            partCode: part.internalCode,
            currentStock: part.stock,
            minStock: part.minStock
          })
        }
      });
    }

    res.json({
      success: true,
      message: 'Verificação de estoque concluída',
      data: {
        lowStock: lowStockParts.length,
        outOfStock: outOfStockParts.length,
        notificationsCreated: lowStockParts.length
      }
    });
  } catch (error) {
    console.error('Erro ao verificar estoque baixo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Dashboard de notificações
export const getNotificationsDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;

    if (!userId) {
      res.status(400).json({
        success: false,
        error: 'ID do usuário é obrigatório'
      });
      return;
    }

    const [
      totalNotifications,
      unreadNotifications,
      urgentNotifications,
      recentNotifications
    ] = await Promise.all([
      prisma.notification.count({
        where: { userId }
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      }),
      prisma.notification.count({
        where: { userId, priority: 'URGENT', isRead: false }
      }),
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 5
      })
    ]);

    // Estatísticas por tipo
    const notificationsByType = await prisma.notification.groupBy({
      by: ['type'],
      where: { userId, isRead: false },
      _count: { _all: true }
    });

    res.json({
      success: true,
      data: {
        summary: {
          total: totalNotifications,
          unread: unreadNotifications,
          urgent: urgentNotifications
        },
        byType: notificationsByType.map(item => ({
          type: item.type,
          count: item._count._all
        })),
        recent: recentNotifications
      }
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard de notificações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
