"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authController_1 = require("../controllers/authController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const upload = (0, multer_1.default)({ dest: 'uploads/' });
router.post('/otp/send', authController_1.sendOTP);
router.post('/otp/verify', authController_1.verifyOTP);
router.post('/signup', authController_1.signup);
router.post('/change-mobile', auth_1.authenticateToken, authController_1.changeMobileNumber);
router.put('/update-info', auth_1.authenticateToken, authController_1.updateUserInfo);
router.post('/upload-photo', auth_1.authenticateToken, upload.single('profilePhoto'), authController_1.uploadProfilePhoto);
exports.default = router;
