import { Router } from 'express';
import { 
  generateInvoice,
  getInvoices,
  getInvoiceById,
  addPayment,
  getFinancialDashboard
} from '../controllers/financialController';

const router = Router();

// POST /api/financial/invoices/generate/:serviceOrderId - Gerar fatura
router.post('/invoices/generate/:serviceOrderId', generateInvoice);

// GET /api/financial/invoices - Listar faturas
router.get('/invoices', getInvoices);

// GET /api/financial/invoices/:id - Obter fatura por ID
router.get('/invoices/:id', getInvoiceById);

// POST /api/financial/invoices/:invoiceId/payments - Registrar pagamento
router.post('/invoices/:invoiceId/payments', addPayment);

// GET /api/financial/dashboard - Dashboard financeiro
router.get('/dashboard', getFinancialDashboard);

export default router;
