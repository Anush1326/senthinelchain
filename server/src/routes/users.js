import express from 'express';
import {
  listUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  getRolesAndPermissions,
  updateRolePermissions,
  getCases,
  createCase,
  updateCase,
  deleteCase
} from '../controllers/userController.js';
import { optionalProtect } from '../middleware/auth.js';

const router = express.Router();

router.use(optionalProtect);

// Role permissions matrix
router.get('/permissions', getRolesAndPermissions);
router.put('/permissions', updateRolePermissions);

// Case management
router.get('/cases', getCases);
router.post('/cases', createCase);
router.put('/cases/:id', updateCase);
router.delete('/cases/:id', deleteCase);

// User management CRUD
router.route('/')
  .get(listUsers)
  .post(createUser);

router.route('/:id')
  .get(getUserById)
  .put(updateUser)
  .delete(deleteUser);

export default router;
