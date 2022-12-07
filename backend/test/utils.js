const url = require('url');

module.exports = function (app) {
  const port = app.get('port') || 8998;

  return {
    port: port,
    getUrl: (pathname, query) =>
      url.format({
        hostname: app.get('host') || 'localhost',
        protocol: 'http',
        port,
        pathname,
        query
      }),
  };
};
