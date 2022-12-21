const assert = require('assert').strict;
const axios = require('axios');
const app = require('../src/app');

const { getUrl, port } = require('../src/utils')(app);

const { cleanUp, bootstrap } = require('./bootstrap');

describe('Feathers application tests', () => {
  let server;

  before(function (done) {
    cleanUp(app.get('sequelizeClient'));
    bootstrap(app);
    setTimeout(() => {
      server = app.listen(port);
      server.once('listening', () => done());
    }, 1000);
  });

  after(function (done) {
    server.close(done);
  });

  it('starts and shows the index page', async () => {
    const { data } = await axios.get(getUrl());

    assert.ok(data.indexOf('<html lang="fr">') !== -1);
  });

  it('starts and shows the stats page', async () => {
    const { data } = await axios.get(getUrl('/stats'));

    assert.ok(data.indexOf('<h4 class="fr-tile__title">3 offres</h4>') !== -1);

    assert.ok(
      data.indexOf('<h4 class="fr-tile__title">1 partenaires</h4>') !== -1
    );
  }).timeout(20000);

  describe('404', function () {
    it('shows a 404 HTML page', async () => {
      try {
        await axios.get(getUrl('path/to/nowhere'), {
          headers: {
            Accept: 'text/html',
          },
        });
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 404);
        assert.ok(response.data.indexOf('<html>') !== -1);
      }
    });

    it('shows a 404 JSON error without stack trace', async () => {
      try {
        await axios.get(getUrl('path/to/nowhere'), {
          json: true,
        });
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 404);
        assert.equal(response.data.code, 404);
        assert.equal(response.data.message, 'Page not found');
        assert.equal(response.data.name, 'NotFound');
      }
    });
  });
});
