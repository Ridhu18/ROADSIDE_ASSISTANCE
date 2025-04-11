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
exports.deleteVehicle = exports.updateVehicle = exports.addVehicle = exports.getVehicles = void 0;
const User_1 = __importDefault(require("../models/User"));
// Get all vehicles for a user
const getVehicles = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const user = yield User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.json(user.vehicles);
    }
    catch (error) {
        console.error('Error fetching vehicles:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getVehicles = getVehicles;
// Add a new vehicle
const addVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { make, model, year, color, licensePlate, isPrimary } = req.body;
        const user = yield User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const newVehicle = {
            make,
            model,
            year,
            color,
            licensePlate,
            isPrimary: isPrimary || false
        };
        // If the new vehicle is primary, set all other vehicles to non-primary
        if (isPrimary) {
            user.vehicles.forEach((vehicle) => {
                vehicle.isPrimary = false;
            });
        }
        user.vehicles.push(newVehicle);
        yield user.save();
        return res.status(201).json(newVehicle);
    }
    catch (error) {
        console.error('Error adding vehicle:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.addVehicle = addVehicle;
// Update a vehicle
const updateVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { vehicleId } = req.params;
        const updates = req.body;
        const user = yield User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const vehicleIndex = (_b = user.vehicles) === null || _b === void 0 ? void 0 : _b.findIndex((v) => v._id.toString() === vehicleId);
        if (vehicleIndex === -1) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        // If updating to primary, set all other vehicles to non-primary
        if (updates.isPrimary) {
            (_c = user.vehicles) === null || _c === void 0 ? void 0 : _c.forEach((vehicle) => {
                vehicle.isPrimary = false;
            });
        }
        user.vehicles[vehicleIndex] = Object.assign(Object.assign({}, user.vehicles[vehicleIndex].toObject()), updates);
        yield user.save();
        return res.json(user.vehicles[vehicleIndex]);
    }
    catch (error) {
        console.error('Error updating vehicle:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.updateVehicle = updateVehicle;
// Delete a vehicle
const deleteVehicle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        if (!((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const { vehicleId } = req.params;
        const user = yield User_1.default.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const vehicleIndex = (_b = user.vehicles) === null || _b === void 0 ? void 0 : _b.findIndex((v) => v._id.toString() === vehicleId);
        if (vehicleIndex === -1) {
            return res.status(404).json({ message: 'Vehicle not found' });
        }
        user.vehicles.splice(vehicleIndex, 1);
        yield user.save();
        return res.json({ message: 'Vehicle deleted successfully' });
    }
    catch (error) {
        console.error('Error deleting vehicle:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});
exports.deleteVehicle = deleteVehicle;
