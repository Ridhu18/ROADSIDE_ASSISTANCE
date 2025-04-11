import express from 'express';
import { authenticateToken } from '../middleware/auth';
import {
  getActiveRequest,
  getMechanicPendingRequests,
  updateRequestStatus
} from '../controllers/mechanicRequestController';

const router = express.Router();

// Debug middleware for this router
router.use((req, res, next) => {
  console.log('MechanicRequest Route:', req.method, req.url);
  next();
});

// User routes
router.get('/active-request', authenticateToken, (req, res) => {
  console.log('Active Request Route Hit');
  getActiveRequest(req, res);
});

// Mechanic routes
router.get('/pending-requests', authenticateToken, getMechanicPendingRequests);
router.put('/:requestId/status', authenticateToken, updateRequestStatus);

export default router; 