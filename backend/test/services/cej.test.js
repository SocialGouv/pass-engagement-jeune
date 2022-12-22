const assert = require('assert');
const app = require('../../src/app');
const axios = require('axios');
const { wrapper } = require('axios-cookiejar-support');
const { CookieJar } = require('tough-cookie');
const Sequelize = require('sequelize');

const { getUrl, port } = require('../../src/utils')(app);
const { USER_CEJ, STRONG_PASSWORD, WEAK_PASSWORD } = require('../data/users');

describe('\'cej\' service', () => {
  let server;

  before(function (done) {
    server = app.listen(port);
    server.once('listening', () => done());
  });

  after(function (done) {
    server.close(done);
  });

  it('registered the service', () => {
    const service = app.service('cej');

    assert.ok(service, 'Registered the service');
  });

  it('Should login with \'CEJ\' user credentials', async () => {
    const userInfo = USER_CEJ;
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    const response = await client.post(getUrl('/login'), userInfo);
    assert.equal(response.status, 200);
  });

  it('Should fail to login with wrong \'CEJ\' user credentials', async () => {
    const userInfo = USER_CEJ;
    const jar = new CookieJar();
    const client = wrapper(axios.create({ jar }));

    try {
      await client.post(
        getUrl('/login'),
        Object.assign({}, userInfo, { password: 'wrong_password' })
      );
      assert.fail('should never get here');
    } catch (error) {
      const { response } = error;

      assert.equal(response.status, 401);
    }
  });

  describe('Account creation', async () => {
    it('Should access to password choice with token', async () => {
      const users = await app
        .get('sequelizeClient')
        .query(`SELECT * FROM users where email='${USER_CEJ.email}'`, {
          type: Sequelize.QueryTypes.SELECT,
        });

      const response = await axios.get(
        getUrl(`/inscription/${users[0].token}`)
      );

      assert.ok(response.data.indexOf('Choix du mot de passe') !== -1);
      assert.equal(response.status, 200);
    });

    it('Should fail to choose a weak password', async () => {
      const users = await app
        .get('sequelizeClient')
        .query(`SELECT * FROM users where email='${USER_CEJ.email}'`, {
          type: Sequelize.QueryTypes.SELECT,
        });

      try {
        await axios.post(getUrl(`/inscription/${users[0].token}`), {
          password: WEAK_PASSWORD,
        });
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;

        assert.equal(response.status, 400);
      }
    });

    it('Should choose a strong password successfully', async () => {
      const users = await app
        .get('sequelizeClient')
        .query(`SELECT * FROM users where email='${USER_CEJ.email}'`, {
          type: Sequelize.QueryTypes.SELECT,
        });

      const response = await axios.post(
        getUrl(`/inscription/${users[0].token}`),
        {
          password: STRONG_PASSWORD,
        }
      );

      assert.ok(response.data.indexOf('<h1>Inscription terminé</h1>') !== -1);
      assert.equal(response.status, 200);

      // Should fail to reuse token
      try {
        await axios.post(getUrl(`/inscription/${users[0].token}`), {
          password: STRONG_PASSWORD,
        });
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;
        assert.equal(response.status, 404);
      }
    });
  });

  describe('Check Access Control List', async () => {
    it('Should fail to access partenaires page if not authenticated', async () => {
      try {
        await axios.get(getUrl('/partenaires-pej'));
        assert.fail('should never get here');
      } catch (error) {
        const { response } = error;
        assert.equal(response.status, 403);
      }
    });

    it('Should access partenaires page if authenticated as an \'CEJ\' user', async () => {
      const userInfo = USER_CEJ;
      const jar = new CookieJar();
      const client = wrapper(axios.create({ jar }));

      await client.post(
        getUrl('/login'),
        Object.assign(userInfo, { password: STRONG_PASSWORD })
      );

      const response = await client.get(getUrl('/partenaires-pej'));
      assert.equal(response.status, 200);
    });
  });
});
