import { Request, Response } from 'express';
import prisma from '../config/database';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configuração do multer para upload de arquivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `logo${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|svg/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Apenas imagens são permitidas (jpeg, jpg, png, gif, svg)'));
    }
  }
});

// Obter configurações do sistema
export const getSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    // Buscar configurações do sistema (usando uma tabela de configurações)
    let settings = await prisma.systemSettings.findFirst();
    
    if (!settings) {
      // Criar configurações padrão se não existirem
      settings = await prisma.systemSettings.create({
        data: {
          appName: 'Oficina Mecânica',
          appDescription: 'Sistema de Gestão Automotiva',
          logoUrl: null,
          primaryColor: '#667eea',
          secondaryColor: '#764ba2',
          companyName: 'Minha Oficina',
          companyAddress: '',
          companyPhone: '',
          companyEmail: '',
          companyCnpj: '',
          timezone: 'America/Sao_Paulo',
          currency: 'BRL',
          language: 'pt-BR'
        }
      });
    }

    res.json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Erro ao buscar configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar configurações do sistema
export const updateSystemSettings = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      appName,
      appDescription,
      primaryColor,
      secondaryColor,
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyCnpj,
      timezone,
      currency,
      language
    } = req.body;

    // Buscar configurações existentes
    let settings = await prisma.systemSettings.findFirst();

    if (settings) {
      // Atualizar configurações existentes
      settings = await prisma.systemSettings.update({
        where: { id: settings.id },
        data: {
          appName,
          appDescription,
          primaryColor,
          secondaryColor,
          companyName,
          companyAddress,
          companyPhone,
          companyEmail,
          companyCnpj,
          timezone,
          currency,
          language,
          updatedAt: new Date()
        }
      });
    } else {
      // Criar novas configurações
      settings = await prisma.systemSettings.create({
        data: {
          appName,
          appDescription,
          primaryColor,
          secondaryColor,
          companyName,
          companyAddress,
          companyPhone,
          companyEmail,
          companyCnpj,
          timezone,
          currency,
          language
        }
      });
    }

    res.json({
      success: true,
      data: settings,
      message: 'Configurações atualizadas com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar configurações:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Upload de logotipo
export const uploadLogo = [
  upload.single('logo'),
  async (req: Request, res: Response): Promise<void> => {
    try {
      if (!req.file) {
        res.status(400).json({
          success: false,
          error: 'Nenhum arquivo enviado'
        });
        return;
      }

      const logoUrl = `/uploads/${req.file.filename}`;

      // Atualizar URL do logo nas configurações
      let settings = await prisma.systemSettings.findFirst();
      
      if (settings) {
        await prisma.systemSettings.update({
          where: { id: settings.id },
          data: { logoUrl }
        });
      } else {
        await prisma.systemSettings.create({
          data: {
            appName: 'Oficina Mecânica',
            logoUrl
          }
        });
      }

      res.json({
        success: true,
        data: { logoUrl },
        message: 'Logo enviado com sucesso'
      });
    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
      });
    }
  }
];

// Listar usuários
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { name: 'asc' }
    });

    res.json({
      success: true,
      data: users
    });
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Criar usuário
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password, role, active = true } = req.body;

    // Validações
    if (!name || !email || !password || !role) {
      res.status(400).json({
        success: false,
        error: 'Nome, email, senha e função são obrigatórios'
      });
      return;
    }

    // Verificar se email já existe
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        error: 'Email já está em uso'
      });
      return;
    }

    // Hash da senha
    const hashedPassword = await bcrypt.hash(password, 10);

    // Criar usuário
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        active
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true
      }
    });

    res.status(201).json({
      success: true,
      data: user,
      message: 'Usuário criado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Atualizar usuário
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, email, password, role, active } = req.body;

    // Verificar se usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: id as string }
    });

    if (!existingUser) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Verificar se email já está em uso por outro usuário
    if (email && email !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email }
      });

      if (emailInUse) {
        res.status(400).json({
          success: false,
          error: 'Email já está em uso'
        });
        return;
      }
    }

    // Preparar dados para atualização
    const updateData: any = {};
    if (name) updateData.name = name;
    if (email) updateData.email = email;
    if (role) updateData.role = role;
    if (typeof active === 'boolean') updateData.active = active;
    
    // Hash da nova senha se fornecida
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    // Atualizar usuário
    const user = await prisma.user.update({
      where: { id: id as string },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        updatedAt: true
      }
    });

    res.json({
      success: true,
      data: user,
      message: 'Usuário atualizado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};

// Deletar usuário
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({
      where: { id: id as string }
    });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'Usuário não encontrado'
      });
      return;
    }

    // Não permitir deletar o próprio usuário
    // (assumindo que o ID do usuário atual está no token/sessão)
    // Esta verificação pode ser implementada com middleware de autenticação

    // Deletar usuário
    await prisma.user.delete({
      where: { id: id as string }
    });

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });
  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      error: 'Erro interno do servidor'
    });
  }
};
