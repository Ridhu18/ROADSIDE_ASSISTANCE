import { Request, Response } from 'express';
import Mechanic, { IMechanic } from '../models/Mechanic';
import MechanicRequest from '../models/MechanicRequest';
import User from '../models/User';
import { Types } from 'mongoose';

// Get mechanic info
export const getMechanicInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const mechanic = await Mechanic.findOne({ userId });
    if (!mechanic) {
      return res.status(404).json({ error: 'Mechanic profile not found' });
    }

    res.json({ mechanic });
  } catch (error) {
    console.error('Error in getMechanicInfo:', error);
    res.status(500).json({ error: 'Failed to fetch mechanic info' });
  }
};

// Update mechanic information
export const updateMechanicInfo = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      name, 
      location, 
      address, 
      contactNumber, 
      specialization,
      operatingHours, 
      services,
      isActive,
      profilePhoto
    } = req.body;

    // Find existing mechanic or create new one
    let mechanic = await Mechanic.findOne({ userId });
    
    if (mechanic) {
      // Update existing mechanic
      if (name) mechanic.name = name;
      if (location) mechanic.location = location;
      if (address) mechanic.address = address;
      if (contactNumber) mechanic.contactNumber = contactNumber;
      if (specialization) mechanic.specialization = specialization;
      if (operatingHours) mechanic.operatingHours = operatingHours;
      if (services) mechanic.services = services;
      if (isActive !== undefined) mechanic.isActive = isActive;
      if (profilePhoto) mechanic.profilePhoto = profilePhoto;
    } else {
      // Create new mechanic
      mechanic = new Mechanic({
        userId,
        name,
        location,
        address,
        contactNumber,
        specialization,
        operatingHours,
        services,
        isActive,
        profilePhoto
      });
    }

    await mechanic.save();
    res.json({ mechanic });
  } catch (error) {
    console.error('Error in updateMechanicInfo:', error);
    res.status(500).json({ error: 'Failed to update mechanic info' });
  }
};

