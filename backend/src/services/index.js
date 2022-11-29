const users = require('./users/users.service.js');
const partenaires = require('./partenaires/partenaires.service.js');
const offres = require('./offres/offres.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(users);
  app.configure(partenaires);
  app.configure(offres);
};
