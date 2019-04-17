const Joi = require('joi');
const Boom = require('boom');
const knex = require('../../knex/knex.js');
const dateFns = require('date-fns');

module.exports = {
  method: 'GET',
  path: '/api/readings/extremes',
  options: {
    validate: {
      query: {
        localTime: Joi.date().optional()
      }
    }
  },
  handler: async (request, h) => {
    const time = request.query.localTime || new Date();

    const beginningOfWeek = dateFns.startOfWeek(time, {weekStartsOn: 1});
    const endOfWeek = dateFns.endOfWeek(time, {weekStartsOn: 1});

    const beginningOfMonth = dateFns.startOfMonth(time);
    const endOfMonth = dateFns.endOfMonth(time);

    const minMaxWeek = await knex('reading')
      .select([
        'device',
      ])
      .where('created_at', '>=', beginningOfWeek)
      .andWhere('created_at', '<=', endOfWeek)
      .max('temperature as max_temperature_week')
      .min('temperature as min_temperature_week')
      .max('humidity as max_humidity_week')
      .min('humidity as min_humidity_week')
      .max('pressure as max_pressure_week')
      .min('pressure as min_pressure_week')
      .groupBy('device');

    const minMaxMonth = await knex('reading')
      .select([
        'device',
      ])
      .where('created_at', '>=', beginningOfMonth)
      .andWhere('created_at', '<=', endOfMonth)
      .max('temperature as max_temperature_month')
      .min('temperature as min_temperature_month')
      .max('humidity as max_humidity_month')
      .min('humidity as min_humidity_month')
      .max('pressure as max_pressure_month')
      .min('pressure as min_pressure_month')
      .groupBy('device');

    const minMaxWeekByDevice = minMaxWeek.reduce((acc, cur) => {
      acc[cur.device] = cur;
      return acc;
    }, {});

    return minMaxMonth.map(device => {
      return {
        ...device,
        ...minMaxWeekByDevice[device.device]
      }
    });

  }
};
