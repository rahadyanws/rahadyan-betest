import express from 'express';
import {
  getUsers,
  getUserById,
  addUser,
  getAccountNumber,
  getIdentityNumber,
  editUser,
  deleteUser,
  login
} from '../controllers/userController.js';
import { verifyToken } from '../middleware/verifyToken.js';
import { refreshToken } from '../controllers/refreshTokenController.js';

const router = express.Router();

router.get('/', verifyToken, getUsers);
router.get('/:id', verifyToken, getUserById);
router.get('/account-number/:accountNumber', verifyToken, getAccountNumber);
router.get('/identity-number/:identityNumber', verifyToken, getIdentityNumber);
router.get('/refresh/token', refreshToken);

router.post('/', addUser);
router.post('/login', login);

router.patch('/:id', verifyToken, editUser);

router.delete('/:id', verifyToken, deleteUser);

export default router;
