const assert = require('assert');
const app = require('../../src/app');

describe('\'offres\' service', () => {
  it('registered the service', () => {
    const service = app.service('offres');

    assert.ok(service, 'Registered the service');
  });
});
