"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const emergencyContactController_1 = require("../controllers/emergencyContactController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// Get all emergency contacts for the current user
router.get('/', auth_1.authenticateToken, emergencyContactController_1.getEmergencyContacts);
// Add a new emergency contact
router.post('/', auth_1.authenticateToken, emergencyContactController_1.addEmergencyContact);
// Delete an emergency contact
router.delete('/:id', auth_1.authenticateToken, emergencyContactController_1.deleteEmergencyContact);
exports.default = router;
