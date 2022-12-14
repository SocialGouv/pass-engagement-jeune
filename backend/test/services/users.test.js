const assert = require('assert');
const app = require('../../src/app');
const axios = require('axios');
const { getUrl } = require('../utils')(app);

describe('\'users\' service', () => {
  it('registered the service', () => {
    const service = app.service('users');

    assert.ok(service, 'Registered the service');
  });

  describe('Check Access Control List', async () => {
    it('Should fail to create an user if not authenticated', async () => {
      try {
        await axios.post(getUrl('/users'), {
          email: 'passengagementjeune@beta.gouv.fr',
          password: 'supersecret',
          nom: 'Dupont',
          prenom: 'Robert',
          role: 'admin',
          token: 'bd3835d5-1c70-40eb-81a3-5e3defdfbe74',
          passwordCreated: true,
        });
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 401);
      }
    });

    it('Should list users if authenticated as an \'ADMIN\' user', async () => {
      const userInfo = {
        email: 'passengagementjeune@beta.gouv.fr',
        password: 'supersecret',
      };

      const { accessToken } = await app.service('authentication').create({
        strategy: 'local',
        ...userInfo,
      });

      const response = await axios.get(getUrl('/users'), {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      assert.equal(response.status, 200);
    });

    it('Should fail to list users if authenticated as an \'CEJ\' user', async () => {
      try {
        const userInfo = {
          email: 'suzette.apidet@email.fr',
          password: 'supercej',
        };

        const { accessToken } = await app.service('authentication').create({
          strategy: 'local',
          ...userInfo,
        });

        await axios.get(getUrl('/users'), {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 403);
      }
    });
  });
});
