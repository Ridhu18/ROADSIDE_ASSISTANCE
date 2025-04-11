import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  updateMechanicInfo,
  getNearbyMechanics,
  createMechanicRequest,
  getMechanicRequests,
  updateMechanicRequestStatus,
  getUserMechanicRequests,
  getMechanicInfo,
  addMechanicReview,
  toggleMechanicStatus
} from '../controllers/mechanicController';

const router = express.Router();

// Debug middleware
router.use((req, res, next) => {
  console.log(`Mechanic Route: ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

// Public routes
router.get('/nearby', getNearbyMechanics);

// Protected routes - require authentication
router.use(authenticateToken);

// Mechanic profile management
router.get('/info', getMechanicInfo);
router.post('/info', updateMechanicInfo);
router.post('/toggle-status', toggleMechanicStatus);

// Mechanic request management
router.get('/requests', getMechanicRequests);
router.post('/requests', createMechanicRequest);
router.patch('/requests/:requestId/status', updateMechanicRequestStatus);
router.get('/user-requests', getUserMechanicRequests);
router.post('/requests/:requestId/review', addMechanicReview);

export default router; 