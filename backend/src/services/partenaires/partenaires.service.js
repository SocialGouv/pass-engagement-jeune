// Initializes the `partenaires` service on path `/partenaires`
const { Partenaires } = require('./partenaires.class');
const createModel = require('../../models/partenaires.model');
const hooks = require('./partenaires.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/partenaires', new Partenaires(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('partenaires');

  service.hooks(hooks);
};
