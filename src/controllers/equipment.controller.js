const EquipmentService = require('../services/equipment.service');

const EquipmentController = {
    addEquipment: async (req, res) => {
        try {
            const { name } = req.body;
            const equipment = await EquipmentService.addEquipment(name, req.user.UserID);
            res.status(201).json({ message: 'Equipment added successfully', equipment });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    updateEquipment: async (req, res) => {
        try {
            const { equipmentID } = req.params;
            const { name } = req.body;
            const updatedEquipment = await EquipmentService.updateEquipment(equipmentID, name, req.user.UserID);
            res.status(200).json({ message: 'Equipment updated successfully', updatedEquipment });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    deleteEquipment: async (req, res) => {
        try {
            const { equipmentID } = req.params;
            await EquipmentService.deleteEquipment(equipmentID, req.user.UserID);
            res.status(200).json({ message: 'Equipment deleted successfully' });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getAllEquipment: async (req, res) => {
        try {
            const equipmentList = await EquipmentService.getAllEquipment();
            res.status(200).json({ equipmentList });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    getEquipmentById: async (req, res) => {
        try {
            const { equipmentID } = req.params;
            const equipment = await EquipmentService.getEquipmentById(equipmentID);
            res.status(200).json({ equipment });
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
};

module.exports = EquipmentController;
