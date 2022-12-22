const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc');
dayjs.extend(utc);

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const config = configuration();
const express = require('@feathersjs/express');
const Sentry = require('@sentry/node');

const middleware = require('../middleware');
const services = require('../services');
const appHooks = require('../app.hooks');
const channels = require('../channels');

const authentication = require('../authentication');

const sequelize = require('../sequelize');

const mailer = require('../mailer');

const f = feathers();
const app = express(f);

app.configure(config);
app.configure(sequelize);
app.configure(middleware);
app.configure(authentication);
app.configure(services);
app.configure(channels);
app.hooks(appHooks);

const loggerWinston = require('../logger');

let transaction = null;

module.exports = {
  delay: (milliseconds) => {
    return new Promise((resolve) => setTimeout(() => resolve(), milliseconds));
  },
  capitalizeFirstLetter: (string) =>
    string.charAt(0).toUpperCase() + string.slice(1),
  execute: async (name, job) => {
    const logger = {
      error: function (text) {
        loggerWinston.error(`[${name}] : ${text}`);
      },
      info: function (text) {
        loggerWinston.info(`[${name}] : ${text}`);
      },
    };

    if (config().sentry.enabled === 'true') {
      Sentry.init({
        dsn: config().sentry.dsn,
        environment: config().sentry.environment,

        // Set tracesSampleRate to 1.0 to capture 100%
        // of transactions for performance monitoring.
        // We recommend adjusting this value in production
        tracesSampleRate: parseFloat(config().sentry.traceSampleRate),
      });
      transaction = Sentry.startTransaction({
        op: 'Lancement de script',
        name: name,
      });
      app.use(Sentry.Handlers.errorHandler());
      process.on('unhandledRejection', (e) => Sentry.captureException(e));
      process.on('uncaughtException', (e) => Sentry.captureException(e));
    } else {
      process.on('unhandledRejection', (e) => logger.error(e));
      process.on('uncaughtException', (e) => logger.error(e));
    }

    const exit = async (error) => {
      if (error) {
        Sentry.captureException(error);
        logger.error(error);
        process.exitCode = 1;
      }
      if (transaction !== null) {
        transaction.finish();
      }
      setTimeout(() => {
        process.exit();
      }, 1000);
    };

    const db = await app.get('sequelizeClient');

    const m = mailer(app);

    let jobComponents = Object.assign(
      {},
      { feathers: f, db, logger, exit, app, Sentry, mailer: m }
    );

    try {
      let launchTime = new Date().getTime();
      await job(jobComponents);
      let duration = dayjs
        .utc(new Date().getTime() - launchTime)
        .format('HH:mm:ss.SSS');
      logger.info(`Completed in ${duration}`);
    } catch (e) {
      exit(e);
    }
  },
};
