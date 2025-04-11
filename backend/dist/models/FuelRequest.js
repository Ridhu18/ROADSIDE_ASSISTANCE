"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const fuelRequestSchema = new mongoose_1.default.Schema({
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    petrolPumpId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'PetrolPump',
        required: true,
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            required: true,
        },
        address: String
    },
    fuelType: {
        type: String,
        enum: ['Regular', 'Premium', 'Diesel', 'Midgrade'],
        required: true,
    },
    amount: {
        type: Number, // in liters/gallons
        required: true,
    },
    totalPrice: {
        type: Number,
        required: true,
    },
    deliveryMode: {
        type: String,
        enum: ['Standard', 'Express', 'Scheduled'],
        required: true,
    },
    scheduledTime: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'OnTheWay', 'Delivered', 'Cancelled', 'Rejected'],
        default: 'Pending',
    },
    estimatedDeliveryTime: {
        type: Date,
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Completed', 'Failed'],
        default: 'Pending',
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
fuelRequestSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});
exports.default = mongoose_1.default.models.FuelRequest || mongoose_1.default.model('FuelRequest', fuelRequestSchema);
