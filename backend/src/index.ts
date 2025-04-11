import express from 'express';
import cors from 'cors';
import { connectDB } from './config/db';
import authRoutes from './routes/authRoutes';
import vehicleRoutes from './routes/vehicleRoutes';
import emergencyContactRoutes from './routes/emergencyContactRoutes';
import petrolPumpRoutes from './routes/petrolPumpRoutes';
import mechanicRoutes from './routes/mechanicRoutes';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.72.4:3000'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/emergency-contacts', emergencyContactRoutes);
app.use('/api/petrol-pump', petrolPumpRoutes);
app.use('/api/mechanic', mechanicRoutes);

// Connect to MongoDB
connectDB();

// Start server
app.listen(5000, '0.0.0.0', () => {
  console.log('Server is running on port 5000');
}); 