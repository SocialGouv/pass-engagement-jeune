// Initializes the `offres` service on path `/offres`
const { Offres } = require('./offres.class');
const createModel = require('../../models/offres.model');
const hooks = require('./offres.hooks');
const Sequelize = require('sequelize');
const Joi = require('joi');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  // Initialize our service with any options it requires
  app.use('/offres', new Offres(options, app));

  app.get('/search/offres', async (req, res) => {
    const schema = Joi.object({
      near: Joi.string()
        // eslint-disable-next-line no-useless-escape
        .pattern(new RegExp('^-?([1-8]?[1-9]|[1-9]0)\\.{1}\\d{1,6}'))
        .required(),
  
      limit: Joi.number()
        .integer()
        .min(1),

      distanceMax: Joi.number()
        .integer()
        .min(1),
    });
  
    const validation = schema.validate(req.query);
    if(validation.error) {
      res.status(400).send(validation.error);   
      return;
    }

    const coord = req.query.near.replace(',', ' ');
    const limit_query = req.query.limit !== undefined ? ` LIMIT ${req.query.limit}` : '';

    try {
      let offres = await app
        .get('sequelizeClient')
        .query('SELECT *, ST_Distance(ST_Transform(ST_GeomFromText(\'POINT(' + coord + ')\', 4326),2100), ST_Transform(offres.location, 2100)) / 1000 as distance FROM offres ORDER BY distance' + limit_query, { type: Sequelize.QueryTypes.SELECT });

      if(req.query.distanceMax !== undefined) {
        offres = offres.filter(offre => offre.distance <= parseInt(req.query.distanceMax));
      }
      res.send(offres);
    } catch (e) {
      console.log(e);
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('offres');

  service.hooks(hooks);
};
