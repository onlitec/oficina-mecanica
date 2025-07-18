import { Router } from 'express';
import { 
  getNotifications,
  markAsRead,
  markAllAsRead,
  createNotification,
  checkDueInvoices,
  checkLowStock,
  getNotificationsDashboard
} from '../controllers/notificationController';

const router = Router();

// POST /api/notifications - Criar notificação
router.post('/', createNotification);

// POST /api/notifications/check/invoices - Verificar faturas vencendo
router.post('/check/invoices', checkDueInvoices);

// POST /api/notifications/check/stock - Verificar estoque baixo
router.post('/check/stock', checkLowStock);

// GET /api/notifications/user/:userId - Listar notificações do usuário
router.get('/user/:userId', getNotifications);

// GET /api/notifications/user/:userId/dashboard - Dashboard de notificações
router.get('/user/:userId/dashboard', getNotificationsDashboard);

// PUT /api/notifications/:id/read - Marcar notificação como lida
router.put('/:id/read', markAsRead);

// PUT /api/notifications/user/:userId/read-all - Marcar todas como lidas
router.put('/user/:userId/read-all', markAllAsRead);

export default router;
