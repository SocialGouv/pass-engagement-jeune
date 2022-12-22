const assert = require('assert');
const app = require('../../src/app');
const { execSync } = require('child_process');
// const Sequelize = require('sequelize');

describe('scripts', () => {
  describe('Send invitation by email to CEJ users', () => {
    it('should send an email to CEJ users that has not already been invited', async () => {
      let users = await app
        .service('users')
        .find({ query: { email: 'suzette.apidet@email.fr', role: 'CEJ' } });

      assert.equal(users.total, 1);
      assert.equal(users.data[0].mailSentDate, null);

      const result = execSync('node src/scripts/invitation-cej.js');
      users = await app
        .service('users')
        .find({ query: { email: 'suzette.apidet@email.fr', role: 'CEJ' } });

      assert.notEqual(users.data[0].mailSentDate, null);

      assert.notEqual(
        result
          .toString()
          .split('\n')[3]
          .indexOf('L\'invitation pour le compte CEJ a été envoyée pour suzette.apidet@email.fr'),
        -1
      );

    }).timeout('20000');
  });
});
