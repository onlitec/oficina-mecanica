import { Request, Response } from 'express';
import prisma from '../config/database';

// Função para validar CPF
function validateCPF(cpf: string): boolean {
  cpf = cpf.replace(/[^\d]/g, '');
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(cpf.charAt(9))) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = (sum * 10) % 11;
  if (remainder === 10 || remainder === 11) remainder = 0;
  return remainder === parseInt(cpf.charAt(10));
}

// Função para validar CNPJ
function validateCNPJ(cnpj: string): boolean {
  cnpj = cnpj.replace(/[^\d]/g, '');
  if (cnpj.length !== 14) return false;

  // Validação básica do CNPJ
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * (weights1[i] || 0);
  }
  let remainder = sum % 11;
  const digit1 = remainder < 2 ? 0 : 11 - remainder;

  sum = 0;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * (weights2[i] || 0);
  }
  remainder = sum % 11;
  const digit2 = remainder < 2 ? 0 : 11 - remainder;

  return digit1 === parseInt(cnpj.charAt(12)) && digit2 === parseInt(cnpj.charAt(13));
}

export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { page = 1, limit = 10, search, type, status } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const where: any = {};

    // Filtro por busca
    if (search) {
      where.OR = [
        { name: { contains: search as string, mode: 'insensitive' } },
        { email: { contains: search as string, mode: 'insensitive' } },
        { cpfCnpj: { contains: search as string } },
        { phone: { contains: search as string } },
      ];
    }

    // Filtro por tipo
    if (type) {
      where.type = type;
    }

    // Filtro por status
    if (status) {
      where.status = status;
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          vehicles: {
            select: {
              id: true,
              plate: true,
              brand: true,
              model: true,
              year: true,
              status: true,
            },
          },
          _count: {
            select: {
              serviceOrders: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: Number(limit),
      }),
      prisma.customer.count({ where }),
    ]);

    res.json({
      success: true,
      data: customers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    console.error('Erro ao buscar clientes:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const getCustomerById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID do cliente é obrigatório',
      });
      return;
    }

    const customer = await prisma.customer.findUnique({
      where: { id: id },
      include: {
        vehicles: true,
        serviceOrders: {
          include: {
            vehicle: {
              select: {
                plate: true,
                brand: true,
                model: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!customer) {
      res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
      return;
    }

    res.json({
      success: true,
      data: customer,
    });
  } catch (error) {
    console.error('Erro ao buscar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const createCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      name,
      email,
      phone,
      phone2,
      cpfCnpj,
      type,
      rg,
      birthDate,
      companyName,
      fantasyName,
      stateRegistration,
      contactPerson,
      zipCode,
      street,
      number,
      complement,
      neighborhood,
      city,
      state,
      observations,
      vehicles, // Array de veículos
    } = req.body;

    // Validações básicas
    if (!name || !cpfCnpj || !type) {
      res.status(400).json({
        success: false,
        error: 'Nome, CPF/CNPJ e tipo são obrigatórios',
      });
      return;
    }

    // Validar CPF/CNPJ
    const cleanCpfCnpj = cpfCnpj.replace(/[^\d]/g, '');
    if (type === 'INDIVIDUAL' && !validateCPF(cleanCpfCnpj)) {
      res.status(400).json({
        success: false,
        error: 'CPF inválido',
      });
      return;
    }

    if (type === 'COMPANY' && !validateCNPJ(cleanCpfCnpj)) {
      res.status(400).json({
        success: false,
        error: 'CNPJ inválido',
      });
      return;
    }

    // Verificar se CPF/CNPJ já existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { cpfCnpj: cleanCpfCnpj },
    });

    if (existingCustomer) {
      res.status(400).json({
        success: false,
        error: 'CPF/CNPJ já cadastrado',
      });
      return;
    }

    // Validar veículos se fornecidos
    if (vehicles && Array.isArray(vehicles)) {
      for (const vehicle of vehicles) {
        if (vehicle.plate) {
          // Verificar se placa já existe
          const existingVehicle = await prisma.vehicle.findUnique({
            where: { plate: vehicle.plate },
          });

          if (existingVehicle) {
            res.status(400).json({
              success: false,
              error: `Placa ${vehicle.plate} já está cadastrada`,
            });
            return;
          }
        }
      }
    }

    // Criar cliente com veículos em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Criar cliente
      const customer = await tx.customer.create({
        data: {
          name,
          email,
          phone,
          phone2,
          cpfCnpj: cleanCpfCnpj,
          type,
          rg,
          birthDate: birthDate ? new Date(birthDate) : null,
          companyName,
          fantasyName,
          stateRegistration,
          contactPerson,
          zipCode,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          observations,
          status: 'ACTIVE',
        },
      });

      // Criar veículos se fornecidos
      const createdVehicles = [];
      if (vehicles && Array.isArray(vehicles)) {
        for (const vehicleData of vehicles) {
          if (vehicleData.brand && vehicleData.model && vehicleData.year) {
            const vehicle = await tx.vehicle.create({
              data: {
                plate: vehicleData.plate || '',
                brand: vehicleData.brand,
                model: vehicleData.model,
                year: parseInt(vehicleData.year),
                modelYear: vehicleData.modelYear ? parseInt(vehicleData.modelYear) : null,
                color: vehicleData.color || null,
                chassisNumber: vehicleData.chassisNumber || null,
                renavam: vehicleData.renavam || null,
                fuel: vehicleData.fuel || 'FLEX',
                mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : null,
                observations: vehicleData.observations || null,
                customerId: customer.id,
                status: 'ACTIVE',
              },
            });
            createdVehicles.push(vehicle);
          }
        }
      }

      return { customer, vehicles: createdVehicles };
    });

    res.status(201).json({
      success: true,
      data: {
        ...result.customer,
        vehicles: result.vehicles,
      },
      message: `Cliente criado com sucesso${result.vehicles.length > 0 ? ` com ${result.vehicles.length} veículo(s)` : ''}`,
    });
  } catch (error) {
    console.error('Erro ao criar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const updateCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { vehicles, ...updateData } = req.body;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID do cliente é obrigatório',
      });
      return;
    }

    // Verificar se cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
    });

    if (!existingCustomer) {
      res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
      return;
    }

    // Se está atualizando CPF/CNPJ, validar
    if (updateData.cpfCnpj) {
      const cleanCpfCnpj = updateData.cpfCnpj.replace(/[^\d]/g, '');

      if (updateData.type === 'INDIVIDUAL' && !validateCPF(cleanCpfCnpj)) {
        res.status(400).json({
          success: false,
          error: 'CPF inválido',
        });
        return;
      }

      if (updateData.type === 'COMPANY' && !validateCNPJ(cleanCpfCnpj)) {
        res.status(400).json({
          success: false,
          error: 'CNPJ inválido',
        });
        return;
      }

      // Verificar se CPF/CNPJ já existe em outro cliente
      const duplicateCustomer = await prisma.customer.findFirst({
        where: {
          cpfCnpj: cleanCpfCnpj,
          id: { not: id },
        },
      });

      if (duplicateCustomer) {
        res.status(400).json({
          success: false,
          error: 'CPF/CNPJ já cadastrado para outro cliente',
        });
        return;
      }

      updateData.cpfCnpj = cleanCpfCnpj;
    }

    // Converter data de nascimento se fornecida
    if (updateData.birthDate) {
      updateData.birthDate = new Date(updateData.birthDate);
    }

    // Validar veículos se fornecidos
    if (vehicles && Array.isArray(vehicles)) {
      for (const vehicle of vehicles) {
        if (vehicle.plate && vehicle.id !== 'new') {
          // Verificar se placa já existe em outro veículo
          const existingVehicle = await prisma.vehicle.findFirst({
            where: {
              plate: vehicle.plate,
              id: { not: vehicle.id },
              customerId: { not: id },
            },
          });

          if (existingVehicle) {
            res.status(400).json({
              success: false,
              error: `Placa ${vehicle.plate} já está cadastrada para outro cliente`,
            });
            return;
          }
        }
      }
    }

    // Atualizar cliente e veículos em uma transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar cliente
      const customer = await tx.customer.update({
        where: { id },
        data: updateData,
      });

      // Gerenciar veículos se fornecidos
      let updatedVehicles = [];
      if (vehicles && Array.isArray(vehicles)) {
        // Obter veículos atuais do cliente
        const currentVehicles = await tx.vehicle.findMany({
          where: { customerId: id },
        });

        // Processar cada veículo
        for (const vehicleData of vehicles) {
          if (vehicleData.brand && vehicleData.model && vehicleData.year) {
            if (vehicleData.id && vehicleData.id !== 'new') {
              // Atualizar veículo existente
              const vehicle = await tx.vehicle.update({
                where: { id: vehicleData.id },
                data: {
                  plate: vehicleData.plate || '',
                  brand: vehicleData.brand,
                  model: vehicleData.model,
                  year: parseInt(vehicleData.year),
                  modelYear: vehicleData.modelYear ? parseInt(vehicleData.modelYear) : null,
                  color: vehicleData.color || null,
                  chassisNumber: vehicleData.chassisNumber || null,
                  renavam: vehicleData.renavam || null,
                  fuel: vehicleData.fuel || 'FLEX',
                  mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : null,
                  observations: vehicleData.observations || null,
                },
              });
              updatedVehicles.push(vehicle);
            } else {
              // Criar novo veículo
              const vehicle = await tx.vehicle.create({
                data: {
                  plate: vehicleData.plate || '',
                  brand: vehicleData.brand,
                  model: vehicleData.model,
                  year: parseInt(vehicleData.year),
                  modelYear: vehicleData.modelYear ? parseInt(vehicleData.modelYear) : null,
                  color: vehicleData.color || null,
                  chassisNumber: vehicleData.chassisNumber || null,
                  renavam: vehicleData.renavam || null,
                  fuel: vehicleData.fuel || 'FLEX',
                  mileage: vehicleData.mileage ? parseInt(vehicleData.mileage) : null,
                  observations: vehicleData.observations || null,
                  customerId: id,
                  status: 'ACTIVE',
                },
              });
              updatedVehicles.push(vehicle);
            }
          }
        }

        // Remover veículos que não estão mais na lista
        const vehicleIdsToKeep = vehicles
          .filter(v => v.id && v.id !== 'new')
          .map(v => v.id);

        const vehiclesToDelete = currentVehicles.filter(
          v => !vehicleIdsToKeep.includes(v.id)
        );

        for (const vehicle of vehiclesToDelete) {
          await tx.vehicle.delete({ where: { id: vehicle.id } });
        }
      }

      return { customer, vehicles: updatedVehicles };
    });

    // Buscar dados completos para retorno
    const customerWithVehicles = await prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        _count: {
          select: {
            serviceOrders: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: customerWithVehicles,
      message: 'Cliente atualizado com sucesso',
    });
  } catch (error) {
    console.error('Erro ao atualizar cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};

export const deleteCustomer = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    if (!id) {
      res.status(400).json({
        success: false,
        error: 'ID do cliente é obrigatório',
      });
      return;
    }

    // Verificar se cliente existe
    const existingCustomer = await prisma.customer.findUnique({
      where: { id },
      include: {
        vehicles: true,
        serviceOrders: true,
      },
    });

    if (!existingCustomer) {
      res.status(404).json({
        success: false,
        error: 'Cliente não encontrado',
      });
      return;
    }

    // Verificar se tem veículos ou ordens de serviço
    if (existingCustomer.vehicles.length > 0 || existingCustomer.serviceOrders.length > 0) {
      res.status(400).json({
        success: false,
        error: 'Não é possível excluir cliente com veículos ou ordens de serviço cadastradas',
      });
      return;
    }

    // Deletar cliente
    await prisma.customer.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: 'Cliente excluído com sucesso',
    });
  } catch (error) {
    console.error('Erro ao excluir cliente:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor',
    });
  }
};
