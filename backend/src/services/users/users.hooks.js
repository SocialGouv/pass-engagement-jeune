const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

const { hashPassword, protect } =
  require('@feathersjs/authentication-local').hooks;

module.exports = {
  before: {
    all: [],
    find: [
      authenticate('jwt'),
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    get: [
      authenticate('jwt'),
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    create: [
      hashPassword('password'),
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    update: [
      hashPassword('password'),
      authenticate('jwt'),
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    patch: [
      hashPassword('password'),
      authenticate('jwt'),
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    remove: [
      authenticate('jwt'),
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
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
