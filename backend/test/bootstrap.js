const Sequelize = require('sequelize');
const { v4: uuidv4 } = require('uuid');

const { USER_CEJ, USER_ADMIN } = require('./data/users');

module.exports = {
  cleanUp: async (db) => {
    await db.query('DELETE FROM users', { type: Sequelize.QueryTypes.DELETE });
    await db.query('DELETE FROM offres', { type: Sequelize.QueryTypes.DELETE });
    await db.query('DELETE FROM partenaires', {
      type: Sequelize.QueryTypes.DELETE,
    });
  },
  bootstrap: async (app) => {
    await app.service('users').create(
      Object.assign(USER_CEJ, {
        prenom: 'Suzette',
        nom: 'Apidet',
        role: 'CEJ',
        token: uuidv4(),
        mailSentDate: null,
        passwordCreated: true,
        createdAt: new Date(),
      })
    );

    await app.service('users').create(
      Object.assign(USER_ADMIN, {
        prenom: 'Robert',
        nom: 'Dupont',
        role: 'ADMIN',
        token: uuidv4(),
        mailSentDate: null,
        passwordCreated: true,
        createdAt: new Date(),
      })
    );

    const partenaire = await app.service('partenaires').create({
      name: 'RéparSeb',
      description:
        'Agir pour l’économie circulaire via la réparation de petit électroménager tout en contribuant à l’insertion professionnelle de personnes éloignées de l’emploi : tel est le double objectif de l’atelier RépareSEB qui a ouvert ses portes en décembre 2020 à Paris, porte de La Chapelle.',
      url: 'https://www.groupeseb.com/fr/repareseb',
      updatedAt: '2022-12-14T14:24:55.913Z',
      createdAt: '2022-12-14T14:24:55.913Z',
    });

    await app.service('offres').create({
      title: 'Offre solidaire -15% - Paris',
      description: 'Lorem ipsum.',
      categories: 'EQUIPEMENTS',
      type: 'PEJ',
      echelle: 0,
      modaliteUtilisation: 'COUPON_REDUCTION',
      bonPlan: false,
      partenaireId: partenaire.id,
      location: {
        crs: {
          type: 'name',
          properties: {
            name: 'EPSG:4326',
          },
        },
        type: 'Point',
        coordinates: [48.866667, 2.333333],
      },
    });

    await app.service('offres').create({
      title: 'Offre solidaire -15% - Nantes',
      description: 'Lorem ipsum.',
      categories: 'EQUIPEMENTS',
      type: 'PEJ',
      echelle: 0,
      modaliteUtilisation: 'COUPON_REDUCTION',
      bonPlan: false,
      partenaireId: partenaire.id,
      location: {
        crs: {
          type: 'name',
          properties: {
            name: 'EPSG:4326',
          },
        },
        type: 'Point',
        coordinates: [47.218371, -1.553621],
      },
    });

    await app.service('offres').create({
      title: 'Offre solidaire -15%',
      description: 'Lorem ipsum.',
      categories: 'EQUIPEMENTS',
      type: 'PEJ',
      echelle: 0,
      location: null,
      modaliteUtilisation: 'COUPON_REDUCTION',
      bonPlan: false,
      partenaireId: partenaire.id,
    });

    app.set('bootstraped_data', { partenaire });
  },
};
