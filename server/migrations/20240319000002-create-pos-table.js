'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('POs', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true
      },
      tenderId: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Tenders',
          key: 'id'
        },
        onDelete: 'CASCADE'
      },
      poNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      poDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      poDocument: {
        type: Sequelize.STRING,
        allowNull: true
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('POs');
  }
}; 