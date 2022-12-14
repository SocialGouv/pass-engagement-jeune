'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    queryInterface.addColumn('users', 'nom', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    queryInterface.addColumn('users', 'prenom', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    queryInterface.addColumn('users', 'role', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    queryInterface.addColumn('users', 'token', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    queryInterface.addColumn('users', 'passwordCreated', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
    });
    queryInterface.addColumn('users', 'mailSentDate', {
      type: Sequelize.DATE,
    });
  },

  async down(queryInterface, Sequelize) {
    queryInterface.removeColumn('users', 'nom');
    queryInterface.removeColumn('users', 'prenom');
    queryInterface.removeColumn('users', 'role');
    queryInterface.removeColumn('users', 'token');
    queryInterface.removeColumn('users', 'passwordCreated');
    queryInterface.removeColumn('users', 'mailSentDate');
  },
};
