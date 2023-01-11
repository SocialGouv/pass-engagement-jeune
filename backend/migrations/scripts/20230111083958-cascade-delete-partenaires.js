'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('offres', 'partenaireId', {
      type: Sequelize.UUID,
      allowNull: true,
      onDelete: 'CASCADE',
      references: {
        model: 'partenaires',
        key: 'id',
        as: 'partenaireId',
      },
    });
  },

  async down(queryInterface, Sequelize) {},
};
