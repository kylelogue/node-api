import express from 'express';
const router = express.Router();
import * as authController from '../controllers/auth.controller';

router.post('/register', authController.register);

router.post('/login', authController.login);

router.get('/refresh', authController.refresh);

router.get('/logout', authController.logout);

export default router;