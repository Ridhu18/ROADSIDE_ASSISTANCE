import express from 'express';
import { sendOTP, verifyOTP, signup, changeMobileNumber, updateUserInfo, uploadProfilePhoto } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';
import multer from 'multer';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Debug middleware
router.use((req, res, next) => {
  console.log(`Auth Route: ${req.method} ${req.url}`);
  console.log('Request body:', req.body);
  next();
});

router.post('/otp/send', sendOTP);
router.post('/otp/verify', verifyOTP);
router.post('/signup', signup);
router.post('/change-mobile', authenticateToken, changeMobileNumber);
router.put('/update-info', authenticateToken, updateUserInfo);
router.post('/upload-photo', authenticateToken, upload.single('profilePhoto'), uploadProfilePhoto);

export default router; 