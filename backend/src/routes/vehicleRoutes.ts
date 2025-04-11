import express, { Router } from 'express';
import { getVehicles, addVehicle, updateVehicle, deleteVehicle } from '../controllers/vehicleController';
import { authenticateToken } from '../middleware/auth';

const router: Router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Get all vehicles for the authenticated user
router.get('/', getVehicles);

// Add a new vehicle
router.post('/', addVehicle);

// Update a vehicle
router.put('/:vehicleId', updateVehicle);

// Delete a vehicle
router.delete('/:vehicleId', deleteVehicle);

export default router; 