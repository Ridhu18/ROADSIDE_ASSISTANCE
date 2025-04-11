"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const vehicleSchema = new mongoose_1.default.Schema({
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
const userSchema = new mongoose_1.default.Schema({
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
    role: {
        type: String,
        enum: ['user', 'mechanic', 'petrolpump', 'hospital'],
        default: 'user',
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
exports.default = mongoose_1.default.models.User || mongoose_1.default.model('User', userSchema);
