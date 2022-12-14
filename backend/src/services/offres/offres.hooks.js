const { authenticate } = require('@feathersjs/authentication').hooks;
const checkPermissions = require('feathers-permissions');

module.exports = {
  before: {
    all: [authenticate('jwt')],
    find: [],
    get: [],
    create: [
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    update: [
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    patch: [
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
    remove: [
      checkPermissions({
        roles: ['ADMIN'],
        field: 'role',
        entity: 'user',
      }),
    ],
  },

  after: {
    all: [],
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
