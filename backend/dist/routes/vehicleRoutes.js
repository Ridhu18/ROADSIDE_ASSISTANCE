"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const vehicleController_1 = require("../controllers/vehicleController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes require authentication
router.use(auth_1.authenticateToken);
// Get all vehicles for the authenticated user
router.get('/', vehicleController_1.getVehicles);
// Add a new vehicle
router.post('/', vehicleController_1.addVehicle);
// Update a vehicle
router.put('/:vehicleId', vehicleController_1.updateVehicle);
// Delete a vehicle
router.delete('/:vehicleId', vehicleController_1.deleteVehicle);
exports.default = router;
