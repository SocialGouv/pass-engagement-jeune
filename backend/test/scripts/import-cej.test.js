const assert = require('assert');
const app = require('../../src/app');
const { execSync } = require('child_process');
const Sequelize = require('sequelize');

describe('scripts', () => {
  describe('Import CEJ from CSV file', () => {
    before(async () => {
      await app
        .get('sequelizeClient')
        .query("DELETE FROM users where email='justine.badet@email.fr'", {
          type: Sequelize.QueryTypes.DELETE,
        });
    });

    it('should import CEJ from CSV file', async () => {
      let users = await app
        .service('users')
        .find({ query: { email: 'justine.badet@email.fr', role: 'CEJ' } });

      assert.equal(users.total, 0);

      execSync(
        'node src/scripts/import-cej.js --csv test/data/test.csv',
        async () => {
          users = await app
            .service('users')
            .find({ query: { email: 'justine.badet@email.fr', role: 'CEJ' } });
          assert.deepEqual(users, {
            prenom: 'Justine',
            nom: 'Badet',
            email: 'justine.badet@email.fr',
            role: 'CEJ',
          });
        }
      );
    }).timeout('20000');

    it('should fail to import CEJ from CSV file if already imported', async () => {
      let users = await app
        .service('users')
        .find({ query: { email: 'justine.badet@email.fr', role: 'CEJ' } });

      assert.equal(users.total, 1);

      const r = execSync(
        'node src/scripts/import-cej.js --csv test/data/test.csv'
      );

      assert.equal(
        r
          .toString()
          .split('\n')[4]
          .indexOf('Le compte CEJ a déjà été créé pour justine.badet@email.fr'),
        91
      );

      users = await app
        .service('users')
        .find({ query: { email: 'justine.badet@email.fr', role: 'CEJ' } });
      assert.equal(users.total, 1);
    }).timeout('20000');
  });
});
