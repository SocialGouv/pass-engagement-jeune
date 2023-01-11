const dayjs = require('dayjs');

const enumLabels = {
  modaliteUtilisation: {
    COUPON_REDUCTION: 'Coupon de réduction',
  },
  echelle: {
    0: 'Nationale',
    1: 'Régionale',
    2: 'Départementale',
    3: 'Communauté de commune',
  },
  type: {
    PEJ: 'PEJ',
    SOLIDAIRE: 'Solidaire',
    JEUNE: 'Jeune'
  },
  categories: {
    ALIMENTATION_HYGIENE: 'Alimentation / Hygiène',
    SOINS_SANTE: 'Soins / Santé',
    MOBILITE: 'Mobilité',
    SPORT: 'Sport',
    LOISIRS_CULTURE: 'Loisirs / Culture',
    EQUIPEMENTS:
      'Equipements (smartphone, ordinateurs portables, électroménager, ameublement)',
    SERVICES: 'Services (assurance, banque)',
  },
};

module.exports = {
  formatOuiNon: (value) => (value ? 'oui' : 'non'),
  formatDate: (value, format) => dayjs(value).format(format),
  formatEnum: (type, key) => enumLabels[type][key],
  enumLabels: enumLabels,
};
