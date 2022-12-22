#!/usr/bin/env node
'use strict';

const { execute } = require('./utils');
const { v4: uuidv4 } = require('uuid');
const csvToJson = require('csvtojson');
const { program } = require('commander');
const dayjs = require('dayjs');

const readCSV = async (filePath) =>
  csvToJson({
    delimiter: ';',
  }).fromFile(filePath);

program.option('-c, --csv <path>', 'CSV file path');

program.parse(process.argv);

execute(__filename, async ({ feathers, logger, exit }) => {
  logger.info('Import des jeunes CEJ');

  const csvPath = program.opts().csv;

  if (!csvPath) throw new Error('--csv required');

  logger.info(`Import du fichier: ${csvPath}`);

  const cejList = await readCSV(csvPath);

  cejList.forEach(async (cej) => {
    logger.info(JSON.stringify(cej));

    const users = await feathers
      .service('users')
      .find({ query: { email: cej.email, role: 'CEJ' } });

    if (users.total == 0) {
      await feathers.service('users').create({
        email: cej.email,
        prenom: cej.prenom,
        nom: cej.nom,
        password: uuidv4(), // random password (required to create user)
        role: 'CEJ',
        token: uuidv4(),
        mailSentDate: null, // on stock la date du dernier envoi de mail de création pour le mécanisme de relance
        passwordCreated: false,
        createdAt: new Date(),
      });
    } else {
      let createdAt = dayjs
        .utc(users.data[0].createdAt.getTime())
        .format('DD/MM/YYYY à HH:mm:ss.SSS');
      logger.error(
        `Le compte CEJ a déjà été créé pour ${cej.email} le ${createdAt}`
      );
      exit();
    }
  });
  exit();
});
