const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

const { hashPassword, protect } =
  require('@feathersjs/authentication-local').hooks;

module.exports = {
  before: {
    all: [
      authenticate('jwt'),
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    find: [],
    get: [authenticate('jwt')],
    create: [hashPassword('password')],
    update: [hashPassword('password')],
    patch: [hashPassword('password')],
    remove: [],
  },

  after: {
    all: [
      // Make sure the password field is never sent to the client
      // Always must be the last hook
      protect('password'),
    ],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: [],
  },
};
