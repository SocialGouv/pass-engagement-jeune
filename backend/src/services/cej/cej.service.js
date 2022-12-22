// Initializes the `cej` service on path `/cej`
const { Cej } = require('./cej.class');
const hooks = require('./cej.hooks');
const Joi = require('joi');

module.exports = function (app) {
  const options = {
    paginate: app.get('paginate'),
  };

  // Initialize our service with any options it requires
  app.use('/cej', new Cej(options, app));

  app.get('/inscription/:token', async (req, res) => {
    const result = await app
      .service('users')
      .find({ query: { token: req.params.token } });

    if (result.total == 0) {
      res.sendStatus(404);
    } else {
      res.render('cej/inscription', {
        cej: result.data[0],
      });
    }
  });

  app.post('/inscription/:token', async (req, res) => {
    const result = await app
      .service('users')
      .find({ query: { token: req.params.token } });

    if (result.total == 0) {
      res.sendStatus(404);
    } else {
      const cej = result.data[0];
      const password = req.body.password;

      const complexityRule = Joi.string().min(8).alphanum().required();

      const validation = complexityRule.validate(password);
      if (validation.error) {
        res.status(400).send(validation.error);
        return;
      }

      await app.service('users').patch(cej.id, { password, token: '' });

      res.render('cej/inscription_termine', {
        cej: cej,
      });
    }
  });

  app.get('/partenaires-pej', function (req, res, next) {
    if (req.session.userId) {
      app
        .service('partenaires')
        .find({ query: { $sort: { updatedAt: -1 } } })
        .then((result) =>
          res.render('partenaires-pej', { partenaires: result.data })
        )
        .catch(next);
    } else {
      res.sendStatus(403);
    }
  });

  // Get our initialized service so that we can register hooks
  const service = app.service('cej');

  service.hooks(hooks);
};
