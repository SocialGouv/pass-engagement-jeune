// See https://sequelize.org/master/manual/model-basics.html
// for more of what you can do here.
const Sequelize = require('sequelize');
const DataTypes = Sequelize.DataTypes;

module.exports = function (app) {
  const sequelizeClient = app.get('sequelizeClient');
  const offres = sequelizeClient.define(
    'offres',
    {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      categories: {
        type: DataTypes.ENUM([
          'ALIMENTATION_HYGIENE', // Alimentation / Hygiène
          'SOINS_SANTE', // Soins / Santé
          'MOBILITE', // Mobilité
          'SPORT', // Sport
          'LOISIRS_CULTURE', // Loisirs / Culture
          'EQUIPEMENTS', // Equipements (smartphone, ordinateurs portables, électroménager, ameublement)
          'SERVICES', // Services (assurance, banque)
        ]),
        allowNull: false,
      },
      type: {
        type: DataTypes.ENUM(['PEJ', 'JEUNE', 'SOLIDAIRE']),
        allowNull: false,
      },
      echelle: {
        type: DataTypes.INTEGER,
        validate: {
          min: 0,
          max: 3,
        },
        allowNull: false,
        /*
          0 = 'Nationale',
          1 = 'Régionale',
          2 = 'Départementale',
          3 = 'Communauté de commune',
          */
      },
      location: {
        type: DataTypes.GEOMETRY('POINT'),
        allowNull: true,
      },
      modaliteUtilisation: {
        type: DataTypes.ENUM(['COUPON_REDUCTION']), // Coupon réduction
        allowNull: true,
      },
      bonPlan: {
        type: DataTypes.BOOLEAN,
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
  offres.associate = function (models) {
    // Define associations here
    // See https://sequelize.org/master/manual/assocs.html
    offres.belongsTo(models.partenaires, {
      allowNull: true,
      foreignKeyConstraint: true,
      onDelete: 'cascade',
    });
  };

  return offres;
};
