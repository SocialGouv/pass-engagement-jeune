const assert = require('assert');
const app = require('../../src/app');
const axios = require('axios');

const { getUrl, port } = require('../utils')(app);

describe('\'offres\' service', () => {
  let server;

  before(function (done) {
    server = app.listen(port);
    server.once('listening', () => done());
  });

  it('registered the service', () => {
    const service = app.service('offres');

    assert.ok(service, 'Registered the service');
  });

  describe('looks for \'offres\' near a specific location', async () => {

    describe('Correct location', async () => {
      it('Results near Tiffauges', async () => {
        const { data } = await axios.get(getUrl('/search/offres', { near : '47.01667,-1.1' } ));

        assert.ok(
          data[0].title == 'Offre solidaire -15% - Nantes',
          data[1].title == 'Offre solidaire -15% - Paris'
        );
      });

      it('Results near Les Mureaux', async () => {
        const { data } = await axios.get(getUrl('/search/offres', { near : '49.0,1.91667' } ));

        assert.ok(
          data[0].title == 'Offre solidaire -15% - Paris',
          data[1].title == 'Offre solidaire -15% - Nantes'
        );
      });
    });

    describe('Correct location with limit', async () => {
      it('One result near Tiffauges', async () => {
        const LIMIT_VALUE = 1;

        const { data } = await axios.get(getUrl('/search/offres', { near : '47.01667,-1.1', limit: LIMIT_VALUE } ));

        assert.ok(
          data[0].title == 'Offre solidaire -15% - Nantes'
        );

        assert.ok(data.length == LIMIT_VALUE);
      });

      it('Two results near Tiffauges', async () => {
        const LIMIT_VALUE = 2;

        const { data } = await axios.get(getUrl('/search/offres', { near : '47.01667,-1.1', limit: LIMIT_VALUE } ));

        assert.ok(
          data[0].title == 'Offre solidaire -15% - Nantes'
        );

        assert.ok(data.length == LIMIT_VALUE);
      });
    });

    describe('Correct location with distanceMax', async () => {
      it('Result near Tiffauges (100km max)', async () => {
        const DISTANCE_MAX_VALUE = 100;

        const { data } = await axios.get(getUrl('/search/offres', { near : '47.01667,-1.1', distanceMax: DISTANCE_MAX_VALUE } ));

        assert.ok(
          data[0].title == 'Offre solidaire -15% - Nantes'
        );

        assert.ok(data.filter(offre => offre.distance > DISTANCE_MAX_VALUE).length == 0);
      });
    });

    it('Incorrect location should fail', async () => {
      try {
        await axios.get(getUrl('/search/offres', { near : '490000,1.91667' } ));
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 400);

        assert.ok(
          response.data.details[0].path == 'near'
        );
      }

    });

    it('Incorrect limit should fail', async () => {
      try {
        await axios.get(getUrl('/search/offres', { near : '49.0000,1.91667', limit: 'a' } ));
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 400);
        assert.ok(
          response.data.details[0].path == 'limit'
        );
      }

    });

    it('Incorrect maximale distance should fail', async () => {
      try {
        await axios.get(getUrl('/search/offres', { near : '49.0000,1.91667', distanceMax: 'a' } ));
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 400);
        assert.ok(
          response.data.details[0].path == 'distanceMax'
        );
      }

    });

  });
});
