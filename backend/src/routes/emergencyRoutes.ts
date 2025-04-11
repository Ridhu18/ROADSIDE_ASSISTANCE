import express from 'express';
import { createEmergency, updateEmergencyStatus, getEmergencyDetails, cancelEmergency } from '../controllers/emergencyController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Create new emergency request
router.post('/', authenticateToken, createEmergency);

// Update emergency status
router.put('/:id/status', authenticateToken, updateEmergencyStatus);

// Get emergency details
router.get('/:id', authenticateToken, getEmergencyDetails);

// Cancel emergency
router.delete('/:id', authenticateToken, cancelEmergency);

export default router; 