import { Router } from 'express';
import { 
  getServiceOrders, 
  getServiceOrderById, 
  createServiceOrder, 
  updateServiceOrder,
  updateServiceOrderStatus,
  deleteServiceOrder 
} from '../controllers/serviceOrderController';

const router = Router();

// GET /api/service-orders - Listar todas as ordens de serviço (com paginação e filtros)
router.get('/', getServiceOrders);

// GET /api/service-orders/:id - Buscar ordem de serviço por ID
router.get('/:id', getServiceOrderById);

// POST /api/service-orders - Criar nova ordem de serviço
router.post('/', createServiceOrder);

// PUT /api/service-orders/:id - Atualizar ordem de serviço
router.put('/:id', updateServiceOrder);

// PATCH /api/service-orders/:id/status - Atualizar apenas o status
router.patch('/:id/status', updateServiceOrderStatus);

// DELETE /api/service-orders/:id - Excluir ordem de serviço
router.delete('/:id', deleteServiceOrder);

export default router;
