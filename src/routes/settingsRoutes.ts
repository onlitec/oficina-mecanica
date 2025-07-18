import { Router } from 'express';
import { 
  getSystemSettings,
  updateSystemSettings,
  uploadLogo,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} from '../controllers/settingsController';

const router = Router();

// Rotas de configurações do sistema
router.get('/system', getSystemSettings);
router.put('/system', updateSystemSettings);
router.post('/logo', uploadLogo);

// Rotas de gestão de usuários
router.get('/users', getUsers);
router.post('/users', createUser);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

export default router;
