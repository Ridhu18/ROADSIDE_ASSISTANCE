import { Request, Response } from 'express';
import User from '../models/User';

export const updateLocation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { latitude, longitude, accuracy, timestamp, address, service } = req.body;

    // Update user's location
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          currentLocation: {
            type: 'Point',
            coordinates: [longitude, latitude],
            accuracy,
            timestamp,
            address,
            service
          },
          lastLocationUpdate: new Date()
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'Location updated successfully',
      location: updatedUser.currentLocation
    });
  } catch (error) {
    console.error('Error in updateLocation:', error);
    res.status(500).json({ error: 'Failed to update location' });
  }
}; 