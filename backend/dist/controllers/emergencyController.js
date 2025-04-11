"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelEmergency = exports.getEmergencyDetails = exports.updateEmergencyStatus = exports.createEmergency = void 0;
const Emergency_1 = __importDefault(require("../models/Emergency"));
const User_1 = __importDefault(require("../models/User"));
const notificationService_1 = require("../services/notificationService");
const createEmergency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { type, location, description, coordinates } = req.body;
        const userId = req.user.userId;
        // Create new emergency
        const emergency = new Emergency_1.default({
            user: userId,
            type,
            location,
            description,
            coordinates,
            status: 'pending',
            createdAt: new Date()
        });
        yield emergency.save();
        // Find nearby service providers based on emergency type
        const serviceProviders = yield User_1.default.find({
            role: getServiceProviderRole(type),
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: coordinates
                    },
                    $maxDistance: 10000 // 10km radius
                }
            }
        });
        // Send notifications to service providers
        for (const provider of serviceProviders) {
            yield (0, notificationService_1.sendNotification)(provider._id, {
                title: 'New Emergency Request',
                body: `Emergency type: ${type} at ${location}`,
                data: { emergencyId: emergency._id }
            });
        }
        res.status(201).json({
            message: "Emergency request created successfully",
            emergency: {
                id: emergency._id,
                type: emergency.type,
                location: emergency.location,
                status: emergency.status,
                createdAt: emergency.createdAt
            }
        });
    }
    catch (error) {
        console.error("Error creating emergency:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to create emergency request"
        });
    }
});
exports.createEmergency = createEmergency;
const updateEmergencyStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const userId = req.user.userId;
        const emergency = yield Emergency_1.default.findById(id);
        if (!emergency) {
            return res.status(404).json({ error: "Emergency request not found" });
        }
        if (emergency.user.toString() !== userId) {
            return res.status(403).json({ error: "Not authorized to update this emergency" });
        }
        emergency.status = status;
        yield emergency.save();
        res.json({
            message: "Emergency status updated successfully",
            emergency: {
                id: emergency._id,
                status: emergency.status
            }
        });
    }
    catch (error) {
        console.error("Error updating emergency status:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update emergency status"
        });
    }
});
exports.updateEmergencyStatus = updateEmergencyStatus;
const getEmergencyDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const emergency = yield Emergency_1.default.findById(id).populate('user', 'name mobileNumber');
        if (!emergency) {
            return res.status(404).json({ error: "Emergency request not found" });
        }
        if (emergency.user._id.toString() !== userId) {
            return res.status(403).json({ error: "Not authorized to view this emergency" });
        }
        res.json({
            emergency: {
                id: emergency._id,
                type: emergency.type,
                location: emergency.location,
                description: emergency.description,
                status: emergency.status,
                createdAt: emergency.createdAt,
                user: {
                    name: emergency.user.name,
                    mobileNumber: emergency.user.mobileNumber
                }
            }
        });
    }
    catch (error) {
        console.error("Error getting emergency details:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get emergency details"
        });
    }
});
exports.getEmergencyDetails = getEmergencyDetails;
const cancelEmergency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const userId = req.user.userId;
        const emergency = yield Emergency_1.default.findById(id);
        if (!emergency) {
            return res.status(404).json({ error: "Emergency request not found" });
        }
        if (emergency.user.toString() !== userId) {
            return res.status(403).json({ error: "Not authorized to cancel this emergency" });
        }
        emergency.status = 'cancelled';
        yield emergency.save();
        res.json({
            message: "Emergency request cancelled successfully"
        });
    }
    catch (error) {
        console.error("Error cancelling emergency:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to cancel emergency request"
        });
    }
});
exports.cancelEmergency = cancelEmergency;
function getServiceProviderRole(emergencyType) {
    switch (emergencyType) {
        case 'medical':
            return 'hospital';
        case 'mechanical':
            return 'mechanic';
        case 'fuel':
            return 'petrolpump';
        default:
            return 'mechanic';
    }
}
