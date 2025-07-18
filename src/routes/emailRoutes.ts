import { Router } from 'express';
import {
  sendInvoiceEmail,
  sendQuoteEmail,
  sendDueInvoiceAlerts,
  configureEmail,
  testEmailConfig,
  getEmailConfig
} from '../controllers/emailController';

const router = Router();

// POST /api/email/invoice/:invoiceId - Enviar fatura por email
router.post('/invoice/:invoiceId', sendInvoiceEmail);

// POST /api/email/quote/:quoteId - Enviar orçamento por email
router.post('/quote/:quoteId', sendQuoteEmail);

// POST /api/email/alerts/due-invoices - Enviar alertas de faturas vencendo
router.post('/alerts/due-invoices', sendDueInvoiceAlerts);

// POST /api/email/config - Configurar SMTP
router.post('/config', configureEmail);

// GET /api/email/config - Obter configuração atual
router.get('/config', getEmailConfig);

// POST /api/email/test - Testar configuração de email
router.post('/test', testEmailConfig);

export default router;
