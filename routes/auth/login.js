const Joi = require('joi');
var Boom = require('boom');

const knex = require('../../knex/knex.js');
const { sha512 } = require('../../auth/hash-password');

module.exports = {
  method: 'POST',
  path: '/api/login',
  options: {
    auth: false,
    validate: {
      payload: {
        username: Joi.string().required(),
        password: Joi.string().required(),
      },
    },
  },
  handler: async (request, h) => {
    return knex.transaction(async trx => {
      const user = await trx('user')
        .where('username', request.payload.username)
        .first();

      if (!user) {
        return Boom.unauthorized('Unauthorized user');
      }

      const { passwordHash } = sha512(request.payload.password, user.salt);

      if (user.password !== passwordHash || user.disabled) {
        return Boom.unauthorized('Unauthorized user');
      }

      return request.server.methods.jwtSign({
        iat: Date.now(),
        username: user.username,
      });
    });
  },
};
