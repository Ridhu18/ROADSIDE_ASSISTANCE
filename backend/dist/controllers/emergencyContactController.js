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
exports.deleteEmergencyContact = exports.addEmergencyContact = exports.getEmergencyContacts = void 0;
const EmergencyContact_1 = __importDefault(require("../models/EmergencyContact"));
const getEmergencyContacts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.userId;
        const contacts = yield EmergencyContact_1.default.find({ user: userId });
        res.json({ contacts });
    }
    catch (error) {
        console.error("Error getting emergency contacts:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to get emergency contacts"
        });
    }
});
exports.getEmergencyContacts = getEmergencyContacts;
const addEmergencyContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.userId;
        const { name, relation, phone } = req.body;
        const contact = new EmergencyContact_1.default({
            user: userId,
            name,
            relation,
            phone
        });
        yield contact.save();
        res.status(201).json({
            message: "Emergency contact added successfully",
            contact
        });
    }
    catch (error) {
        console.error("Error adding emergency contact:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to add emergency contact"
        });
    }
});
exports.addEmergencyContact = addEmergencyContact;
const deleteEmergencyContact = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.user) {
            return res.status(401).json({ error: "Not authenticated" });
        }
        const userId = req.user.userId;
        const { id } = req.params;
        const contact = yield EmergencyContact_1.default.findOne({ _id: id, user: userId });
        if (!contact) {
            return res.status(404).json({ error: "Emergency contact not found" });
        }
        yield contact.deleteOne();
        res.json({
            message: "Emergency contact deleted successfully"
        });
    }
    catch (error) {
        console.error("Error deleting emergency contact:", error);
        res.status(500).json({
            error: error instanceof Error ? error.message : "Failed to delete emergency contact"
        });
    }
});
exports.deleteEmergencyContact = deleteEmergencyContact;
