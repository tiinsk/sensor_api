const Joi = require('joi');
const Boom = require('boom');
const knex = require('../../knex/knex.js');
const { DateTime } = require('luxon');
const { getAllReadingsNow } = require('../../data/get-all-readings-now');

module.exports = {
  method: 'GET',
  path: '/api/readings/now',
  options: {
    validate: {
      query: {
        localTimeZone: Joi.number().min(-11).max(14).optional(),
      },
    },
  },
  handler: (request, h) => {
    return getAllReadingsNow(request.query.localTimeZone);
  },
};
