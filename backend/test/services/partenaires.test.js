const assert = require('assert');
const app = require('../../src/app');

describe('\'partenaires\' service', () => {
  it('registered the service', () => {
    const service = app.service('partenaires');

    assert.ok(service, 'Registered the service');
  });
});
