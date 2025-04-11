import { Request, Response } from 'express';
import MechanicRequest from '../models/MechanicRequest';
import User from '../models/User';
import Mechanic from '../models/Mechanic';
import { io } from '../server'; // Make sure to export io from server.ts

// Get active request for a user
export const getActiveRequest = async (req: Request, res: Response) => {
  try {
    console.log('Getting active request for user:', req.user?._id);
    
    const userId = req.user?._id;
    if (!userId) {
      console.log('No user ID found in request');
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find the most recent non-completed request for this user
    const activeRequest = await MechanicRequest.findOne({
      userId,
      status: { $nin: ['Completed', 'Cancelled'] }
    })
    .populate('mechanicId', 'name contactNumber location')
    .sort({ createdAt: -1 });

    console.log('Active request found:', activeRequest ? 'yes' : 'no');

    if (!activeRequest) {
      return res.status(404).json({ error: 'No active request found' });
    }

    // Get vehicle details from user's vehicles array
    const user = await User.findById(userId);
    const vehicle = user?.vehicles.id(activeRequest.vehicleId);

    if (!vehicle) {
      console.log('Vehicle not found for request:', activeRequest._id);
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Format the response
    const request = {
      _id: activeRequest._id,
      mechanicId: activeRequest.mechanicId._id,
      vehicleId: vehicle._id,
      serviceType: activeRequest.serviceType,
      description: activeRequest.description,
      status: activeRequest.status,
      estimatedPrice: activeRequest.estimatedPrice,
      estimatedArrivalTime: activeRequest.estimatedArrivalTime,
      mechanic: {
        name: activeRequest.mechanicId.name,
        contactNumber: activeRequest.mechanicId.contactNumber,
        location: activeRequest.mechanicId.location
      },
      vehicle: {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year
      },
      location: activeRequest.location
    };

    console.log('Sending response:', request);
    res.json({ request });
  } catch (error) {
    console.error('Error in getActiveRequest:', error);
    res.status(500).json({ error: 'Failed to fetch active request' });
  }
};

// Get pending requests for a mechanic
export const getMechanicPendingRequests = async (req: Request, res: Response) => {
  try {
    const mechanicId = req.user?._id;
    if (!mechanicId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const pendingRequests = await MechanicRequest.find({
      mechanicId,
      status: { $in: ['Pending', 'Accepted', 'OnTheWay', 'InProgress'] }
    })
    .populate('userId', 'name mobileNumber currentLocation')
    .sort({ createdAt: -1 });

    // Format and include vehicle details for each request
    const requests = await Promise.all(pendingRequests.map(async (request) => {
      const user = await User.findById(request.userId);
      const vehicle = user?.vehicles.id(request.vehicleId);

      return {
        _id: request._id,
        user: {
          name: request.userId.name,
          contactNumber: request.userId.mobileNumber,
          location: request.userId.currentLocation
        },
        vehicle: vehicle ? {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year
        } : null,
        serviceType: request.serviceType,
        description: request.description,
        status: request.status,
        estimatedPrice: request.estimatedPrice,
        location: request.location,
        createdAt: request.createdAt
      };
    }));

    res.json({ requests });
  } catch (error) {
    console.error('Error fetching pending requests:', error);
    res.status(500).json({ error: 'Failed to fetch pending requests' });
  }
};

// Update request status
export const updateRequestStatus = async (req: Request, res: Response) => {
  try {
    const { requestId } = req.params;
    const { status, estimatedArrivalTime } = req.body;
    const mechanicId = req.user?._id;

    if (!mechanicId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const validStatuses = ['Accepted', 'OnTheWay', 'InProgress', 'Completed', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const request = await MechanicRequest.findOne({
      _id: requestId,
      mechanicId
    }).populate('userId mechanicId');

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Update the request
    request.status = status;
    if (estimatedArrivalTime) {
      request.estimatedArrivalTime = new Date(estimatedArrivalTime);
    }

    await request.save();

    // Get vehicle details for the response
    const user = await User.findById(request.userId);
    const vehicle = user?.vehicles.id(request.vehicleId);

    // Format the response data
    const requestData = {
      _id: request._id,
      status: request.status,
      estimatedArrivalTime: request.estimatedArrivalTime,
      mechanic: {
        name: request.mechanicId.name,
        contactNumber: request.mechanicId.contactNumber,
        location: request.mechanicId.location
      },
      vehicle: vehicle ? {
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year
      } : null,
      serviceType: request.serviceType,
      description: request.description,
      location: request.location,
      estimatedPrice: request.estimatedPrice
    };

    // Emit WebSocket events
    io.to(`user:${request.userId}`).emit('requestUpdated', requestData);
    io.to(`mechanic:${mechanicId}`).emit('requestUpdated', requestData);

    res.json({ message: 'Request status updated successfully', request: requestData });
  } catch (error) {
    console.error('Error updating request status:', error);
    res.status(500).json({ error: 'Failed to update request status' });
  }
}; 