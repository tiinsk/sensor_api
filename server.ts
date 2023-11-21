import Hapi from '@hapi/hapi';
import HapiJWT from 'hapi-jsonwebtoken';
import Joi from 'joi';

import routes from './routes';
import { validateJWT } from './auth';
import config from './config';

const server = Hapi.server(config.hapi[process.env.NODE_ENV]);

const init = async () => {
  await server.register(HapiJWT.plugin);

  server.auth.strategy('jwt', 'hapi-jsonwebtoken', {
    secretOrPrivateKey: config.auth.secret[process.env.NODE_ENV],
    getToken: request => {
      return request.headers.authorization;
    },
    validate: validateJWT,
  });

  server.auth.default('jwt');
  server.validator(Joi);
  server.route(routes);

  await server.start();
  console.log(`Server running at: ${server.info.uri}`);
};

process.on('unhandledRejection', err => {
  console.log(err);
  process.exit(1);
});

init();
