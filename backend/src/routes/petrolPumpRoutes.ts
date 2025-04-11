import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  updatePetrolPumpInfo,
  getNearbyPetrolPumps,
  createFuelRequest,
  getPetrolPumpRequests,
  updateFuelRequestStatus,
  getUserFuelRequests,
  getPetrolPumpInfo
} from '../controllers/petrolPumpController';

const router = express.Router();

// Public routes
router.get('/nearby', getNearbyPetrolPumps);

// Protected routes
router.use(authenticateToken);

// Petrol pump management
router.get('/info', getPetrolPumpInfo);
router.post('/info', updatePetrolPumpInfo);
router.get('/requests', getPetrolPumpRequests);
router.patch('/requests/:requestId/status', updateFuelRequestStatus);

// Fuel requests
router.post('/fuel-request', createFuelRequest);
router.get('/fuel-requests', getUserFuelRequests);
router.patch('/fuel-request/:requestId', updateFuelRequestStatus);

export default router; 