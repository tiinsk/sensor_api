const Joi = require('joi');
var Boom = require('boom');
const knex = require('../../knex/knex.js');

module.exports = {
  method: 'GET',
  path: '/api/devices/{id}/readings',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      query: {
        limit: Joi.number().integer().min(1).max(500).default(100),
        offset: Joi.number().integer().min(0).default(0),
        start: Joi.date().optional(),
        end: Joi.date().optional(),
        include: Joi.array()
          .items(
            Joi.string().valid(
              'temperature',
              'humidity',
              'pressure',
              'lux',
              'battery'
            )
          )
          .single()
          .required(),
      },
    },
  },
  handler: (request, h) => {
    return knex.transaction(async trx => {
      const device = await trx('device').where('id', request.params.id).first();

      if (!device) {
        return Boom.notFound(`Device with id ${request.params.id} not found`);
      }

      const query = trx('reading').where('device', request.params.id);

      if (request.query.start) {
        query.andWhere('created_at', '>=', request.query.start);
      }

      if (request.query.end) {
        query.andWhere('created_at', '<=', request.query.end);
      }

      const totResultCount = await query.clone().count('id');

      const results = await query
        .select([...request.query.include, 'id', 'created_at'])
        .orderBy('created_at')
        .limit(request.query.limit)
        .offset(request.query.offset);

      return {
        count: results.length,
        totCount: totResultCount[0]['count'],
        limit: request.query.limit,
        values: results,
      };
    });
  },
};
