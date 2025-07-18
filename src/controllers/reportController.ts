import { Request, Response } from 'express';
import prisma from '../config/database';

// Relatório de consumo de peças
export const getPartsConsumptionReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    
    // Definir período padrão (últimos 30 dias)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const start = startDate ? new Date(startDate as string) : defaultStartDate;
    const end = endDate ? new Date(endDate as string) : defaultEndDate;
    
    // Buscar peças mais utilizadas no período
    const partsConsumption = await prisma.serviceOrderPart.groupBy({
      by: ['partId'],
      where: {
        serviceOrder: {
          createdAt: {
            gte: start,
            lte: end,
          },
        },
      },
      _sum: {
        quantity: true,
        totalPrice: true,
      },
      _count: {
        serviceOrderId: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: Number(limit),
    });

    // Buscar detalhes das peças
    const partsWithDetails = await Promise.all(
      partsConsumption.map(async (consumption) => {
        const part = await prisma.part.findUnique({
          where: { id: consumption.partId },
          select: {
            id: true,
            name: true,
            internalCode: true,
            brand: true,
            unit: true,
            stock: true,
            minStock: true,
            salePrice: true,
            costPrice: true,
          },
        });

        return {
          part,
          totalQuantity: consumption._sum.quantity || 0,
          totalValue: consumption._sum.totalPrice || 0,
          timesUsed: consumption._count.serviceOrderId || 0,
          averageQuantityPerUse: consumption._sum.quantity && consumption._count.serviceOrderId 
            ? (consumption._sum.quantity / consumption._count.serviceOrderId) 
            : 0,
        };
      })
    );

    // Calcular totais gerais
    const totalQuantityConsumed = partsWithDetails.reduce((sum, item) => sum + item.totalQuantity, 0);
    const totalValueConsumed = partsWithDetails.reduce((sum, item) => sum + Number(item.totalValue), 0);
    const totalPartsTypes = partsWithDetails.length;

    res.json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
        },
        summary: {
          totalQuantityConsumed,
          totalValueConsumed,
          totalPartsTypes,
          averageValuePerPart: totalPartsTypes > 0 ? totalValueConsumed / totalPartsTypes : 0,
        },
        parts: partsWithDetails,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de consumo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Relatório de estoque baixo
export const getLowStockReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const lowStockParts = await prisma.part.findMany({
      where: {
        OR: [
          { stock: { lte: prisma.part.fields.minStock } },
          { stock: 0 },
        ],
        status: 'ACTIVE',
      },
      orderBy: [
        { stock: 'asc' },
        { name: 'asc' },
      ],
    });

    // Categorizar por nível de criticidade
    const outOfStock = lowStockParts.filter(part => part.stock <= 0);
    const lowStock = lowStockParts.filter(part => part.stock > 0 && part.stock <= part.minStock);
    const criticalStock = lowStockParts.filter(part => part.stock > 0 && part.stock <= (part.minStock * 0.5));

    // Calcular valor total em risco
    const totalValueAtRisk = lowStockParts.reduce((sum, part) => {
      return sum + (part.stock * Number(part.costPrice));
    }, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalPartsAtRisk: lowStockParts.length,
          outOfStockCount: outOfStock.length,
          lowStockCount: lowStock.length,
          criticalStockCount: criticalStock.length,
          totalValueAtRisk,
        },
        categories: {
          outOfStock,
          criticalStock,
          lowStock,
        },
        allParts: lowStockParts,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de estoque baixo:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Relatório de movimentação de estoque
