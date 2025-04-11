import mongoose from 'mongoose';

const mechanicRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  mechanicId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mechanic',
    required: true,
  },
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],  // [longitude, latitude]
      required: true,
    },
    address: String
  },
  serviceType: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  estimatedPrice: {
    type: Number,
    required: true,
  },
  actualPrice: {
    type: Number,
  },
  scheduledTime: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['Pending', 'Accepted', 'OnTheWay', 'InProgress', 'Completed', 'Cancelled', 'Rejected'],
    default: 'Pending',
  },
  estimatedArrivalTime: {
    type: Date,
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending',
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
  },
  review: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  }
});

// Update the updatedAt field on every save
mechanicRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.MechanicRequest || mongoose.model('MechanicRequest', mechanicRequestSchema); 