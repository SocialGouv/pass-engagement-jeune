const assert = require('assert').strict;

const formatFunctions = require('../../src/formatFunctions');

describe('formatFunctions', () => {
  describe('formatOuiNon', () => {
    it('Should returns \'oui\' if value is true', async () => {
      assert.equal(formatFunctions.formatOuiNon(true), 'oui');
    });
    it('Should returns \'non\' if value is false', async () => {
      assert.equal(formatFunctions.formatOuiNon(false), 'non');
    });
  });

  describe('formatFunctions', () => {
    it('Should returns a formatted string', async () => {
      assert.equal(
        formatFunctions.formatDate(new Date(2022, 10, 10), 'DD/MM/YYYY'),
        '10/11/2022'
      );
    });

    it('Should returns a \'Invalid Date\' if value is incorrect', async () => {
      assert.equal(
        formatFunctions.formatDate(null, 'DD/MM/YYYY'),
        'Invalid Date'
      );
    });
  });

  describe('formatEnum', () => {
    it('Should returns \'Coupon de réduction\' if type is \'modaliteUtilisation\' and value is \'COUPON_REDUCTION\'', async () => {
      assert.equal(formatFunctions.formatEnum('modaliteUtilisation', 'COUPON_REDUCTION'), 'Coupon de réduction');
    });

    it('Should returns \'Nationale\' if type is \'echelle\' and value is 0', async () => {
      assert.equal(formatFunctions.formatEnum('echelle', 0), 'Nationale');
    });

    it('Should returns \'Mobilité\' if type is \'categories\' and value is \'MOBILITE\'', async () => {
      assert.equal(formatFunctions.formatEnum('categories', 'MOBILITE'), 'Mobilité');
    });
  });
});
