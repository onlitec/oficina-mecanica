import { Router } from 'express';
import { getUsers, getUserById } from '../controllers/userController';

const router = Router();

// GET /api/users - Listar todos os usuários
router.get('/', getUsers);

// GET /api/users/:id - Buscar usuário por ID
router.get('/:id', getUserById);

export default router;
