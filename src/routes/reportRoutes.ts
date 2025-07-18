import { Router } from 'express';
import { 
  getPartsConsumptionReport,
  getLowStockReport,
  getStockMovementReport,
  getStockValueReport,
  getPartsDashboard
} from '../controllers/reportController';

const router = Router();

// GET /api/reports/parts/consumption - Relatório de consumo de peças
router.get('/parts/consumption', getPartsConsumptionReport);

// GET /api/reports/parts/low-stock - Relatório de estoque baixo
router.get('/parts/low-stock', getLowStockReport);

// GET /api/reports/parts/movement - Relatório de movimentação de estoque
router.get('/parts/movement', getStockMovementReport);

// GET /api/reports/parts/value - Relatório de valor de estoque
router.get('/parts/value', getStockValueReport);

// GET /api/reports/parts/dashboard - Dashboard geral de peças
router.get('/parts/dashboard', getPartsDashboard);

export default router;
