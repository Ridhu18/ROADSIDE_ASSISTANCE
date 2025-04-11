import express from 'express';
import { updateLocation } from '../controllers/locationController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Protected routes (require authentication)
router.post('/update', authenticateToken, updateLocation);

export default router; 