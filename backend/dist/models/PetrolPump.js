"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const petrolPumpSchema = new mongoose_1.default.Schema({
    name: {
        type: String,
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
        }
    },
    address: {
        type: String,
        required: true,
    },
    contactNumber: {
        type: String,
        required: true,
    },
    operatingHours: {
        open: String,
        close: String,
        is24Hours: {
            type: Boolean,
            default: false,
        }
    },
    fuelTypes: [{
            type: {
                type: String,
                enum: ['Regular', 'Premium', 'Diesel', 'Midgrade'],
                required: true,
            },
            price: {
                type: Number,
                required: true,
            },
            available: {
                type: Boolean,
                default: true,
            }
        }],
    userId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    ratings: [{
            userId: {
                type: mongoose_1.default.Schema.Types.ObjectId,
                ref: 'User',
            },
            rating: Number,
            comment: String,
            date: {
                type: Date,
                default: Date.now,
            }
        }],
    averageRating: {
        type: Number,
        default: 0,
    }
});
// Add geospatial index for location-based queries
petrolPumpSchema.index({ location: '2dsphere' });
exports.default = mongoose_1.default.models.PetrolPump || mongoose_1.default.model('PetrolPump', petrolPumpSchema);
