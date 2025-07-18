import { Request, Response } from 'express';
import prisma from '../config/database';

// Listar orçamentos
export const getQuotes = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, status, customerId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};
    
    if (status) {
      where.status = status;
    }
    
    if (customerId) {
      where.customerId = customerId;
    }

    const [quotes, total] = await Promise.all([
      prisma.quote.findMany({
        where,
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
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit)
      }),
      prisma.quote.count({ where })
    ]);

    res.json({
      success: true,
      data: quotes,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao listar orçamentos:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Obter orçamento por ID
export const getQuoteById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const quote = await prisma.quote.findUnique({
      where: { id: id as string },
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
        },
        serviceOrder: true
      }
    });

    if (!quote) {
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Criar orçamento
export const createQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerId,
      vehicleId,
      title,
      description,
      customerRequest,
      validUntil,
      notes,
      terms,
      paymentTerms,
      deliveryTerms,
      items = []
    } = req.body;

    if (!customerId || !title || !validUntil) {
      res.status(400).json({
        success: false,
        error: 'Campos obrigatórios: customerId, title, validUntil'
      });
      return;
    }

    // Gerar número do orçamento
    const lastQuote = await prisma.quote.findFirst({
      orderBy: { number: 'desc' }
    });

    const nextNumber = lastQuote 
      ? String(parseInt(lastQuote.number) + 1).padStart(6, '0')
      : '000001';

    // Calcular valores dos itens
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;
      
      return {
        type: item.type,
        partId: item.partId || null,
        serviceId: item.serviceId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        notes: item.notes || null
      };
    });

    const discount = req.body.discount || 0;
    const taxes = req.body.taxes || 0;
    const total = subtotal - discount + taxes;

    const quote = await prisma.quote.create({
      data: {
        number: nextNumber,
        customerId,
        vehicleId: vehicleId || null,
        title,
        description: description || null,
        customerRequest: customerRequest || null,
        validUntil: new Date(validUntil),
        subtotal,
        discount,
        taxes,
        total,
        notes: notes || null,
        terms: terms || null,
        paymentTerms: paymentTerms || null,
        deliveryTerms: deliveryTerms || null,
        createdBy: req.body.createdBy || 'system', // TODO: pegar do usuário logado
        items: {
          create: processedItems
        }
      },
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

    res.status(201).json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Erro ao criar orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar orçamento
export const updateQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      customerRequest,
      validUntil,
      notes,
      terms,
      paymentTerms,
      deliveryTerms,
      items = []
    } = req.body;

    // Verificar se o orçamento existe
    const existingQuote = await prisma.quote.findUnique({
      where: { id: id as string }
    });

    if (!existingQuote) {
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    // Verificar se pode ser editado
    if (existingQuote.status === 'CONVERTED') {
      res.status(400).json({
        success: false,
        error: 'Orçamento já foi convertido em ordem de serviço'
      });
      return;
    }

    // Calcular valores dos itens
    let subtotal = 0;
    const processedItems = items.map((item: any) => {
      const totalPrice = item.quantity * item.unitPrice;
      subtotal += totalPrice;
      
      return {
        type: item.type,
        partId: item.partId || null,
        serviceId: item.serviceId || null,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice,
        notes: item.notes || null
      };
    });

    const discount = req.body.discount || 0;
    const taxes = req.body.taxes || 0;
    const total = subtotal - discount + taxes;

    // Atualizar orçamento
    const quote = await prisma.quote.update({
      where: { id: id as string },
      data: {
        title: title || existingQuote.title,
        description: description !== undefined ? description : existingQuote.description,
        customerRequest: customerRequest !== undefined ? customerRequest : existingQuote.customerRequest,
        validUntil: validUntil ? new Date(validUntil) : existingQuote.validUntil,
        subtotal,
        discount,
        taxes,
        total,
        notes: notes !== undefined ? notes : existingQuote.notes,
        terms: terms !== undefined ? terms : existingQuote.terms,
        paymentTerms: paymentTerms !== undefined ? paymentTerms : existingQuote.paymentTerms,
        deliveryTerms: deliveryTerms !== undefined ? deliveryTerms : existingQuote.deliveryTerms,
        items: {
          deleteMany: {},
          create: processedItems
        }
      },
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

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Erro ao atualizar orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar status do orçamento
export const updateQuoteStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      res.status(400).json({
        success: false,
        error: 'Status é obrigatório'
      });
      return;
    }

    const quote = await prisma.quote.update({
      where: { id: id as string },
      data: { status },
      include: {
        customer: true,
        vehicle: true,
        items: {
          include: {
            part: true,
            service: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: quote
    });
  } catch (error) {
    console.error('Erro ao atualizar status do orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Converter orçamento em ordem de serviço
export const convertToServiceOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Buscar orçamento com itens
    const quote = await prisma.quote.findUnique({
      where: { id: id as string },
      include: {
        customer: true,
        vehicle: true,
        items: {
          include: {
            part: true,
            service: true
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

    if (quote.status === 'CONVERTED') {
      res.status(400).json({
        success: false,
        error: 'Orçamento já foi convertido'
      });
      return;
    }

    if (quote.status !== 'APPROVED') {
      res.status(400).json({
        success: false,
        error: 'Apenas orçamentos aprovados podem ser convertidos'
      });
      return;
    }

    // Gerar número da OS
    const lastOrder = await prisma.serviceOrder.findFirst({
      orderBy: { number: 'desc' }
    });

    const nextNumber = lastOrder
      ? String(parseInt(lastOrder.number) + 1).padStart(6, '0')
      : '000001';

    // Criar ordem de serviço
    const serviceOrderData: any = {
      number: nextNumber,
      customerId: quote.customerId,
      customerComplaint: quote.customerRequest || quote.description || '',
      diagnosis: `Convertido do orçamento #${quote.number}`,
      status: 'OPEN',
      priority: 'NORMAL',
      createdById: quote.createdBy,
      assignedToId: quote.createdBy
    };

    if (quote.vehicleId) {
      serviceOrderData.vehicleId = quote.vehicleId;
    }

    const serviceOrder = await prisma.serviceOrder.create({
      data: serviceOrderData
    });

    // Adicionar peças à OS (apenas itens com partId/serviceId válidos)
    for (const item of quote.items) {
      if (item.type === 'PART' && item.partId) {
        await prisma.serviceOrderPart.create({
          data: {
            serviceOrderId: serviceOrder.id,
            partId: item.partId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }
        });
      } else if (item.type === 'SERVICE' && item.serviceId) {
        await prisma.serviceOrderService.create({
          data: {
            serviceOrderId: serviceOrder.id,
            serviceId: item.serviceId,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice
          }
        });
      }
      // Itens sem partId/serviceId são ignorados na conversão
    }

    // Atualizar orçamento
    await prisma.quote.update({
      where: { id: id as string },
      data: {
        status: 'CONVERTED',
        serviceOrderId: serviceOrder.id
      }
    });

    // Buscar OS criada com relacionamentos
    const createdOrder = await prisma.serviceOrder.findUnique({
      where: { id: serviceOrder.id },
      include: {
        customer: true,
        vehicle: true,
        parts: {
          include: { part: true }
        },
        services: {
          include: { service: true }
        }
      }
    });

    res.json({
      success: true,
      message: 'Orçamento convertido em ordem de serviço com sucesso',
      data: {
        quote: { ...quote, status: 'CONVERTED', serviceOrderId: serviceOrder.id },
        serviceOrder: createdOrder
      }
    });
  } catch (error) {
    console.error('Erro ao converter orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Deletar orçamento
export const deleteQuote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar se o orçamento existe
    const existingQuote = await prisma.quote.findUnique({
      where: { id: id as string }
    });

    if (!existingQuote) {
      res.status(404).json({
        success: false,
        error: 'Orçamento não encontrado'
      });
      return;
    }

    // Verificar se pode ser deletado
    if (existingQuote.status === 'CONVERTED') {
      res.status(400).json({
        success: false,
        error: 'Orçamento já foi convertido em ordem de serviço'
      });
      return;
    }

    await prisma.quote.delete({
      where: { id: id as string }
    });

    res.json({
      success: true,
      message: 'Orçamento deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar orçamento:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
