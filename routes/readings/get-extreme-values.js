const Joi = require('joi');
const Boom = require('boom');
const knex = require('../../knex/knex.js');
const { DateTime } = require("luxon");

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

    const beginningOfDay = DateTime.fromJSDate(time).startOf('day');
    const endOfDay = DateTime.fromJSDate(time).endOf('day');

    //Transform mo 1 -> 0 and su 7 -> 1
    const weekday = beginningOfDay.weekday-1;

    const beginningOfWeek = beginningOfDay.plus({days: -weekday});
    const endOfWeek = endOfDay.plus({days: -weekday});

    const beginningOfMonth = DateTime.fromJSDate(time).startOf('month');
    const endOfMonth = DateTime.fromJSDate(time).endOf('month');

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
