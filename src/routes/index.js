import express from 'express';
import authRoutes from '../modul/auth/route.js';

const router = express.Router();

// Mount all module routes
router.use('/auth', authRoutes);

export default router;

