import { Request, Response } from 'express';
import User from '../models/User';
import mongoose, { Document, Types } from 'mongoose';

// Define the Vehicle interface to match the Mongoose schema
interface Vehicle {
  _id: Types.ObjectId;
  model: string;
  make: string;
  year: string;
  color: string;
  licensePlate: string;
  isPrimary: boolean;
}

interface UserDocument extends Document {
  vehicles: Types.DocumentArray<Vehicle>;
}

interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    _id: string;
    mobileNumber: string;
  };
}

// Get all vehicles for a user
export const getVehicles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.json(user.vehicles);
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Add a new vehicle
export const addVehicle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { model, make, year, color, licensePlate, isPrimary = false } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if license plate already exists
    const existingVehicle = user.vehicles.find(v => v.licensePlate === licensePlate);
    if (existingVehicle) {
      return res.status(400).json({ error: 'Vehicle with this license plate already exists' });
    }

    // If this is the first vehicle or isPrimary is true, set all other vehicles to non-primary
    if (isPrimary || user.vehicles.length === 0) {
      user.vehicles.forEach(vehicle => {
        vehicle.isPrimary = false;
      });
    }

    // Add new vehicle
    user.vehicles.push({
      model,
      make,
      year,
      color,
      licensePlate,
      isPrimary: isPrimary || user.vehicles.length === 0 // First vehicle is automatically primary
    });

    await user.save();

    res.json({
      message: 'Vehicle added successfully',
      vehicles: user.vehicles
    });
  } catch (error) {
    console.error('Error in addVehicle:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to add vehicle',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update a vehicle
export const updateVehicle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { vehicleId } = req.params;
    const { model, make, year, color, licensePlate, isPrimary } = req.body;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find vehicle index
    const vehicleIndex = user.vehicles.findIndex(v => v._id.toString() === vehicleId);
    if (vehicleIndex === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // If setting this vehicle as primary, update other vehicles
    if (isPrimary) {
      user.vehicles.forEach(vehicle => {
        vehicle.isPrimary = false;
      });
    }

    // Update vehicle
    const vehicle = user.vehicles[vehicleIndex];
    if (model) vehicle.model = model;
    if (make) vehicle.make = make;
    if (year) vehicle.year = year;
    if (color) vehicle.color = color;
    if (licensePlate) vehicle.licensePlate = licensePlate;
    if (typeof isPrimary === 'boolean') vehicle.isPrimary = isPrimary;

    await user.save();

    res.json({
      message: 'Vehicle updated successfully',
      vehicles: user.vehicles
    });
  } catch (error) {
    console.error('Error in updateVehicle:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to update vehicle',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Delete a vehicle
export const deleteVehicle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { vehicleId } = req.params;

    // Find user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Find vehicle index
    const vehicleIndex = user.vehicles.findIndex(v => v._id.toString() === vehicleId);
    if (vehicleIndex === -1) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check if deleting primary vehicle
    const wasDeletedVehiclePrimary = user.vehicles[vehicleIndex].isPrimary;

    // Remove vehicle
    user.vehicles.splice(vehicleIndex, 1);

    // If we deleted the primary vehicle and there are other vehicles, make the first one primary
    if (wasDeletedVehiclePrimary && user.vehicles.length > 0) {
      user.vehicles[0].isPrimary = true;
    }

    await user.save();

    res.json({
      message: 'Vehicle deleted successfully',
      vehicles: user.vehicles
    });
  } catch (error) {
    console.error('Error in deleteVehicle:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to delete vehicle',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
}; 