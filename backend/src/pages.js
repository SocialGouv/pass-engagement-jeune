module.exports = function (app) {
  app.get('/partenaires-pej', function (req, res, next) {
    app
      .service('partenaires')
      .find({ query: { $sort: { updatedAt: -1 } } })
      .then((result) =>
        res.render('partenaires-pej', { partenaires: result.data })
      )
      .catch(next);
  });

  app.get('/stats', async (req, res) => {
    const partenaires = await app
      .service('partenaires')
      .find({ query: { $sort: { updatedAt: -1 } } });

    const offres = await app
      .service('partenaires')
      .find({ query: { $sort: { updatedAt: -1 } } });

    res.render('stats', {
      partenaires: partenaires.total,
      offres: offres.total,
    });
  });
};