export const getStockMovementReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const { startDate, endDate, partId } = req.query;
    
    // Definir período padrão (últimos 30 dias)
    const defaultEndDate = new Date();
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() - 30);
    
    const start = startDate ? new Date(startDate as string) : defaultStartDate;
    const end = endDate ? new Date(endDate as string) : defaultEndDate;
    
    const whereClause: any = {
      serviceOrder: {
        createdAt: {
          gte: start,
          lte: end,
        },
      },
    };
    
    if (partId) {
      whereClause.partId = partId as string;
    }

    // Buscar movimentações
    const movements = await prisma.serviceOrderPart.findMany({
      where: whereClause,
      include: {
        part: {
          select: {
            id: true,
            name: true,
            internalCode: true,
            brand: true,
            unit: true,
          },
        },
        serviceOrder: {
          select: {
            id: true,
            number: true,
            createdAt: true,
            customer: {
              select: {
                name: true,
              },
            },
            vehicle: {
              select: {
                brand: true,
                model: true,
                plate: true,
              },
            },
          },
        },
      },
      orderBy: {
        serviceOrder: {
          createdAt: 'desc',
        },
      },
    });

    // Agrupar por data para gráfico
    const movementsByDate = movements.reduce((acc: Record<string, any>, movement) => {
      const date = movement.serviceOrder.createdAt.toISOString().split('T')[0];
      const dateKey = date || 'unknown';
      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          totalQuantity: 0,
          totalValue: 0,
          movementsCount: 0,
        };
      }
      acc[dateKey].totalQuantity += movement.quantity;
      acc[dateKey].totalValue += Number(movement.totalPrice);
      acc[dateKey].movementsCount += 1;
      return acc;
    }, {});

    const chartData = Object.values(movementsByDate).sort((a: any, b: any) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Preencher dias sem movimentação no período
    const filledChartData = [];
    const currentDate = new Date(start);
    const endDateObj = new Date(end);

    while (currentDate <= endDateObj) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const existingData = chartData.find((item: any) => item.date === dateStr);

      filledChartData.push(existingData || {
        date: dateStr,
        totalQuantity: 0,
        totalValue: 0,
        movementsCount: 0,
      });

      currentDate.setDate(currentDate.getDate() + 1);
    }

    res.json({
      success: true,
      data: {
        period: {
          startDate: start,
          endDate: end,
        },
        summary: {
          totalMovements: movements.length,
          totalQuantity: movements.reduce((sum, m) => sum + m.quantity, 0),
          totalValue: movements.reduce((sum, m) => sum + Number(m.totalPrice), 0),
        },
        movements,
        chartData: filledChartData,
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de movimentação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Relatório de valor de estoque
export const getStockValueReport = async (req: Request, res: Response): Promise<void> => {
  try {
    const parts = await prisma.part.findMany({
      where: {
        status: 'ACTIVE',
      },
      select: {
        id: true,
        name: true,
        internalCode: true,
        brand: true,
        category: true,
        stock: true,
        costPrice: true,
        salePrice: true,
      },
    });

    // Calcular valores por categoria
    const valueByCategory = parts.reduce((acc: any, part) => {
      const category = part.category || 'OTHER';
      const stockValue = part.stock * Number(part.costPrice);
      const potentialValue = part.stock * Number(part.salePrice);
      
      if (!acc[category]) {
        acc[category] = {
          category,
          partsCount: 0,
          totalStock: 0,
          stockValue: 0,
          potentialValue: 0,
          potentialProfit: 0,
        };
      }
      
      acc[category].partsCount += 1;
      acc[category].totalStock += part.stock;
      acc[category].stockValue += stockValue;
      acc[category].potentialValue += potentialValue;
      acc[category].potentialProfit += (potentialValue - stockValue);
      
      return acc;
    }, {});

    const categoryData = Object.values(valueByCategory);

    // Calcular totais gerais
    const totalStockValue = parts.reduce((sum, part) => sum + (part.stock * Number(part.costPrice)), 0);
    const totalPotentialValue = parts.reduce((sum, part) => sum + (part.stock * Number(part.salePrice)), 0);
    const totalPotentialProfit = totalPotentialValue - totalStockValue;
    const totalParts = parts.length;
    const totalStock = parts.reduce((sum, part) => sum + part.stock, 0);

    res.json({
      success: true,
      data: {
        summary: {
          totalParts,
          totalStock,
          totalStockValue,
          totalPotentialValue,
          totalPotentialProfit,
          averageStockValuePerPart: totalParts > 0 ? totalStockValue / totalParts : 0,
        },
        categories: categoryData,
        parts: parts.map(part => ({
          ...part,
          stockValue: part.stock * Number(part.costPrice),
          potentialValue: part.stock * Number(part.salePrice),
          potentialProfit: part.stock * (Number(part.salePrice) - Number(part.costPrice)),
        })),
      },
    });
  } catch (error) {
    console.error('Erro ao gerar relatório de valor de estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Dashboard geral de peças
export const getPartsDashboard = async (req: Request, res: Response): Promise<void> => {
  try {
    // Estatísticas gerais
    const [
      totalParts,
      activeParts,
      lowStockParts,
      outOfStockParts,
      totalStockValue,
    ] = await Promise.all([
      prisma.part.count(),
      prisma.part.count({ where: { status: 'ACTIVE' } }),
      prisma.part.count({ 
        where: { 
          stock: { lte: prisma.part.fields.minStock },
          status: 'ACTIVE',
        } 
      }),
      prisma.part.count({ 
        where: { 
          stock: 0,
          status: 'ACTIVE',
        } 
      }),
      prisma.part.aggregate({
        _sum: {
          stock: true,
        },
        where: {
          status: 'ACTIVE',
        },
      }),
    ]);

    // Peças mais utilizadas (últimos 30 dias)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const topParts = await prisma.serviceOrderPart.groupBy({
      by: ['partId'],
      where: {
        serviceOrder: {
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      },
      _sum: {
        quantity: true,
      },
      orderBy: {
        _sum: {
          quantity: 'desc',
        },
      },
      take: 5,
    });

    const topPartsWithDetails = await Promise.all(
      topParts.map(async (item) => {
        const part = await prisma.part.findUnique({
          where: { id: item.partId },
          select: { name: true, internalCode: true },
        });
        return {
          part,
          quantity: item._sum.quantity || 0,
        };
      })
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalParts,
          activeParts,
          lowStockParts,
          outOfStockParts,
          totalStockQuantity: totalStockValue._sum.stock || 0,
        },
        topParts: topPartsWithDetails,
        alerts: {
          lowStock: lowStockParts,
          outOfStock: outOfStockParts,
        },
      },
    });
  } catch (error) {
    console.error('Erro ao gerar dashboard de peças:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};
