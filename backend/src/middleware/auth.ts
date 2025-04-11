import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Extend the Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        _id: string;
        mobileNumber: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('Auth middleware called for:', req.method, req.url);
  console.log('Headers:', req.headers);

  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('No token found in request');
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    console.log('Verifying token...');
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      mobileNumber: string;
    };
    
    console.log('Token decoded:', decoded);
    
    // Set both userId and _id to maintain compatibility
    req.user = {
      userId: decoded.userId,
      _id: decoded.userId, // Add _id as an alias for userId
      mobileNumber: decoded.mobileNumber
    };
    
    console.log('User object set:', req.user);
    next();
  } catch (error) {
    console.error('Token verification failed:', error);
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
}; 