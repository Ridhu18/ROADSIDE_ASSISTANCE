"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emergencyController_1 = require("../controllers/emergencyController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Create new emergency request
router.post('/', auth_1.authenticateToken, emergencyController_1.createEmergency);
// Update emergency status
router.put('/:id/status', auth_1.authenticateToken, emergencyController_1.updateEmergencyStatus);
// Get emergency details
router.get('/:id', auth_1.authenticateToken, emergencyController_1.getEmergencyDetails);
// Cancel emergency
router.delete('/:id', auth_1.authenticateToken, emergencyController_1.cancelEmergency);
exports.default = router;
