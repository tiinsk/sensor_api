import Joi from 'joi';
import Boom from 'boom';
import knex from '../../knex/knex.js';

export default {
  method: 'POST',
  path: '/api/devices/{id}/readings',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      payload: {
        temperature: Joi.number(),
        humidity: Joi.number(),
        pressure: Joi.number(),
        lux: Joi.number(),
        battery: Joi.number(),
        created_at: Joi.date().optional(),
      },
    },
  },
  handler: (request, h) => {
    if (request.auth.credentials.device !== request.params.id) {
      return Boom.conflict(
        `Device can add records to only itself (JWT device (${request.auth.credentials.device}) does not match parameter id (${request.params.id}))`
      );
    }

    return knex.transaction(async trx => {
      const device = await trx('device').where('id', request.params.id).first();

      if (!device) {
        return Boom.notFound(`Device with id ${request.params.id} not found`);
      }

      const result = await trx('reading')
        .insert({
          device: request.params.id,
          temperature: request.payload.temperature,
          humidity: request.payload.humidity,
          pressure: request.payload.pressure,
          lux: request.payload.lux,
          battery: request.payload.battery,
          created_at: request.payload.created_at,
        })
        .returning([
          'id',
          'temperature',
          'humidity',
          'pressure',
          'lux',
          'battery',
          'created_at',
        ]);

      return result[0];
    });
  },
};
