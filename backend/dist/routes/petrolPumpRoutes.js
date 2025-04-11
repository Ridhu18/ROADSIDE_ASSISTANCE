"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const auth_1 = require("../middleware/auth");
const petrolPumpController_1 = require("../controllers/petrolPumpController");
const router = express_1.default.Router();
// Public routes
router.get('/nearby', petrolPumpController_1.getNearbyPetrolPumps);
// Protected routes
router.use(auth_1.authenticateToken);
// Petrol pump management
router.post('/info', petrolPumpController_1.updatePetrolPumpInfo);
router.get('/requests', petrolPumpController_1.getPetrolPumpRequests);
router.patch('/requests/:requestId/status', petrolPumpController_1.updateFuelRequestStatus);
// Fuel requests
router.post('/fuel-request', petrolPumpController_1.createFuelRequest);
router.get('/fuel-requests', petrolPumpController_1.getUserFuelRequests);
exports.default = router;
