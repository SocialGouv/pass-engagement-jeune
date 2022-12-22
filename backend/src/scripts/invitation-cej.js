#!/usr/bin/env node
'use strict';

const { execute } = require('./utils');

const bienvenueCompteCEJ = require('../emails/cej/bienvenueCompteCEJ');

execute(__filename, async ({ feathers, logger, mailer, exit }) => {
  logger.info('Invitation des jeunes CEJ');
  const result = await feathers
    .service('users')
    .find({ query: { role: 'CEJ', mailSentDate: null } });

  const email = bienvenueCompteCEJ(mailer);

  result.data.forEach(async (cej) => {
    logger.info(JSON.stringify(cej));

    await email.send(cej);

    await feathers.service('users').patch(cej.id, { mailSentDate: new Date() });

    logger.info(
      `L'invitation pour le compte CEJ a été envoyée pour ${cej.email}`
    );
    exit();
  });
});
