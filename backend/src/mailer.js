const Joi = require('joi');
const _ = require('lodash');
const htmlToText = require('nodemailer-html-to-text').htmlToText;
const nodemailer = require('nodemailer');
const dayjs = require('dayjs');
const path = require('path');
const mjml = require('mjml');
const ejs = require('ejs');
const { promisify } = require('util');
const renderFile = promisify(ejs.renderFile);

const configuration = require('@feathersjs/configuration');
const config = configuration();
const Sentry = require('@sentry/node');

module.exports = (app) => {
  const configuration = app.get('smtp');

  let transporter = nodemailer.createTransport({
    name: configuration.hostname,
    host: configuration.host,
    port: configuration.port,
    secure: configuration.secure === 'true',
    greetingTimeout: parseInt(configuration.greetingTimeout),
    logger: configuration.logger === 'true',
    debug: configuration.debug === 'true',
    tls: {
      rejectUnauthorized: false,
    },
    ...(!configuration.user
      ? {}
      : {
        auth: {
          user: configuration.user,
          pass: configuration.password,
        },
      }),
  });

  transporter.use('compile', htmlToText({ ignoreImage: true }));

  const { getUrl } = require('./utils')(app);

  const setSentryError = (err) => {
    if (config().sentry.enabled === 'true') {
      Sentry.init({
        dsn: config().sentry.dsn,
        environment: config().sentry.environment,
        tracesSampleRate: parseFloat(config().sentry.traceSampleRate),
      });
      app.use(Sentry.Handlers.requestHandler());
      app.use(Sentry.Handlers.errorHandler());
      app.set('sentry', Sentry);

      app.get('sentry').captureException(err);
    }
  };

  let utils = {
    getUrl,
    setSentryError,
  };

  return {
    utils,
    render: async (rootDir, templateName, data = {}) => {
      let mjmlTemplate = await renderFile(
        path.join(rootDir, `${templateName}.mjml.ejs`),
        {
          ...data,
          templateName,
          utils: { dayjs, ...utils },
        }
      );
      return mjml(mjmlTemplate, {}).html;
    },
    createMailer: () => {
      return {
        sendEmail: async (
          emailAddress,
          message,
          options = {},
          carbonCopy = null
        ) => {
          const schema = await Joi.object(
            {
              subject: Joi.string().required(),
              body: Joi.string().required(),
            },
            { abortEarly: false }
          );
          let { subject, body } = schema.validate(message).value;
          return transporter.sendMail(
            _.merge(
              // TODO Object.assign
              {},
              {
                to: emailAddress,
                subject,
                from: `Pass Engagement Jeune <${configuration.from}>`,
                replyTo: `Pass Engagement Jeune <${configuration.replyTo}>`,
                list: {
                  help: getUrl('/faq'),
                },
                html: body,
                ...(carbonCopy !== null ? { cc: carbonCopy } : {}),
              },
              {
                ...options,
                ...(process.env.CNUM_MAIL_BCC
                  ? { bcc: process.env.CNUM_MAIL_BCC }
                  : {}),
              }
            )
          );
        },
      };
    },
  };
};
