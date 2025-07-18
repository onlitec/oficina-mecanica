import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário administrador
  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@oficina.com' },
    update: {},
    create: {
      email: 'admin@oficina.com',
      name: 'Administrador',
      password: hashedPassword,
      role: 'ADMIN',
    },
  });

  console.log('✅ Usuário administrador criado:', admin.email);

  // Criar usuário mecânico
  const mechanic = await prisma.user.upsert({
    where: { email: 'mecanico@oficina.com' },
    update: {},
    create: {
      email: 'mecanico@oficina.com',
      name: 'João Mecânico',
      password: await bcrypt.hash('mecanico123', 10),
      role: 'MECHANIC',
    },
  });

  console.log('✅ Usuário mecânico criado:', mechanic.email);

  // Criar cliente exemplo
  const customer = await prisma.customer.upsert({
    where: { email: 'cliente@email.com' },
    update: {},
    create: {
      name: 'Maria Silva',
      email: 'cliente@email.com',
      phone: '(11) 99999-9999',
      address: 'Rua das Flores, 123 - São Paulo, SP',
      cpfCnpj: '123.456.789-00',
    },
  });

  console.log('✅ Cliente exemplo criado:', customer.name);

  // Criar veículo exemplo
  const vehicle = await prisma.vehicle.upsert({
    where: { plate: 'ABC-1234' },
    update: {},
    create: {
      plate: 'ABC-1234',
      brand: 'Toyota',
      model: 'Corolla',
      year: 2020,
      color: 'Prata',
      chassisNumber: '9BWZZZ377VT004251',
      customerId: customer.id,
    },
  });

  console.log('✅ Veículo exemplo criado:', vehicle.plate);

  // Criar serviços exemplo
  const services = await Promise.all([
    prisma.service.upsert({
      where: { id: 'service-1' },
      update: {},
      create: {
        id: 'service-1',
        name: 'Troca de Óleo',
        description: 'Troca de óleo do motor e filtro',
        price: 80.00,
        category: 'Manutenção',
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-2' },
      update: {},
      create: {
        id: 'service-2',
        name: 'Alinhamento e Balanceamento',
        description: 'Alinhamento e balanceamento das rodas',
        price: 120.00,
        category: 'Suspensão',
      },
    }),
    prisma.service.upsert({
      where: { id: 'service-3' },
      update: {},
      create: {
        id: 'service-3',
        name: 'Revisão Completa',
        description: 'Revisão geral do veículo',
        price: 300.00,
        category: 'Revisão',
      },
    }),
  ]);

  console.log('✅ Serviços exemplo criados:', services.length);

  // Criar peças exemplo
  const parts = await Promise.all([
    prisma.part.upsert({
      where: { id: 'part-1' },
      update: {},
      create: {
        id: 'part-1',
        name: 'Filtro de Óleo',
        description: 'Filtro de óleo do motor',
        price: 25.00,
        stock: 50,
        minStock: 10,
        category: 'Filtros',
        supplier: 'Fornecedor A',
      },
    }),
    prisma.part.upsert({
      where: { id: 'part-2' },
      update: {},
      create: {
        id: 'part-2',
        name: 'Pastilha de Freio',
        description: 'Pastilha de freio dianteira',
        price: 80.00,
        stock: 30,
        minStock: 5,
        category: 'Freios',
        supplier: 'Fornecedor B',
      },
    }),
    prisma.part.upsert({
      where: { id: 'part-3' },
      update: {},
      create: {
        id: 'part-3',
        name: 'Óleo Motor 5W30',
        description: 'Óleo sintético para motor',
        price: 45.00,
        stock: 100,
        minStock: 20,
        category: 'Lubrificantes',
        supplier: 'Fornecedor C',
      },
    }),
  ]);

  console.log('✅ Peças exemplo criadas:', parts.length);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📋 Dados criados:');
  console.log('- 2 usuários (admin@oficina.com / mecanico@oficina.com)');
  console.log('- 1 cliente (Maria Silva)');
  console.log('- 1 veículo (ABC-1234)');
  console.log('- 3 serviços');
  console.log('- 3 peças');
  console.log('\n🔑 Credenciais de acesso:');
  console.log('Admin: admin@oficina.com / admin123');
  console.log('Mecânico: mecanico@oficina.com / mecanico123');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
