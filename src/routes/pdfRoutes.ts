import { Router } from 'express';
import {
  generateInvoicePDF,
  generateConsumptionReportPDF,
  generatePartsReportPDF,
  generateQuotePDF
} from '../controllers/pdfController';

const router = Router();

// GET /api/pdf/invoice/:id - Gerar PDF da fatura
router.get('/invoice/:id', generateInvoicePDF);

// GET /api/pdf/quote/:id - Gerar PDF do orçamento
router.get('/quote/:id', generateQuotePDF);

// GET /api/pdf/report/consumption - Gerar PDF do relatório de consumo
router.get('/report/consumption', generateConsumptionReportPDF);

// GET /api/pdf/report/parts - Gerar PDF do relatório de peças
router.get('/report/parts', generatePartsReportPDF);

export default router;
