import { Request, Response } from 'express';
import Emergency from '../models/Emergency';
import User from '../models/User';
import { sendNotification } from '../services/notificationService';

export const createEmergency = async (req: Request, res: Response) => {
  try {
    const { type, location, description, coordinates } = req.body;
    const userId = req.user.userId;

    // Create new emergency
    const emergency = new Emergency({
      user: userId,
      type,
      location,
      description,
      coordinates,
      status: 'pending',
      createdAt: new Date()
    });

    await emergency.save();

    // Find nearby service providers based on emergency type
    const serviceProviders = await User.find({
      role: getServiceProviderRole(type),
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coordinates
          },
          $maxDistance: 10000 // 10km radius
        }
      }
    });

    // Send notifications to service providers
    for (const provider of serviceProviders) {
      await sendNotification(provider._id, {
        title: 'New Emergency Request',
        body: `Emergency type: ${type} at ${location}`,
        data: { emergencyId: emergency._id }
      });
    }

    res.status(201).json({
      message: "Emergency request created successfully",
      emergency: {
        id: emergency._id,
        type: emergency.type,
        location: emergency.location,
        status: emergency.status,
        createdAt: emergency.createdAt
      }
    });
  } catch (error) {
    console.error("Error creating emergency:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to create emergency request"
    });
  }
};

export const updateEmergencyStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    const emergency = await Emergency.findById(id);
    if (!emergency) {
      return res.status(404).json({ error: "Emergency request not found" });
    }

    if (emergency.user.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to update this emergency" });
    }

    emergency.status = status;
    await emergency.save();

    res.json({
      message: "Emergency status updated successfully",
      emergency: {
        id: emergency._id,
        status: emergency.status
      }
    });
  } catch (error) {
    console.error("Error updating emergency status:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to update emergency status"
    });
  }
};

export const getEmergencyDetails = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const emergency = await Emergency.findById(id).populate('user', 'name mobileNumber');
    if (!emergency) {
      return res.status(404).json({ error: "Emergency request not found" });
    }

    if (emergency.user._id.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to view this emergency" });
    }

    res.json({
      emergency: {
        id: emergency._id,
        type: emergency.type,
        location: emergency.location,
        description: emergency.description,
        status: emergency.status,
        createdAt: emergency.createdAt,
        user: {
          name: emergency.user.name,
          mobileNumber: emergency.user.mobileNumber
        }
      }
    });
  } catch (error) {
    console.error("Error getting emergency details:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get emergency details"
    });
  }
};

export const cancelEmergency = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user.userId;

    const emergency = await Emergency.findById(id);
    if (!emergency) {
      return res.status(404).json({ error: "Emergency request not found" });
    }

    if (emergency.user.toString() !== userId) {
      return res.status(403).json({ error: "Not authorized to cancel this emergency" });
    }

    emergency.status = 'cancelled';
    await emergency.save();

    res.json({
      message: "Emergency request cancelled successfully"
    });
  } catch (error) {
    console.error("Error cancelling emergency:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to cancel emergency request"
    });
  }
};

function getServiceProviderRole(emergencyType: string): string {
  switch (emergencyType) {
    case 'medical':
      return 'hospital';
    case 'mechanical':
      return 'mechanic';
    case 'fuel':
      return 'petrolpump';
    default:
      return 'mechanic';
  }
} 