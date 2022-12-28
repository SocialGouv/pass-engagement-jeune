// Initializes the `admin` service on path `/admin`
const { Admin } = require('./admin.class');
const hooks = require('./admin.hooks');
const { Forbidden } = require('@feathersjs/errors');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate'),
  };

  /*
   * Feathers hooks does not allow to access request object
   * We need to check access here
   */
  const checkACL = (req, res, next) => {
    if (req.session.userId && req.session.role == 'ADMIN') {
      next();
    } else {
      throw new Forbidden('Vous n\'avez pas l\'autorisation');
    }
  };

  app.get('/admin', checkACL, async (req, res) => {
    res.redirect('admin/partenaires');
  });

  app.get('/admin/partenaires', checkACL, async (req, res) => {
    const result = await app.service('partenaires').find();
    res.render('admin/partenaires', { partenaires: result, path: req.path });
  });

  app.get('/admin/offres', checkACL, async (req, res) => {
    const result = await app.service('offres').find();
    res.render('admin/offres', { items: result, path: req.path });
  });

  app.get('/admin/jeunes-cej', checkACL, async (req, res) => {
    const result = await app.service('users').find({ query: { role: 'CEJ' } });
    res.render('admin/cej', { items: result, path: req.path });
  });

  // Initialize our service with any options it requires
  app.use('/admin', new Admin(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('admin');

  service.hooks(hooks);
};
