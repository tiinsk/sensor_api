const Joi = require('joi');
var Boom = require('boom');
const knex = require('../../knex/knex.js');
const dateFns = require('date-fns');

module.exports = {
  method: 'GET',
  path: '/api/readings/now',
  options: {
    validate: {
      query: {
        localTime: Joi.date().optional()
      }
    }
  },
  handler: async (request, h) => {
    const time = request.query.localTime || new Date();
    const beginningOfDay = dateFns.startOfDay(time);
    const endOfDay = dateFns.endOfDay(time);

    const mostRecent = await knex('reading')
      .select([
        'id',
        'temperature',
        'humidity',
        'pressure',
        'lux',
        'battery',
        'created_at',
        'reading.device'
      ])
      .innerJoin(function() {
          this.from('reading').select([
            'device',
          ])
            .max('created_at as max_created_at')
            .groupBy('device')
            .as('max_reading')
        }, function(){ this.on('max_reading.device', '=', 'reading.device').andOn('max_reading.max_created_at', '=', 'reading.created_at')});

    const minMax = await knex('reading')
      .select([
        'device',
      ])
      .where('created_at', '>=', beginningOfDay)
      .andWhere('created_at', '<=', endOfDay)
      .max('temperature as max_temperature')
      .min('temperature as min_temperature')
      .groupBy('device');

    const minMaxByDevice = minMax.reduce((acc, cur) => {
      acc[cur.device] = cur;
      return acc;
    }, {});

    return mostRecent.map(device => {
      return {
        ...device,
        max_temperature: minMaxByDevice[device.device].max_temperature,
        min_temperature: minMaxByDevice[device.device].min_temperature
      }
    });

  }
};
