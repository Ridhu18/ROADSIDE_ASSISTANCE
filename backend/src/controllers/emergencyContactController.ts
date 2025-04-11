import { Request, Response } from 'express';
import EmergencyContact from '../models/EmergencyContact';

export const getEmergencyContacts = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.userId;
    const contacts = await EmergencyContact.find({ user: userId });
    res.json({ contacts });
  } catch (error) {
    console.error("Error getting emergency contacts:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to get emergency contacts"
    });
  }
};

export const addEmergencyContact = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.userId;
    const { name, relation, phone } = req.body;

    const contact = new EmergencyContact({
      user: userId,
      name,
      relation,
      phone
    });

    await contact.save();
    res.status(201).json({
      message: "Emergency contact added successfully",
      contact
    });
  } catch (error) {
    console.error("Error adding emergency contact:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to add emergency contact"
    });
  }
};

export const deleteEmergencyContact = async (req: Request, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    const userId = req.user.userId;
    const { id } = req.params;

    const contact = await EmergencyContact.findOne({ _id: id, user: userId });
    if (!contact) {
      return res.status(404).json({ error: "Emergency contact not found" });
    }

    await contact.deleteOne();
    res.json({
      message: "Emergency contact deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting emergency contact:", error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : "Failed to delete emergency contact"
    });
  }
}; 