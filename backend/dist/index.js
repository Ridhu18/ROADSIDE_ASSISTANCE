"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = require("./config/db");
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const vehicleRoutes_1 = __importDefault(require("./routes/vehicleRoutes"));
const emergencyContactRoutes_1 = __importDefault(require("./routes/emergencyContactRoutes"));
const path_1 = __importDefault(require("path"));
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5000;
// CORS configuration
app.use((0, cors_1.default)({
    origin: ['http://localhost:3000', 'http://192.168.72.4:3000'],
    credentials: true
}));
// Middleware
app.use(express_1.default.json());
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/vehicles', vehicleRoutes_1.default);
app.use('/api/emergency-contacts', emergencyContactRoutes_1.default);
// Connect to MongoDB
(0, db_1.connectDB)();
// Start server
app.listen(5000, '0.0.0.0', () => {
    console.log('Server is running on port 5000');
});
