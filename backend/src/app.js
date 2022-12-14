const path = require('path');
const favicon = require('serve-favicon');
const compress = require('compression');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const logger = require('./logger');

const feathers = require('@feathersjs/feathers');
const configuration = require('@feathersjs/configuration');
const express = require('@feathersjs/express');

const middleware = require('./middleware');
const services = require('./services');
const appHooks = require('./app.hooks');
const channels = require('./channels');
const pages = require('./pages');
const mailer = require('./mailer');

const authentication = require('./authentication');

const sequelize = require('./sequelize');

const formatFunctions = require('./formatFunctions');

const app = express(feathers());

// Load app configuration
const conf = configuration();
app.configure(conf);
// Enable security, CORS, compression, favicon and body parsing
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    crossOriginResourcePolicy: false,
  })
);
app.use(
  cors({
    origin: '*',
  })
);
app.use(compress());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(favicon(path.join(app.get('public'), 'favicon.ico')));
// Host the public folder
app.use('/', express.static(app.get('public')));

// Set up Plugins and providers
app.configure(express.rest());
const ONE_DAY = 1000 * 60 * 60 * 24;
app.use(
  session({
    secret: conf().authentication.session.secret,
    saveUninitialized: true,
    cookie: { maxAge: ONE_DAY },
    resave: false,
  })
);

// cookie parser middleware
app.use(cookieParser());

app.configure(sequelize);

// Configure other middleware (see `middleware/index.js`)
app.configure(middleware);
app.configure(authentication);
// Set up our services (see `services/index.js`)
app.configure(services);
// Set up event channels (see channels.js)
app.configure(channels);

app.set('view engine', 'pug');

Object.assign(app.locals, formatFunctions);

pages(app);
const m = mailer(app);
app.set('mailer', m);

// Configure a middleware for 404s and the error handler
app.use(express.notFound());
app.use(express.errorHandler({ logger }));

app.hooks(appHooks);

module.exports = app;
