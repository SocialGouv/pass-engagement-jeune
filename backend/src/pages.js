const bcrypt = require('bcryptjs');

module.exports = function (app) {
  app.get('/', async (req, res) => {
    res.render('index');
  });

  app.get('/stats', async (req, res) => {
    const partenaires = await app
      .service('partenaires')
      .find({ query: { $sort: { updatedAt: -1 } } });

    const offres = await app
      .service('offres')
      .find({ query: { $sort: { updatedAt: -1 } } });

    res.render('stats', {
      partenaires: partenaires.total,
      offres: offres.total,
    });
  });

  app.get('/faq', async (req, res) => {
    res.render('faq');
  });

  app.get('/login', async (req, res) => {
    res.render('login');
  });

  app.post('/login', async (req, res) => {
    const result = await app
      .service('users')
      .find({
        query: { email: req.body.email },
      })
      .catch((e) => console.log(e));

    if (result.total == 0) {
      res.sendStatus(401);
    } else {
      const user = result.data[0];
      if (bcrypt.compareSync(req.body.password, user.password)) {
        req.session.userId = user.id;
        res.redirect('/partenaires-pej');
      } else {
        res.sendStatus(401);
      }
    }
  });

  app.get('/logout', async (req, res) => {
    delete req.session.userId;
    res.redirect('login');
  });

  app.get('/mot-de-passe-oublie', async (req, res) => {
    res.render('password-forgotten');
  });
};
