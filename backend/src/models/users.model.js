// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const users = sequelizeClient.define(
    'users',
    {
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      nom: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
      },
      prenom: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
      },
      role: {
        type: DataTypes.ENUM(['CEJ', 'PARTENAIRE', 'ADMIN']),
        allowNull: false,
        defaultValue: 'ADMIN',
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      token: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: '',
      },
      passwordCreated: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      mailSentDate: {
        type: DataTypes.DATE,
      },
    },
    {
      hooks: {
        beforeCount(options) {
          options.raw = true;
        },
      },
    }
  );

  // eslint-disable-next-line no-unused-vars
  users.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
  };

  return users;
};