// Get nearby mechanics
export const getNearbyMechanics = async (req: Request, res: Response) => {
  try {
    const { longitude, latitude, maxDistance = 10000 } = req.query; // maxDistance in meters

    if (!longitude || !latitude) {
      return res.status(400).json({ error: 'Longitude and latitude are required' });
    }

    const parsedLong = parseFloat(longitude as string);
    const parsedLat = parseFloat(latitude as string);

    // Validate coordinates
    if (isNaN(parsedLong) || isNaN(parsedLat) ||
        parsedLong < -180 || parsedLong > 180 ||
        parsedLat < -90 || parsedLat > 90) {
      return res.status(400).json({ error: 'Invalid coordinates' });
    }

    console.log('Searching for mechanics near:', { longitude: parsedLong, latitude: parsedLat, maxDistance });

    // First, check if there are any mechanics in the database
    const totalMechanics = await Mechanic.countDocuments();
    console.log('Total mechanics in database:', totalMechanics);

    // Check if any mechanics have valid location data
    const mechanicsWithLocation = await Mechanic.countDocuments({
      'location.coordinates': { $exists: true, $type: 'array' }
    });
    console.log('Mechanics with location data:', mechanicsWithLocation);

    const mechanics = await Mechanic.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parsedLong, parsedLat]
          },
          $maxDistance: parseInt(maxDistance as string)
        }
      },
      isActive: true
    }).select('-__v');

    console.log(`Found ${mechanics.length} nearby mechanics`);

    // Log each mechanic's location for debugging
    mechanics.forEach(mechanic => {
      console.log('Mechanic details:', {
        id: mechanic._id,
        name: mechanic.name,
        location: mechanic.location,
        isActive: mechanic.isActive
      });
    });

    res.json({ mechanics });
  } catch (error) {
    console.error('Error in getNearbyMechanics:', error);
    
    // Check if it's a MongoDB error related to the 2dsphere index
    if (error instanceof Error && error.message.includes('2dsphere')) {
      console.error('2dsphere index error - attempting to rebuild index');
      try {
        await Mechanic.collection.createIndex({ location: '2dsphere' });
        console.log('Successfully rebuilt 2dsphere index');
      } catch (indexError) {
        console.error('Failed to rebuild index:', indexError);
      }
    }
    
    res.status(500).json({ 
      error: 'Failed to fetch nearby mechanics',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Create mechanic request
export const createMechanicRequest = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { 
      mechanicId, 
      vehicleId, 
      location, 
      serviceType, 
      description, 
      estimatedPrice,
      scheduledTime 
    } = req.body;

    // Validate required fields
    if (!mechanicId || !vehicleId || !location || !serviceType || !description || !estimatedPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if mechanic exists and is active
    const mechanic = await Mechanic.findById(mechanicId);
    if (!mechanic) {
      return res.status(404).json({ error: 'Mechanic not found' });
    }
    if (!mechanic.isActive) {
      return res.status(400).json({ error: 'Mechanic is not available' });
    }

    // Check if vehicle exists and belongs to user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    const vehicle = user.vehicles.find(v => v._id.toString() === vehicleId);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Create new request
    const mechanicRequest = new MechanicRequest({
      userId,
      mechanicId,
      vehicleId,
      location,
      serviceType,
      description,
      estimatedPrice,
      scheduledTime
    });

    await mechanicRequest.save();
    res.status(201).json({ mechanicRequest });
  } catch (error) {
    console.error('Error in createMechanicRequest:', error);
    res.status(500).json({ error: 'Failed to create mechanic request' });
  }
};

// Get mechanic requests
export const getMechanicRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    console.log('Getting requests for mechanic with userId:', userId);

    const mechanic = await Mechanic.findOne({ userId });
    if (!mechanic) {
      console.log('Mechanic profile not found for userId:', userId);
      return res.status(404).json({ error: 'Mechanic profile not found' });
    }

    console.log('Found mechanic profile:', mechanic._id);

    const { status } = req.query;
    const query: any = { mechanicId: mechanic._id };
    
    if (status) {
      query.status = status;
    }

    console.log('Querying requests with:', query);

    const requests = await MechanicRequest.find(query)
      .populate('userId', 'name mobileNumber')
      .sort({ createdAt: -1 });

    console.log(`Found ${requests.length} requests`);

    res.json(requests);
  } catch (error) {
    console.error('Error in getMechanicRequests:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to fetch mechanic requests',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    });
  }
};

