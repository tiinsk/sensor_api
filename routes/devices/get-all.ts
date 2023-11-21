import Joi from 'joi';
import knex from '../../knex/knex.js';

export default {
  method: 'GET',
  path: '/api/devices',
  options: {
    validate: {
      query: {
        limit: Joi.number().integer().min(1).max(100).default(100),
        offset: Joi.number().integer().min(0).max(100).default(0),
      },
    },
  },
  handler: async (request, h) => {
    const query = knex('device').where({ disabled: false });

    const totResultCount = await query.clone().count('id');

    const results = await query
      .orderBy('order')
      .limit(request.query.limit)
      .offset(request.query.offset);

    return {
      count: results.length,
      totCount: totResultCount[0]['count'],
      limit: request.query.limit,
      values: results,
    };
  },
};
