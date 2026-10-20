import express from 'express';
import { authController } from '../controllers/authController.js';
import { loginLimiter, registerLimiter } from '../middlewares/rateLimiter.js';

const router = express.Router();

router.post('/auth/register', registerLimiter.middleware(), authController.register);
router.post('/auth/login', loginLimiter.middleware(), authController.login);
router.get('/auth/me', authController.me);
router.post('/auth/logout', authController.logout);

// Admin user management
router.get('/auth/users', authController.getUsers);
router.post('/auth/users', authController.createUser);
router.delete('/auth/users/:id', authController.deleteUser);

export default router;
