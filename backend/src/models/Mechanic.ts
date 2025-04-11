import mongoose, { Schema, Document } from 'mongoose';

export interface IMechanic extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  address: string;
  contactNumber: string;
  specialization: string;
  location: {
    type: string;
    coordinates: number[];
  };
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  services: Array<{
    type: string;
    price: number;
    available: boolean;
  }>;
  rating: number;
  totalReviews: number;
  isActive: boolean;
  profilePhoto?: string;
  completedServices: number;
  activeRequests: number;
}

const mechanicSchema = new Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  specialization: {
    type: String,
    required: true
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  operatingHours: {
    open: {
      type: String,
      default: '09:00'
    },
    close: {
      type: String,
      default: '18:00'
    },
    is24Hours: {
      type: Boolean,
      default: false
    }
  },
  services: [{
    type: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    available: {
      type: Boolean,
      default: true
    }
  }],
  rating: {
    type: Number,
    default: 0
  },
  totalReviews: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  profilePhoto: {
    type: String
  },
  completedServices: {
    type: Number,
    default: 0
  },
  activeRequests: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Create a 2dsphere index on the location field for geospatial queries
mechanicSchema.index({ location: '2dsphere' });

export default mongoose.model<IMechanic>('Mechanic', mechanicSchema); 