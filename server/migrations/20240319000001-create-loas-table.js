'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('LOAs', {
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
      loaNumber: {
        type: Sequelize.STRING,
        allowNull: false
      },
      loaDate: {
        type: Sequelize.DATE,
        allowNull: false
      },
      loaDocument: {
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
    await queryInterface.dropTable('LOAs');
  }
}; 