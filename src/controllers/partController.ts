import { Request, Response } from 'express';
import prisma from '../config/database';

// Listar peças
export const getParts = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, category, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Filtro por busca
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { internalCode: { contains: search as string } },
        { brand: { contains: search as string, mode: 'insensitive' } },
      ];
    }

    // Filtros específicos
    if (category) where.category = category;
    if (status) where.status = status;

    // Teste básico - retornar dados mockados por enquanto
    const parts = [
      {
        id: '1',
        name: 'Filtro de Óleo',
        description: 'Filtro de óleo para motores',
        category: 'PARTS',
        brand: 'Mann',
        stock: 50,
        minStock: 10,
        costPrice: 15.50,
        salePrice: 25.00,
        status: 'ACTIVE',
        unit: 'UN',
        internalCode: 'P001'
      },
      {
        id: '2',
        name: 'Pastilha de Freio',
        description: 'Pastilha de freio dianteira',
        category: 'PARTS',
        brand: 'Bosch',
        stock: 20,
        minStock: 5,
        costPrice: 45.00,
        salePrice: 75.00,
        status: 'ACTIVE',
        unit: 'UN',
        internalCode: 'P002'
      }
    ];

    const total = parts.length;

    // Adicionar indicador de estoque baixo
    const partsWithStockStatus = parts.map(part => ({
      ...part,
      isLowStock: part.stock <= part.minStock,
      stockStatus: part.stock <= 0 ? 'OUT_OF_STOCK' :
                   part.stock <= part.minStock ? 'LOW_STOCK' : 'IN_STOCK'
    }));

    res.json({
      success: true,
      data: partsWithStockStatus,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar peças:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Buscar peça por ID
export const getPartById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da peça é obrigatório',
      });
      return;
    }

    // Por enquanto, retornar dados mockados para teste
    const mockParts: any = {
      '1': {
        id: '1',
        name: 'Filtro de Óleo',
        description: 'Filtro de óleo para motores 1.0 e 1.6',
        category: 'PARTS',
        brand: 'Mann',
        model: 'W712/75',
        unit: 'UN',
        status: 'ACTIVE',
        internalCode: 'P001',
        barcode: '7891234567890',
        costPrice: 15.50,
        salePrice: 25.00,
        stock: 50,
        minStock: 10,
        maxStock: 100,
        reorderPoint: 15,
        location: 'Estante A1',
        mainSupplier: 'Auto Peças Silva',
        alternativeSuppliers: 'Peças & Cia\nDistribuidora XYZ',
        observations: 'Compatível com motores Volkswagen e Ford',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      '2': {
        id: '2',
        name: 'Pastilha de Freio',
        description: 'Pastilha de freio dianteira para veículos compactos',
        category: 'PARTS',
        brand: 'Bosch',
        model: 'BB1234',
        unit: 'UN',
        status: 'ACTIVE',
        internalCode: 'P002',
        costPrice: 45.00,
        salePrice: 75.00,
        stock: 20,
        minStock: 5,
        location: 'Estante B2',
        mainSupplier: 'Bosch Distribuidora',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    };

    const part = mockParts[id];

    if (!part) {
      res.status(404).json({
        success: false,
        error: 'Peça não encontrada',
      });
      return;
    }

    // Adicionar informações de estoque
    const partWithStockInfo = {
      ...part,
      isLowStock: part.stock <= part.minStock,
      stockStatus: part.stock <= 0 ? 'OUT_OF_STOCK' :
                   part.stock <= part.minStock ? 'LOW_STOCK' : 'IN_STOCK',
      stockValue: part.stock * Number(part.costPrice),
    };

    res.json({
      success: true,
      data: partWithStockInfo,
    });
  } catch (error) {
    console.error('Erro ao buscar peça:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Criar nova peça
export const createPart = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      internalCode,
      barcode,
      name,
      description,
      category = 'PARTS',
      subcategory,
      brand,
      model,
      unit = 'UN',
      costPrice = 0,
      salePrice = 0,
      profitMargin = 0,
      stock = 0,
      minStock = 0,
      maxStock,
      reorderPoint,
      location,
      mainSupplier,
      alternativeSuppliers,
      expiryDate,
      observations,
    } = req.body;

    // Validações básicas
    if (!name) {
      res.status(400).json({
        success: false,
        error: 'Nome da peça é obrigatório',
      });
      return;
    }

    // Verificar códigos únicos
    if (internalCode) {
      const existingByCode = await prisma.part.findUnique({
        where: { internalCode },
      });
      
      if (existingByCode) {
        res.status(400).json({
          success: false,
          error: 'Código interno já existe',
        });
        return;
      }
    }

    if (barcode) {
      const existingByBarcode = await prisma.part.findUnique({
        where: { barcode },
      });
      
      if (existingByBarcode) {
        res.status(400).json({
          success: false,
          error: 'Código de barras já existe',
        });
        return;
      }
    }

    // Calcular margem de lucro se não fornecida
    let calculatedProfitMargin = profitMargin;
    if (costPrice > 0 && salePrice > 0 && profitMargin === 0) {
      calculatedProfitMargin = ((Number(salePrice) - Number(costPrice)) / Number(costPrice)) * 100;
    }

    // Criar peça
    const part = await prisma.part.create({
      data: {
        internalCode,
        barcode,
        name,
        description,
        category,
        subcategory,
        brand,
        model,
        unit,
        price: salePrice, // Compatibilidade
        costPrice: Number(costPrice),
        salePrice: Number(salePrice),
        profitMargin: Number(calculatedProfitMargin),
        stock: Number(stock),
        minStock: Number(minStock),
        maxStock: maxStock ? Number(maxStock) : null,
        reorderPoint: reorderPoint ? Number(reorderPoint) : null,
        location,
        supplier: mainSupplier, // Compatibilidade
        mainSupplier,
        alternativeSuppliers,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        isActive: true, // Compatibilidade
        status: 'ACTIVE',
        observations,
      },
    });

    res.status(201).json({
      success: true,
      data: part,
      message: 'Peça criada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao criar peça:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Atualizar peça
export const updatePart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da peça é obrigatório',
      });
      return;
    }

    // Verificar se peça existe
    const existingPart = await prisma.part.findUnique({
      where: { id },
    });

    if (!existingPart) {
      res.status(404).json({
        success: false,
        error: 'Peça não encontrada',
      });
      return;
    }

    // Verificar códigos únicos se estão sendo alterados
    if (updateData.internalCode && updateData.internalCode !== existingPart.internalCode) {
      const duplicateCode = await prisma.part.findFirst({
        where: {
          internalCode: updateData.internalCode,
          id: { not: id },
        },
      });
      
      if (duplicateCode) {
        res.status(400).json({
          success: false,
          error: 'Código interno já existe',
        });
        return;
      }
    }

    if (updateData.barcode && updateData.barcode !== existingPart.barcode) {
      const duplicateBarcode = await prisma.part.findFirst({
        where: {
          barcode: updateData.barcode,
          id: { not: id },
        },
      });
      
      if (duplicateBarcode) {
        res.status(400).json({
          success: false,
          error: 'Código de barras já existe',
        });
        return;
      }
    }

    // Preparar dados para atualização
    const dataToUpdate: any = { ...updateData };

    // Converter valores numéricos
    ['costPrice', 'salePrice', 'profitMargin', 'stock', 'minStock', 'maxStock', 'reorderPoint'].forEach(field => {
      if (dataToUpdate[field] !== undefined) {
        dataToUpdate[field] = dataToUpdate[field] ? Number(dataToUpdate[field]) : null;
      }
    });

    // Converter data de validade
    if (dataToUpdate.expiryDate) {
      dataToUpdate.expiryDate = new Date(dataToUpdate.expiryDate);
    }

    // Manter compatibilidade
    if (dataToUpdate.salePrice !== undefined) {
      dataToUpdate.price = dataToUpdate.salePrice;
    }
    if (dataToUpdate.mainSupplier !== undefined) {
      dataToUpdate.supplier = dataToUpdate.mainSupplier;
    }
    if (dataToUpdate.status !== undefined) {
      dataToUpdate.isActive = dataToUpdate.status === 'ACTIVE';
    }

    // Atualizar peça
    const part = await prisma.part.update({
      where: { id },
      data: dataToUpdate,
    });

    res.json({
      success: true,
      data: part,
      message: 'Peça atualizada com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar peça:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Atualizar estoque
export const updateStock = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { quantity, operation, reason } = req.body;

    if (!id || !quantity || !operation) {
      res.status(400).json({
        success: false,
        error: 'ID, quantidade e operação são obrigatórios',
      });
      return;
    }

    // Verificar se peça existe
    const existingPart = await prisma.part.findUnique({
      where: { id },
    });

    if (!existingPart) {
      res.status(404).json({
        success: false,
        error: 'Peça não encontrada',
      });
      return;
    }

    let newStock = existingPart.stock;
    
    if (operation === 'ADD') {
      newStock += Number(quantity);
    } else if (operation === 'SUBTRACT') {
      newStock -= Number(quantity);
      
      if (newStock < 0) {
        res.status(400).json({
          success: false,
          error: 'Estoque não pode ficar negativo',
        });
        return;
      }
    } else {
      res.status(400).json({
        success: false,
        error: 'Operação deve ser ADD ou SUBTRACT',
      });
      return;
    }

    // Atualizar estoque
    const part = await prisma.part.update({
      where: { id },
      data: { stock: newStock },
    });

    res.json({
      success: true,
      data: {
        ...part,
        previousStock: existingPart.stock,
        operation,
        quantity: Number(quantity),
        reason,
      },
      message: `Estoque ${operation === 'ADD' ? 'adicionado' : 'subtraído'} com sucesso`,
    });
  } catch (error) {
    console.error('Erro ao atualizar estoque:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

// Excluir peça
export const deletePart = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID da peça é obrigatório',
      });
      return;
    }

    // Verificar se peça existe
    const existingPart = await prisma.part.findUnique({
      where: { id },
      include: {
        serviceOrders: true,
      },
    });

    if (!existingPart) {
      res.status(404).json({
        success: false,
        error: 'Peça não encontrada',
      });
      return;
    }

    // Verificar se tem ordens de serviço vinculadas
    if (existingPart.serviceOrders.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Não é possível excluir peça vinculada a ordens de serviço',
      });
      return;
    }

    // Excluir peça
    await prisma.part.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Peça excluída com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir peça:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};