// Update mechanic request status
export const updateMechanicRequestStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { requestId } = req.params;
    const { status, estimatedArrivalTime, actualPrice } = req.body;

    // Validate status
    const validStatuses = ['Pending', 'Accepted', 'OnTheWay', 'InProgress', 'Completed', 'Cancelled', 'Rejected'];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ 
        error: 'Invalid status value',
        message: `Status must be one of: ${validStatuses.join(', ')}`
      });
    }

    console.log('Updating request status:', { requestId, status, userId });

    // Find the request
    const mechanicRequest = await MechanicRequest.findById(requestId);
    if (!mechanicRequest) {
      console.log('Request not found:', requestId);
      return res.status(404).json({ error: 'Request not found' });
    }

    // Find the mechanic
    const mechanic = await Mechanic.findOne({ userId });
    if (!mechanic) {
      console.log('Mechanic not found for userId:', userId);
      return res.status(404).json({ error: 'Mechanic profile not found' });
    }

    // Use a more explicit type assertion to ensure TypeScript recognizes _id
    const mechanicId = mechanic._id as Types.ObjectId;
    if (mechanicRequest.mechanicId.toString() !== mechanicId.toString()) {
      console.log('Authorization mismatch:', {
        requestMechanicId: mechanicRequest.mechanicId,
        currentMechanicId: mechanicId
      });
      return res.status(403).json({ error: 'Not authorized to update this request' });
    }

    // Update mechanic stats based on status
    if (status === 'Completed') {
      mechanic.completedServices = (mechanic.completedServices || 0) + 1;
      mechanic.activeRequests = Math.max((mechanic.activeRequests || 0) - 1, 0);
      await mechanic.save();
    } else if (status === 'Accepted' || status === 'OnTheWay' || status === 'InProgress') {
      // Only increment activeRequests if transitioning from Pending
      if (mechanicRequest.status === 'Pending') {
        mechanic.activeRequests = (mechanic.activeRequests || 0) + 1;
        await mechanic.save();
      }
    } else if ((status === 'Cancelled' || status === 'Rejected') && 
               ['Accepted', 'OnTheWay', 'InProgress'].includes(mechanicRequest.status)) {
      // Decrement activeRequests only if cancelling/rejecting an active request
      mechanic.activeRequests = Math.max((mechanic.activeRequests || 0) - 1, 0);
      await mechanic.save();
    }

    // Update the request status and other fields
    mechanicRequest.status = status;
    if (estimatedArrivalTime) mechanicRequest.estimatedArrivalTime = estimatedArrivalTime;
    if (actualPrice) mechanicRequest.actualPrice = actualPrice;

    await mechanicRequest.save();
    console.log('Request updated successfully:', mechanicRequest);
    
    res.json({ 
      success: true,
      mechanicRequest,
      message: `Request status updated to ${status}`
    });
  } catch (error) {
    console.error('Error in updateMechanicRequestStatus:', error);
    res.status(500).json({ 
      error: 'Failed to update request status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get user mechanic requests
export const getUserMechanicRequests = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // First, get all requests for the user
    const requests = await MechanicRequest.find({ userId })
      .populate('mechanicId', 'name contactNumber specialization rating')
      .sort({ createdAt: -1 });

    // Get the user to access their vehicles
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Map the requests and include vehicle details from user's vehicles array
    const populatedRequests = requests.map(request => {
      const vehicle = user.vehicles.id(request.vehicleId);
      return {
        ...request.toObject(),
        vehicleId: vehicle ? {
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate
        } : null
      };
    });

    res.json({ requests: populatedRequests });
  } catch (error) {
    console.error('Error in getUserMechanicRequests:', error);
    res.status(500).json({ error: 'Failed to fetch user mechanic requests' });
  }
};

// Add review to mechanic request
export const addMechanicReview = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { requestId } = req.params;
    const { rating, review } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Valid rating (1-5) is required' });
    }

    // Find the request
    const mechanicRequest = await MechanicRequest.findById(requestId);
    if (!mechanicRequest) {
      return res.status(404).json({ error: 'Request not found' });
    }

    // Check if the user owns this request
    if (mechanicRequest.userId.toString() !== userId) {
      return res.status(403).json({ error: 'Not authorized to review this request' });
    }

    // Check if the request is completed
    if (mechanicRequest.status !== 'Completed') {
      return res.status(400).json({ error: 'Can only review completed requests' });
    }

    // Update the request with review
    mechanicRequest.rating = rating;
    if (review) mechanicRequest.review = review;

    // Update mechanic rating
    const mechanic = await Mechanic.findById(mechanicRequest.mechanicId);
    if (mechanic) {
      const totalRating = mechanic.rating * mechanic.totalReviews + rating;
      mechanic.totalReviews += 1;
      mechanic.rating = totalRating / mechanic.totalReviews;
      await mechanic.save();
    }

    await mechanicRequest.save();
    res.json({ mechanicRequest });
  } catch (error) {
    console.error('Error in addMechanicReview:', error);
    res.status(500).json({ error: 'Failed to add review' });
  }
};

export const toggleMechanicStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      return res.status(400).json({ error: 'isActive must be a boolean value' });
    }

    // Find mechanic by userId instead of _id
    const mechanic = await Mechanic.findOneAndUpdate(
      { userId },
      { isActive },
      { new: true }
    );

    if (!mechanic) {
      return res.status(404).json({ error: 'Mechanic not found' });
    }

    res.json({ success: true, mechanic });
  } catch (error) {
    console.error('Error toggling mechanic status:', error);
    res.status(500).json({ error: 'Failed to update mechanic status' });
  }
}; 