'use strict';

const Hapi = require('@hapi/hapi');
const HapiJWT = require('hapi-jsonwebtoken');
const Joi = require('joi');

const routes = require('./routes');
const config = require('./config');
const auth = require('./auth');

const server = Hapi.server(config.hapi[process.env.NODE_ENV]);

const init = async () => {

  await server.register(HapiJWT.plugin);

  server.auth.strategy('jwt', 'hapi-jsonwebtoken', {
    secretOrPrivateKey: config.auth.secret[process.env.NODE_ENV],
    getToken: (request) => {
      return request.headers.authorization;
    },
    validate: auth.validateJWT
  });

  server.auth.default('jwt');
  server.validator(Joi);
  server.route(routes);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', (err) => {

  console.log(err);
  process.exit(1);
});

init();
