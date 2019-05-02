const knex = require('../knex/knex.js');
var Boom = require('boom');
const { DateTime } = require("luxon");

const getAll = async (localTime, trx, device) => {
  const time = localTime || new Date();

  const beginningOfDay = DateTime.fromJSDate(time).startOf('day');
  const endOfDay = DateTime.fromJSDate(time).endOf('day');

  //Transform mo 1 -> 0 and su 7 -> 1
  const weekday = beginningOfDay.weekday-1;

  const beginningOfWeek = beginningOfDay.plus({days: -weekday});
  const endOfWeek = endOfDay.plus({days: -weekday+6});

  const beginningOfMonth = DateTime.fromJSDate(time).startOf('month');
  const endOfMonth = DateTime.fromJSDate(time).endOf('month');

  const minMaxWeekQuery = trx('reading')
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

  const minMaxMonthQuery = trx('reading')
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

  if(device) {
    minMaxWeekQuery.where('device', device);
    minMaxMonthQuery.where('device', device);
  }

  const [minMaxWeek, minMaxMonth] = await Promise.all([
    await minMaxWeekQuery,
    await minMaxMonthQuery
  ]);

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
};

const getAllExtremeReadings = (localTime) => {
  return knex.transaction(async trx => {
    return getAll(localTime, trx);
  });
};

const getAllDeviceExtremeReadings = async (localTime, deviceId) => {
  return knex.transaction(async trx => {
    const device = await trx('device').where('id', deviceId).first();

    if(!device) {
      return Boom.notFound(`Device with id ${deviceId} not found`);
    }
    return (await getAll(localTime, trx, deviceId))[0];
  });
};

module.exports = {
  getAllExtremeReadings,
  getAllDeviceExtremeReadings
};
