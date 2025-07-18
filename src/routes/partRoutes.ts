import { Router } from 'express';
import { 
  getParts, 
  getPartById, 
  createPart, 
  updatePart,
  updateStock,
  deletePart 
} from '../controllers/partController';

const router = Router();

// GET /api/parts - Listar todas as peças (com paginação e filtros)
router.get('/', getParts);

// GET /api/parts/:id - Buscar peça por ID
router.get('/:id', getPartById);

// POST /api/parts - Criar nova peça
router.post('/', createPart);

// PUT /api/parts/:id - Atualizar peça
router.put('/:id', updatePart);

// PATCH /api/parts/:id/stock - Atualizar estoque
router.patch('/:id/stock', updateStock);

// DELETE /api/parts/:id - Excluir peça
router.delete('/:id', deletePart);

export default router;
