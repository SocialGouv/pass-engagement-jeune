const assert = require('assert');
const app = require('../../src/app');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');

const { getUrl, port } = require('../../src/utils')(app);
const { USER_CEJ, USER_ADMIN } = require('../data/users');

describe('\'admin\' service', () => {
  let server;

  before(function (done) {
    server = app.listen(port);
    server.once('listening', () => done());
  });

  after(function (done) {
    server.close(done);
  });

  it('registered the service', () => {
    const service = app.service('admin');

    assert.ok(service, 'Registered the service');
  });

  it('Should show \'partenaires\' page', async () => {
    const userInfo = USER_ADMIN;
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    await client.post(getUrl('/login'), userInfo);

    const response = await client.get(getUrl('/admin/partenaires'));
    assert.equal(response.status, 200);

    assert.ok(
      response.data.indexOf(
        '<a class="fr-nav__link" href="/admin/partenaires" aria-current="none" target="_self">Partenaires</a>'
      ) !== -1
    );

    assert.ok(
      response.data.indexOf('<caption class="fr-mb-2w">Liste des partenaires <a class="fr-btn fr-btn--sm fr-btn--tertiary fr-ml-1w fr-btn--icon-left fr-icon-add-circle-fill" href="/admin/partenaire/create">Créer un partenaire</a></caption>') !== -1
    );

    const partenaires = await app.service('partenaires').find();
    assert.ok(
      response.data.indexOf(
        `<td><a href="/admin/partenaires/${partenaires.data[0].dataValues.id}">${partenaires.data[0].dataValues.name}</a></td>`
      ) !== -1
    );
  });

  it('Should show \'offres\' page', async () => {
    const userInfo = USER_ADMIN;
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    await client.post(getUrl('/login'), userInfo);

    const response = await client.get(getUrl('/admin/offres'));
    assert.equal(response.status, 200);

    assert.ok(
      response.data.indexOf(
        '<a class="fr-nav__link" href="/admin/offres" aria-current="none" target="_self">Offres</a>'
      ) !== -1
    );

    assert.ok(
      response.data.indexOf('<caption class="fr-mb-2w">Liste des offres <a class="fr-btn fr-btn--sm fr-btn--tertiary fr-ml-1w fr-btn--icon-left fr-icon-add-circle-fill" href="/admin/offre/create">Créer une offre</a></caption>') !== -1
    );

    const offres = await app.service('offres').find();
    assert.ok(
      response.data.indexOf(`<td><a href="/admin/offres/${offres.data[0].id}">${offres.data[0].title}</a></td>`) !== -1
    );

    const partenaires = await app.service('partenaires').find();
    assert.ok(
      response.data.indexOf(
        `<td><a href="/admin/partenaires/${partenaires.data[0].dataValues.id}">${partenaires.data[0].dataValues.name}</a></td>`
      ) !== -1
    );

    assert.ok(response.data.indexOf('<td>Nationale</td>') !== -1);
  });

  it('Should show \'cej\' page', async () => {
    const userInfo = USER_ADMIN;
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    await client.post(getUrl('/login'), userInfo);

    const response = await client.get(getUrl('/admin/jeunes-cej'));
    assert.equal(response.status, 200);

    assert.ok(
      response.data.indexOf(
        '<a class="fr-nav__link" href="/admin/jeunes-cej" aria-current="none" target="_self">Jeunes CEJ</a>'
      ) !== -1
    );

    assert.ok(
      response.data.indexOf('<caption>Liste des jeunes</caption>') !== -1
    );

    assert.ok(response.data.indexOf('<td>Suzette</td>') !== -1);
  });

  describe('Check Access Control List', async () => {
    it('Should fail to access admin page if not authenticated', async () => {
      try {
        await axios.get(getUrl('/admin'));
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;
        assert.equal(response.status, 403);
      }
    });

    it('Should fail to access admin page if authenticated as an \'CEJ\' user', async () => {
      const userInfo = USER_CEJ;
      const jar = new CookieJar();
      const client = wrapper(axios.create({ jar }));

      await client.post(getUrl('/login'), userInfo);

      try {
        await axios.get(getUrl('/admin'));
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;
        assert.equal(response.status, 403);
      }
    });

    it('Should access admin page if authenticated as an \'ADMIN\' user', async () => {
      const userInfo = USER_ADMIN;
      const jar = new CookieJar();
      const client = wrapper(axios.create({ jar }));

      await client.post(getUrl('/login'), userInfo);

      const response = await client.get(getUrl('/admin'));
      assert.equal(response.status, 200);
    });
  });
});
