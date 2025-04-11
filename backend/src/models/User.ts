import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  make: {
    type: String,
    required: true,
  },
  model: {
    type: String,
    required: true,
  },
  year: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    required: true,
  },
  licensePlate: {
    type: String,
    required: true,
  },
  isPrimary: {
    type: Boolean,
    default: false,
  },
});

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  mobileNumber: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: false,
    unique: true,
    sparse: true,
  },
  currentLocation: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0]
    },
    accuracy: Number,
    timestamp: Date,
    address: String,
    service: String
  },
  lastLocationUpdate: {
    type: Date,
    default: null
  },
  role: {
    type: String,
    enum: ['user', 'mechanic', 'petrolpump', 'hospital'],
    default: 'user'
  },
  vehicles: [vehicleSchema],
  otp: {
    code: String,
    expiresAt: Date,
  },
  memberSince: {
    type: Date,
    default: Date.now,
  },
  servicesUsed: {
    type: Number,
    default: 0,
  },
  rewardPoints: {
    type: Number,
    default: 0,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a 2dsphere index on the location field
userSchema.index({ 'currentLocation': '2dsphere' });

const User = mongoose.model('User', userSchema);

export default User; 