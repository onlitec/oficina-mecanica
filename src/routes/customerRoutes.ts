import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer
} from '../controllers/customerController';

const router = Router();

// GET /api/customers - Listar todos os clientes (com paginação e filtros)
router.get('/', getCustomers);

// GET /api/customers/:id - Buscar cliente por ID
router.get('/:id', getCustomerById);

// POST /api/customers - Criar novo cliente
router.post('/', createCustomer);

// PUT /api/customers/:id - Atualizar cliente
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Excluir cliente
router.delete('/:id', deleteCustomer);

export default router;
