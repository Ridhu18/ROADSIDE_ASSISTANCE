import { Request, Response } from 'express';
import PetrolPump from '../models/PetrolPump';
import FuelRequest from '../models/FuelRequest';

// Get petrol pump info
export const getPetrolPumpInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const petrolPump = await PetrolPump.findOne({ userId });
    if (!petrolPump) {
      return res.status(404).json({ error: 'Petrol pump not found' });
    }

    res.json({ petrolPump });
  } catch (error) {
    console.error('Error in getPetrolPumpInfo:', error);
    res.status(500).json({ error: 'Failed to fetch petrol pump info' });
  }
};

// Update petrol pump information
export const updatePetrolPumpInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, location, address, contactNumber, operatingHours, fuelTypes } = req.body;

    // Find existing petrol pump or create new one
    let petrolPump = await PetrolPump.findOne({ userId });
    
    if (petrolPump) {
      // Update existing petrol pump
      petrolPump.name = name;
      petrolPump.location = location;
      petrolPump.address = address;
      petrolPump.contactNumber = contactNumber;
      petrolPump.operatingHours = operatingHours;
      petrolPump.fuelTypes = fuelTypes;
    } else {
      // Create new petrol pump
      petrolPump = new PetrolPump({
        userId,
        name,
        location,
        address,
        contactNumber,
        operatingHours,
        fuelTypes
      });
    }

    await petrolPump.save();

    res.json({
      message: 'Petrol pump information updated successfully',
      petrolPump
    });
  } catch (error) {
    console.error('Error in updatePetrolPumpInfo:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to update petrol pump information',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Get nearby petrol pumps
export const getNearbyPetrolPumps = async (req: Request, res: Response) => {
  try {
    const { latitude, longitude } = req.query;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    const lat = parseFloat(latitude as string);
    const lng = parseFloat(longitude as string);

    const nearbyPumps = await PetrolPump.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [lng, lat]
          },
          $maxDistance: 5000 // 5km in meters
        }
      },
      isActive: true
    }).select('-__v');

    // Calculate distance for each pump
    const pumpsWithDistance = nearbyPumps.map(pump => {
      const distance = calculateDistance(
        lat,
        lng,
        pump.location.coordinates[1],
        pump.location.coordinates[0]
      );

      return {
        ...pump.toObject(),
        distance: Math.round(distance * 100) / 100
      };
    });

    // Sort by distance
    pumpsWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(pumpsWithDistance);
  } catch (error) {
    console.error('Error in getNearbyPetrolPumps:', error);
    res.status(500).json({ error: 'Failed to find nearby petrol pumps' });
  }
};

// Create fuel request
export const createFuelRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { petrolPumpId, location, fuelType, amount, totalPrice, deliveryMode, scheduledTime } = req.body;

    // Validate petrol pump exists
    const petrolPump = await PetrolPump.findById(petrolPumpId);
    if (!petrolPump) {
      return res.status(404).json({ error: 'Petrol pump not found' });
    }

    const request = new FuelRequest({
      userId,
      petrolPumpId,
      location,
      fuelType,
      amount,
      totalPrice,
      deliveryMode,
      scheduledTime: scheduledTime || undefined,
      status: 'Pending'
    });

    await request.save();

    // Populate user info before sending response
    await request.populate('userId', 'name mobileNumber');

    res.status(201).json({
      message: 'Fuel request created successfully',
      request
    });
  } catch (error) {
    console.error('Error in createFuelRequest:', error);
    res.status(500).json({ error: 'Failed to create fuel request' });
  }
};

// Get petrol pump requests
export const getPetrolPumpRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const petrolPump = await PetrolPump.findOne({ userId });
    if (!petrolPump) {
      return res.status(404).json({ error: 'Petrol pump not found' });
    }

    const requests = await FuelRequest.find({ petrolPumpId: petrolPump._id })
      .populate('userId', 'name mobileNumber')  // Populate user information
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error in getPetrolPumpRequests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

// Update fuel request status
export const updateFuelRequestStatus = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await FuelRequest.findByIdAndUpdate(
      requestId,
      { $set: { status } },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    res.json({ request });
  } catch (error) {
    console.error('Error in updateFuelRequestStatus:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
};

// Get user's fuel requests
export const getUserFuelRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const requests = await FuelRequest.find({ userId })
      .populate('petrolPumpId', 'name address contactNumber')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    console.error('Error in getUserFuelRequests:', error);
    res.status(500).json({ error: 'Failed to fetch requests' });
  }
};

// Helper function to calculate distance between two points in kilometers
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return degrees * (Math.PI / 180);
} 