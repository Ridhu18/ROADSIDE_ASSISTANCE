import express from 'express';
import { getEmergencyContacts, addEmergencyContact, deleteEmergencyContact } from '../controllers/emergencyContactController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get all emergency contacts for the current user
router.get('/', authenticateToken, getEmergencyContacts);

// Add a new emergency contact
router.post('/', authenticateToken, addEmergencyContact);

// Delete an emergency contact
router.delete('/:id', authenticateToken, deleteEmergencyContact);

export default router; 