import { Request, Response } from 'express';
import prisma from '../config/database';

// Gerar número sequencial da OS
async function generateOrderNumber(): Promise<string> {
  const currentYear = new Date().getFullYear();
  const prefix = `OS${currentYear}`;
  
  // Buscar última OS do ano
  const lastOrder = await prisma.serviceOrder.findFirst({
    where: {
      number: {
        startsWith: prefix,
      },
    },
    orderBy: {
      number: 'desc',
    },
  });
  
  let nextNumber = 1;
  if (lastOrder) {
    const lastNumber = parseInt(lastOrder.number.replace(prefix, ''));
    nextNumber = lastNumber + 1;
  }
  
  return `${prefix}${nextNumber.toString().padStart(4, '0')}`;
}

// Listar ordens de serviço
export const getServiceOrders = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, status, priority, customerId, vehicleId } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    const where: any = {};
    
    // Filtro por busca
    if (search) {
      where.OR = [
        { number: { contains: search as string } },
        { customerComplaint: { contains: search as string, mode: 'insensitive' } },
        { customer: { name: { contains: search as string, mode: 'insensitive' } } },
        { vehicle: { plate: { contains: search as string } } },
      ];
    }
    
    // Filtros específicos
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (customerId) where.customerId = customerId;
    if (vehicleId) where.vehicleId = vehicleId;

    const [serviceOrders, total] = await Promise.all([
      prisma.serviceOrder.findMany({
        where,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              email: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              plate: true,
              brand: true,
              model: true,
              year: true,
              color: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              services: true,
              parts: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.serviceOrder.count({ where }),
    ]);

    res.json({
      success: true,
      data: serviceOrders,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar ordens de serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Buscar ordem de serviço por ID
export const getServiceOrderById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da ordem de serviço é obrigatório',
      });
      return;
    }

    const serviceOrder = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        customer: true,
        vehicle: true,
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        services: {
          include: {
            service: true,
          },
        },
        parts: {
          include: {
            part: true,
          },
        },
      },
    });

    if (!serviceOrder) {
      res.status(404).json({
        success: false,
        error: 'Ordem de serviço não encontrada',
      });
      return;
    }

    res.json({
      success: true,
      data: serviceOrder,
    });
  } catch (error) {
    console.error('Erro ao buscar ordem de serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Criar nova ordem de serviço
export const createServiceOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      customerId,
      vehicleId,
      customerComplaint,
      symptoms,
      diagnosis,
      observations,
      priority = 'NORMAL',
      estimatedDate,
      vehicleMileage,
      assignedToId,
      services = [],
      parts = [],
    } = req.body;

    // Validações básicas
    if (!customerId || !vehicleId) {
      res.status(400).json({
        success: false,
        error: 'Cliente e veículo são obrigatórios',
      });
      return;
    }

    // Verificar se cliente e veículo existem
    const [customer, vehicle] = await Promise.all([
      prisma.customer.findUnique({ where: { id: customerId } }),
      prisma.vehicle.findUnique({ where: { id: vehicleId } }),
    ]);

    if (!customer) {
      res.status(400).json({
        success: false,
        error: 'Cliente não encontrado',
      });
      return;
    }

    if (!vehicle) {
      res.status(400).json({
        success: false,
        error: 'Veículo não encontrado',
      });
      return;
    }

    // Verificar se o veículo pertence ao cliente
    if (vehicle.customerId !== customerId) {
      res.status(400).json({
        success: false,
        error: 'Veículo não pertence ao cliente selecionado',
      });
      return;
    }

    // Gerar número da OS
    const orderNumber = await generateOrderNumber();

    // Criar OS em transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar ordem de serviço
      const serviceOrder = await tx.serviceOrder.create({
        data: {
          number: orderNumber,
          customerId,
          vehicleId,
          customerComplaint,
          symptoms,
          diagnosis,
          observations,
          priority,
          estimatedDate: estimatedDate ? new Date(estimatedDate) : null,
          vehicleMileage: vehicleMileage ? parseInt(vehicleMileage) : null,
          createdById: 'cmd6ofal40000jrkf0qrdrnug', // ID do usuário admin padrão
          assignedToId,
          status: 'OPEN',
        },
      });

      // Adicionar serviços se fornecidos
      if (services && services.length > 0) {
        for (const serviceData of services) {
          if (serviceData.serviceId) {
            await tx.serviceOrderService.create({
              data: {
                serviceOrderId: serviceOrder.id,
                serviceId: serviceData.serviceId,
                quantity: serviceData.quantity || 1,
                unitPrice: serviceData.unitPrice || 0,
                totalPrice: (serviceData.quantity || 1) * (serviceData.unitPrice || 0),
              },
            });
          }
        }
      }

      // Adicionar peças se fornecidas
      if (parts && parts.length > 0) {
        for (const partData of parts) {
          if (partData.partId) {
            // Verificar estoque disponível
            const part = await tx.part.findUnique({
              where: { id: partData.partId },
            });

            if (!part) {
              throw new Error(`Peça com ID ${partData.partId} não encontrada`);
            }

            const requestedQuantity = partData.quantity || 1;
            if (part.stock < requestedQuantity) {
              throw new Error(`Estoque insuficiente para ${part.name}. Disponível: ${part.stock}, Solicitado: ${requestedQuantity}`);
            }

            // Criar vinculação da peça
            await tx.serviceOrderPart.create({
              data: {
                serviceOrderId: serviceOrder.id,
                partId: partData.partId,
                quantity: requestedQuantity,
                unitPrice: partData.unitPrice || 0,
                totalPrice: requestedQuantity * (partData.unitPrice || 0),
              },
            });

            // Atualizar estoque (baixa automática)
            await tx.part.update({
              where: { id: partData.partId },
              data: {
                stock: {
                  decrement: requestedQuantity,
                },
              },
            });
          }
        }
      }

      return serviceOrder;
    });

    // Buscar OS completa para retorno
    const completeServiceOrder = await prisma.serviceOrder.findUnique({
      where: { id: result.id },
      include: {
        customer: true,
        vehicle: true,
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        services: { include: { service: true } },
        parts: { include: { part: true } },
      },
    });

    res.status(201).json({
      success: true,
      data: completeServiceOrder,
      message: `Ordem de serviço ${orderNumber} criada com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao criar ordem de serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Atualizar ordem de serviço
export const updateServiceOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da ordem de serviço é obrigatório',
      });
      return;
    }

    // Verificar se OS existe
    const existingOrder = await prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        error: 'Ordem de serviço não encontrada',
      });
      return;
    }

    // Preparar dados para atualização
    const dataToUpdate: any = {};

    // Campos permitidos para atualização
    const allowedFields = [
      'customerComplaint',
      'symptoms',
      'diagnosis',
      'solution',
      'observations',
      'status',
      'priority',
      'estimatedDate',
      'vehicleMileage',
      'assignedToId',
      'laborValue',
      'partsValue',
      'totalValue',
      'discount',
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        if (field === 'estimatedDate' && updateData[field]) {
          dataToUpdate[field] = new Date(updateData[field]);
        } else if (field === 'vehicleMileage' && updateData[field]) {
          dataToUpdate[field] = parseInt(updateData[field]);
        } else {
          dataToUpdate[field] = updateData[field];
        }
      }
    });

    // Se status está sendo alterado para COMPLETED, definir data de conclusão
    if (updateData.status === 'COMPLETED' && existingOrder.status !== 'COMPLETED') {
      dataToUpdate.completedAt = new Date();
    }

    // Atualizar ordem de serviço
    const serviceOrder = await prisma.serviceOrder.update({
      where: { id },
      data: dataToUpdate,
      include: {
        customer: true,
        vehicle: true,
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        services: { include: { service: true } },
        parts: { include: { part: true } },
      },
    });

    res.json({
      success: true,
      data: serviceOrder,
      message: 'Ordem de serviço atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar ordem de serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Atualizar status da ordem de serviço
export const updateServiceOrderStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status, observations } = req.body;

    if (!id || !status) {
      res.status(400).json({
        success: false,
        error: 'ID e status são obrigatórios',
      });
      return;
    }

    // Verificar se OS existe
    const existingOrder = await prisma.serviceOrder.findUnique({
      where: { id },
    });

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        error: 'Ordem de serviço não encontrada',
      });
      return;
    }

    const updateData: any = { status };

    // Adicionar observações se fornecidas
    if (observations) {
      updateData.observations = observations;
    }

    // Se status é COMPLETED, definir data de conclusão
    if (status === 'COMPLETED' && existingOrder.status !== 'COMPLETED') {
      updateData.completedAt = new Date();
    }

    // Atualizar status
    const serviceOrder = await prisma.serviceOrder.update({
      where: { id },
      data: updateData,
      include: {
        customer: { select: { id: true, name: true } },
        vehicle: { select: { id: true, plate: true, brand: true, model: true } },
      },
    });

    res.json({
      success: true,
      data: serviceOrder,
      message: 'Status atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Excluir ordem de serviço
export const deleteServiceOrder = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da ordem de serviço é obrigatório',
      });
      return;
    }

    // Verificar se OS existe
    const existingOrder = await prisma.serviceOrder.findUnique({
      where: { id },
      include: {
        services: true,
        parts: true,
      },
    });

    if (!existingOrder) {
      res.status(404).json({
        success: false,
        error: 'Ordem de serviço não encontrada',
      });
      return;
    }

    // Não permitir exclusão de OS concluídas
    if (existingOrder.status === 'COMPLETED') {
      res.status(400).json({
        success: false,
        error: 'Não é possível excluir ordem de serviço concluída',
      });
      return;
    }

    // Excluir em transação
    await prisma.$transaction(async (tx) => {
      // Excluir serviços relacionados
      await tx.serviceOrderService.deleteMany({
        where: { serviceOrderId: id },
      });

      // Excluir peças relacionadas
      await tx.serviceOrderPart.deleteMany({
        where: { serviceOrderId: id },
      });

      // Excluir ordem de serviço
      await tx.serviceOrder.delete({
        where: { id },
      });
    });

    res.json({
      success: true,
      message: 'Ordem de serviço excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir ordem de serviço:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};
