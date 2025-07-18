import { Router } from 'express';
import { 
  getQuotes,
  getQuoteById,
  createQuote,
  updateQuote,
  updateQuoteStatus,
  convertToServiceOrder,
  deleteQuote
} from '../controllers/quoteController';

const router = Router();

// GET /api/quotes - Listar orçamentos
router.get('/', getQuotes);

// GET /api/quotes/:id - Obter orçamento por ID
router.get('/:id', getQuoteById);

// POST /api/quotes - Criar orçamento
router.post('/', createQuote);

// PUT /api/quotes/:id - Atualizar orçamento
router.put('/:id', updateQuote);

// PATCH /api/quotes/:id/status - Atualizar status do orçamento
router.patch('/:id/status', updateQuoteStatus);

// POST /api/quotes/:id/convert - Converter orçamento em ordem de serviço
router.post('/:id/convert', convertToServiceOrder);

// DELETE /api/quotes/:id - Deletar orçamento
router.delete('/:id', deleteQuote);

export default router;
