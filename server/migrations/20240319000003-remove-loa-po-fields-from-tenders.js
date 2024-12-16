'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('tenders', 'loa_number');
    await queryInterface.removeColumn('tenders', 'loa_date');
    await queryInterface.removeColumn('tenders', 'loa_document');
    await queryInterface.removeColumn('tenders', 'po_number');
    await queryInterface.removeColumn('tenders', 'po_date');
    await queryInterface.removeColumn('tenders', 'po_document');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('tenders', 'loa_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('tenders', 'loa_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('tenders', 'loa_document', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('tenders', 'po_number', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('tenders', 'po_date', {
      type: Sequelize.DATE,
      allowNull: true
    });
    await queryInterface.addColumn('tenders', 'po_document', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
}; 