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
exports.getUserFuelRequests = exports.updateFuelRequestStatus = exports.getPetrolPumpRequests = exports.createFuelRequest = exports.getNearbyPetrolPumps = exports.updatePetrolPumpInfo = void 0;
const PetrolPump_1 = __importDefault(require("../models/PetrolPump"));
const FuelRequest_1 = __importDefault(require("../models/FuelRequest"));
// Create or update petrol pump information
const updatePetrolPumpInfo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { name, location, address, contactNumber, operatingHours, fuelTypes } = req.body;
        let petrolPump = yield PetrolPump_1.default.findOne({ userId });
        if (petrolPump) {
            // Update existing petrol pump
            petrolPump.name = name;
            petrolPump.location = location;
            petrolPump.address = address;
            petrolPump.contactNumber = contactNumber;
            petrolPump.operatingHours = operatingHours;
            petrolPump.fuelTypes = fuelTypes;
        }
        else {
            // Create new petrol pump
            petrolPump = new PetrolPump_1.default({
                userId,
                name,
                location,
                address,
                contactNumber,
                operatingHours,
                fuelTypes
            });
        }
        yield petrolPump.save();
        res.json({
            message: "Petrol pump information updated successfully",
            petrolPump
        });
    }
    catch (error) {
        console.error("Error in updatePetrolPumpInfo:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update petrol pump information"
        });
    }
});
exports.updatePetrolPumpInfo = updatePetrolPumpInfo;
// Get nearby petrol pumps
const getNearbyPetrolPumps = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { longitude, latitude, maxDistance = 5000 } = req.query; // maxDistance in meters
        const nearbyPumps = yield PetrolPump_1.default.find({
            location: {
                $near: {
                    $geometry: {
                        type: "Point",
                        coordinates: [Number(longitude), Number(latitude)]
                    },
                    $maxDistance: Number(maxDistance)
                }
            },
            isActive: true
        }).select('-userId');
        res.json(nearbyPumps);
    }
    catch (error) {
        console.error("Error in getNearbyPetrolPumps:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch nearby petrol pumps"
        });
    }
});
exports.getNearbyPetrolPumps = getNearbyPetrolPumps;
// Create fuel delivery request
const createFuelRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { petrolPumpId, location, fuelType, amount, totalPrice, deliveryMode, scheduledTime } = req.body;
        const fuelRequest = new FuelRequest_1.default({
            userId,
            petrolPumpId,
            location,
            fuelType,
            amount,
            totalPrice,
            deliveryMode,
            scheduledTime: scheduledTime || undefined
        });
        yield fuelRequest.save();
        res.status(201).json({
            message: "Fuel delivery request created successfully",
            request: fuelRequest
        });
    }
    catch (error) {
        console.error("Error in createFuelRequest:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to create fuel request"
        });
    }
});
exports.createFuelRequest = createFuelRequest;
// Get fuel requests for petrol pump
const getPetrolPumpRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { status } = req.query;
        const petrolPump = yield PetrolPump_1.default.findOne({ userId });
        if (!petrolPump) {
            return res.status(404).json({ error: "Petrol pump not found" });
        }
        const query = { petrolPumpId: petrolPump._id };
        if (status) {
            query.status = status;
        }
        const requests = yield FuelRequest_1.default.find(query)
            .populate('userId', 'name mobileNumber')
            .sort({ createdAt: -1 });
        res.json(requests);
    }
    catch (error) {
        console.error("Error in getPetrolPumpRequests:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch fuel requests"
        });
    }
});
exports.getPetrolPumpRequests = getPetrolPumpRequests;
// Update fuel request status
const updateFuelRequestStatus = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { requestId } = req.params;
        const { status, estimatedDeliveryTime } = req.body;
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const petrolPump = yield PetrolPump_1.default.findOne({ userId });
        if (!petrolPump) {
            return res.status(404).json({ error: "Petrol pump not found" });
        }
        const fuelRequest = yield FuelRequest_1.default.findOne({
            _id: requestId,
            petrolPumpId: petrolPump._id
        });
        if (!fuelRequest) {
            return res.status(404).json({ error: "Fuel request not found" });
        }
        fuelRequest.status = status;
        if (estimatedDeliveryTime) {
            fuelRequest.estimatedDeliveryTime = new Date(estimatedDeliveryTime);
        }
        yield fuelRequest.save();
        res.json({
            message: "Fuel request status updated successfully",
            request: fuelRequest
        });
    }
    catch (error) {
        console.error("Error in updateFuelRequestStatus:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to update fuel request status"
        });
    }
});
exports.updateFuelRequestStatus = updateFuelRequestStatus;
// Get user's fuel requests
const getUserFuelRequests = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.userId;
        const { status } = req.query;
        const query = { userId };
        if (status) {
            query.status = status;
        }
        const requests = yield FuelRequest_1.default.find(query)
            .populate('petrolPumpId', 'name address contactNumber')
            .sort({ createdAt: -1 });
        res.json(requests);
    }
    catch (error) {
        console.error("Error in getUserFuelRequests:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to fetch user's fuel requests"
        });
    }
});
exports.getUserFuelRequests = getUserFuelRequests;
