const assert = require('assert');
const app = require('../../src/app');

describe('\'cej\' service', () => {
  it('registered the service', () => {
    const service = app.service('cej');

    assert.ok(service, 'Registered the service');
  });
});
