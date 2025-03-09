const { Equipment, AuditLog } = require('../models');

const EquipmentService = {
  addEquipment: async (name, userID) => {
    const equipment = await Equipment.create({ Name: name });

    await AuditLog.create({
      UserID: userID,
      Action: 'Create',
      Details: `Equipment added by Admin: ${name}`,
      Timestamp: new Date()
    });

    return equipment;
  },

  updateEquipment: async (equipmentID, name, userID) => {
    const equipment = await Equipment.findByPk(equipmentID);
    if (!equipment) throw new Error('Equipment not found');

    equipment.Name = name || equipment.Name;
    await equipment.save();

    await AuditLog.create({
      UserID: userID,
      Action: 'Update',
      Details: `Equipment ${equipmentID} updated by Admin`,
      Timestamp: new Date()
    });

    return equipment;
  },

  deleteEquipment: async (equipmentID, userID) => {
    const equipment = await Equipment.findByPk(equipmentID);
    if (!equipment) throw new Error('Equipment not found');

    await Equipment.destroy({ where: { EquipmentID: equipmentID } });

    await AuditLog.create({
      UserID: userID,
      Action: 'Delete',
      Details: `Equipment ${equipmentID} deleted by Admin`,
      Timestamp: new Date()
    });

    return { message: 'Equipment deleted' };
  },

  getAllEquipment: async () => {
    return await Equipment.findAll();
  },

  getEquipmentById: async (equipmentID) => {
    const equipment = await Equipment.findByPk(equipmentID);
    if (!equipment) throw new Error('Equipment not found');
    return equipment;
  }
};

module.exports = EquipmentService;
