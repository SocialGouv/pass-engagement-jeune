// Initializes the `offres` service on path `/offres`
const { Offres } = require('./offres.class');
const createModel = require('../../models/offres.model');
const hooks = require('./offres.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/offres', new Offres(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('offres');

  service.hooks(hooks);
};
