const Joi = require('joi');

// Initializes the `admin` service on path `/admin`
const { Admin } = require('./admin.class');
const hooks = require('./admin.hooks');
const { enumLabels } = require('../../formatFunctions');

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
      res.redirect(403, '/login');
    }
  };

  app.get('/admin', checkACL, async (req, res) => {
    res.redirect('admin/partenaires');
  });

  /*
   * Gestion des partenaires
   */

  app.get('/admin/partenaire/create', checkACL, async (req, res) => {
    res.render('admin/partenaire_detail', {
      partenaire: null,
      path: req.path,
      editMode: true,
    });
  });

  app.post('/admin/partenaire', checkACL, async (req, res) => {
    app.service('partenaires').create(req.body);
    res.redirect('/admin/partenaires?action=create&success=true');
  });

  app.get('/admin/partenaires/:id', checkACL, async (req, res) => {
    try {
      const result = await app.service('partenaires').find({
        query: { id: req.params.id },
        sequelize: {
          include: [{ model: app.services.offres.Model, as: 'offres' }],
          raw: false,
        },
      });

      if (result.total == 0) {
        res.sendStatus(404);
      }
      res.render('admin/partenaire_detail', {
        partenaire: result.data[0],
        path: req.path,
        editMode: false,
        action: req.query.action,
        success: req.query.success === 'true',
      });
    } catch (e) {
      res.sendStatus(404);
    }
  });

  app.get('/admin/partenaires/:id/edit', checkACL, async (req, res) => {
    try {
      const result = await app.service('partenaires').find({
        query: { id: req.params.id },
      });

      if (result.total == 0) {
        res.sendStatus(404);
      }
      res.render('admin/partenaire_detail', {
        partenaire: result.data[0],
        path: req.path,
        editMode: true,
      });
    } catch (e) {
      res.sendStatus(404);
    }
  });

  app.post('/admin/partenaires/:id', checkACL, async (req, res) => {
    try {
      const result = await app.service('partenaires').find({
        query: { id: req.params.id },
      });

      if (result.total == 0) {
        res.sendStatus(404);
      }

      const partenaire = result.data[0];
      await app.service('partenaires').patch(partenaire.id, req.body);

      res.redirect(
        `/admin/partenaires/${partenaire.id}?success=true&action=update`
      );
    } catch (e) {
      res.sendStatus(404);
    }
  });

  app.get('/admin/partenaires/:id/delete', checkACL, async (req, res) => {
    try {
      const result = await app.service('partenaires').find({
        query: { id: req.params.id },
      });

      if (result.total == 0) {
        res.sendStatus(404);
      }
      const partenaire = result.data[0];
      await app.service('partenaires').remove(partenaire.id);

      res.redirect('/admin/partenaires?action=delete&success=true');
    } catch (e) {
      res.sendStatus(404);
    }
  });

  app.get('/admin/partenaires', checkACL, async (req, res) => {
    const result = await app.service('partenaires').find();
    res.render('admin/partenaires', {
      partenaires: result,
      path: req.path,
      action: req.query.action,
      success: req.query.success === 'true',
    });
  });

  /*
   * Gestion des offres
   */

  app.get('/admin/offre/create', checkACL, async (req, res) => {
    const partenaires = await app.service('partenaires').find();
    res.render('admin/offre_detail', {
      partenaire: null,
      path: req.path,
      editMode: true,
      partenaires: partenaires.data,
      partenaireId: req.query.partenaireId,
    });
  });

  app.post('/admin/offre', checkACL, async (req, res) => {
    let offre = {};
    offre = req.body;

    // TODO : utils for validation
    const schema = Joi.object({
      title: Joi.string().min(3).max(200).required(),
    }).options({ stripUnknown: true });

    const validation = schema.validate(offre);
    if (validation.error) {
      const partenaires = await app.service('partenaires').find();
      res.render('admin/offre_detail', {
        error: true,
        partenaire: null,
        path: req.path,
        editMode: true,
        partenaires: partenaires.data,
        partenaireId: req.query.partenaireId,
      });
      return;
    }

    // TODO : utils for parsing
    offre.bonPlan = !!offre.bonPlan;
    if (offre.location == '') {
      delete offre.location;
    } else {
      const coordinates = offre.location
        .split(',')
        .map((num) => parseFloat(num));
      offre.echelle = parseInt(offre.echelle);
      offre.location =
        offre.location != ''
          ? null
          : {
            crs: {
              type: 'name',
              properties: {
                name: 'EPSG:4326',
              },
            },
            type: 'Point',
            coordinates: coordinates,
          };
    }
    app.service('offres').create(offre);
    res.redirect('/admin/offres?action=create&success=true');
  });

  app.get('/admin/offres', checkACL, async (req, res) => {
    const result = await app.service('offres').find({
      sequelize: {
        include: [{ model: app.services.partenaires.Model, as: 'partenaire' }],
        raw: false,
      },
    });
    res.render('admin/offres', {
      items: result,
      path: req.path,
      action: req.query.action,
      success: req.query.success === 'true',
    });
  });

  app.get('/admin/offres/:id', checkACL, async (req, res) => {
    try {
      const result = await app.service('offres').find({
        query: { id: req.params.id },
        sequelize: {
          include: [
            { model: app.services.partenaires.Model, as: 'partenaire' },
          ],
          raw: false,
        },
      });

      if (result.total == 0) {
        res.sendStatus(404);
      }
      res.render('admin/offre_detail', {
        offre: result.data[0],
        path: req.path,
        editMode: false,
        action: req.query.action,
        success: req.query.success === 'true',
        enumLabels,
      });
    } catch (e) {
      res.sendStatus(404);
    }
  });

  app.get('/admin/offres/:id/edit', checkACL, async (req, res) => {
    try {
      const result = await app.service('offres').find({
        query: { id: req.params.id },
        sequelize: {
          include: [
            { model: app.services.partenaires.Model, as: 'partenaire' },
          ],
          raw: false,
        },
      });

      if (result.total == 0) {
        res.sendStatus(404);
      }
      res.render('admin/offre_detail', {
        offre: result.data[0],
        path: req.path,
        editMode: true,
      });
    } catch (e) {
      res.sendStatus(404);
    }
  });

  app.get('/admin/offres/:id/delete', checkACL, async (req, res) => {
    try {
      const result = await app.service('offres').find({
        query: { id: req.params.id },
      });

      if (result.total == 0) {
        res.sendStatus(404);
      }
      const offre = result.data[0];
      await app.service('offres').remove(offre.id);

      res.redirect('/admin/offres?action=delete&success=true&action=update');
    } catch (e) {
      res.sendStatus(404);
    }
  });

  app.post('/admin/offres/:id', checkACL, async (req, res) => {
    try {
      const result = await app.service('offres').find({
        query: { id: req.params.id },
        sequelize: {
          include: [
            { model: app.services.partenaires.Model, as: 'partenaire' },
          ],
          raw: false,
        },
      });
      if (result.total == 0) {
        res.sendStatus(404);
      }

      const offre = result.data[0];

      // TODO : utils for validation
      const schema = Joi.object({
        title: Joi.string().min(3).max(200).required(),
      }).options({ stripUnknown: true });

      const validation = schema.validate(req.body);

      let error_fields = [];
      if (validation.error) {
        error_fields.push('title');
      }

      const data = req.body;
      data.bonPlan = !!data.bonPlan;
      try {
        if (data.location == '') {
          delete data.location;
        } else {
          const coordinates = data.location
            .split(',')
            .map((num) => parseFloat(num));
          data.echelle = parseInt(data.echelle);
          data.location = {
            crs: {
              type: 'name',
              properties: {
                name: 'EPSG:4326',
              },
            },
            type: 'Point',
            coordinates: coordinates,
          };
        }

        await app.service('offres').patch(offre.id, data);
  
      } catch(e) {
        error_fields.push('location');
      }

      if(error_fields.length > 0) {
        res.render('admin/offre_detail', {
          offre: result.data[0],
          path: req.path,
          editMode: true,
          error: true,
          error_fields
        });
      } else {
        res.redirect(`/admin/offres/${offre.id}?success=true&action=update`);
      }
    } catch (e) {
      res.sendStatus(404);
    }
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
