import mongoose, { Schema, Document } from 'mongoose';

export interface IPetrolPump extends Document {
  userId: string;
  name: string;
  address: string;
  contactNumber: string;
  location: {
    type: string;
    coordinates: number[];
  };
  operatingHours: {
    open: string;
    close: string;
    is24Hours: boolean;
  };
  fuelTypes: Array<{
    type: string;
    price: number;
    available: boolean;
    stock?: number;
    lowStockThreshold?: number;
  }>;
  isActive: boolean;
}

const petrolPumpSchema = new Schema({
  userId: {
    type: String,
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
  fuelTypes: [{
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
    },
    stock: {
      type: Number,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 1000
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Create a 2dsphere index on the location field for geospatial queries
petrolPumpSchema.index({ location: '2dsphere' });

export default mongoose.model<IPetrolPump>('PetrolPump', petrolPumpSchema); 