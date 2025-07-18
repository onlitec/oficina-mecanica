import { Router } from 'express';
import userRoutes from './userRoutes';
import customerRoutes from './customerRoutes';
import serviceOrderRoutes from './serviceOrderRoutes';
import partRoutes from './partRoutes';
import reportRoutes from './reportRoutes';
import financialRoutes from './financialRoutes';
import notificationRoutes from './notificationRoutes';
import pdfRoutes from './pdfRoutes';
import emailRoutes from './emailRoutes';
import quoteRoutes from './quoteRoutes';
import analyticsRoutes from './analyticsRoutes';
import settingsRoutes from './settingsRoutes';

const router = Router();

// Rotas da API
router.use('/users', userRoutes);
router.use('/customers', customerRoutes);
router.use('/service-orders', serviceOrderRoutes);
router.use('/parts', partRoutes);
router.use('/reports', reportRoutes);
router.use('/financial', financialRoutes);
router.use('/notifications', notificationRoutes);
router.use('/pdf', pdfRoutes);
router.use('/email', emailRoutes);
router.use('/quotes', quoteRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/settings', settingsRoutes);

// Rota de informações da API
router.get('/', (req, res) => {
  res.json({
    message: 'API do Sistema de Gestão de Oficina Mecânica',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      api: '/api',
      users: '/api/users',
      customers: '/api/customers',
      serviceOrders: '/api/service-orders',
      parts: '/api/parts',
      reports: '/api/reports',
      financial: '/api/financial',
      notifications: '/api/notifications',
      pdf: '/api/pdf',
      email: '/api/email',
      quotes: '/api/quotes',
      analytics: '/api/analytics',
      settings: '/api/settings',
    },
    database: {
      status: 'connected',
      type: 'SQLite',
    },
  });
});

export default router;
