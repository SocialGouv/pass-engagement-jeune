module.exports = function (app) {

  app.get('/partenaires-pej', function(req, res, next){
    app.service('partenaires')
      .find({ query: {$sort: { updatedAt: -1 } } })
      .then(result => res.render('partenaires-pej', { partenaires: result.data }))
      .catch(next);
  });

  app.get('/stats', function(req, res, next){
    app.service('partenaires')
      .find({ query: {$sort: { updatedAt: -1 } } })
      .then(result => res.render('stats', {partenaires: result.total }))
      .catch(next);
  });

};
