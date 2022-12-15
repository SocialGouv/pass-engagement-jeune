const assert = require('assert');
const app = require('../../src/app');
const axios = require('axios');
const { getUrl } = require('../../src/utils')(app);

describe('\'partenaires\' service', () => {
  const SAMPLE_PARTENAIRES = {
    name: 'SAMPLE RéparSeb',
    description:
      'Agir pour l’économie circulaire via la réparation de petit électroménager tout en contribuant à l’insertion professionnelle de personnes éloignées de l’emploi : tel est le double objectif de l’atelier RépareSEB qui a ouvert ses portes en décembre 2020 à Paris, porte de La Chapelle.',
    url: 'https://www.groupeseb.com/fr/repareseb',
  };

  it('registered the service', () => {
    const service = app.service('partenaires');

    assert.ok(service, 'Registered the service');
  });

  describe('Check Access Control List', async () => {
    it('Should fail to create an \'partenaires\' if not authenticated', async () => {
      try {
        await axios.post(getUrl('/partenaires'), SAMPLE_PARTENAIRES);
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 401);
      }
    });

    it('Should create \'partenaires\' if authenticated as an \'ADMIN\' user', async () => {
      const userInfo = {
        email: 'passengagementjeune@beta.gouv.fr',
        password: 'supersecret',
      };

      const { accessToken } = await app.service('authentication').create({
        strategy: 'local',
        ...userInfo,
      });

      const response = await axios.post(
        getUrl('/partenaires'),
        SAMPLE_PARTENAIRES,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );
      assert.equal(response.status, 201);

      // clean up
      await app.service('partenaires').remove(response.data.id);
    });

    it('Should fail to create an \'partenaires\' if authenticated as an \'CEJ\' user', async () => {
      try {
        const userInfo = {
          email: 'suzette.apidet@email.fr',
          password: 'supercej',
        };
        const { accessToken } = await app.service('authentication').create({
          strategy: 'local',
          ...userInfo,
        });

        await axios.post(getUrl('/partenaires'), SAMPLE_PARTENAIRES, {
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
