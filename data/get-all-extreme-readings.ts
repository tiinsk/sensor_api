import Boom from 'boom';
import { DateTime } from 'luxon';
import knex from '../knex/knex';

export const getAll = async (localTimeZone, trx, device = undefined) => {
  const zone = (localTimeZone || 0) * 60;
  const currentDate = new Date();

  const beginningOfDay = DateTime.fromJSDate(currentDate, {
    zone,
  }).startOf('day');
  const endOfDay = DateTime.fromJSDate(currentDate, { zone }).endOf('day');

  //Transform mo 1 -> 0 and su 7 -> 1
  const weekday = beginningOfDay.weekday - 1;

  const beginningOfWeek = beginningOfDay.plus({ days: -weekday });
  const endOfWeek = endOfDay.plus({ days: -weekday + 6 });

  const beginningOfMonth = DateTime.fromJSDate(currentDate, {
    zone,
  }).startOf('month');
  const endOfMonth = DateTime.fromJSDate(currentDate, { zone }).endOf('month');

  const minMaxWeekQuery = trx('reading')
    .select(['device'])
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
    .select(['device'])
    .where('created_at', '>=', beginningOfMonth)
    .andWhere('created_at', '<=', endOfMonth)
    .max('temperature as max_temperature_month')
    .min('temperature as min_temperature_month')
    .max('humidity as max_humidity_month')
    .min('humidity as min_humidity_month')
    .max('pressure as max_pressure_month')
    .min('pressure as min_pressure_month')
    .groupBy('device');

  if (device) {
    minMaxWeekQuery.where('device', device);
    minMaxMonthQuery.where('device', device);
  }

  const [minMaxWeek, minMaxMonth] = await Promise.all([
    await minMaxWeekQuery,
    await minMaxMonthQuery,
  ]);

  const minMaxWeekByDevice = minMaxWeek.reduce((acc, cur) => {
    acc[cur.device] = cur;
    return acc;
  }, {});

  return minMaxMonth.map(device => {
    return {
      ...device,
      ...minMaxWeekByDevice[device.device],
    };
  });
};

export const getAllExtremeReadings = localTimeZone => {
  return knex.transaction(async trx => {
    return getAll(localTimeZone, trx);
  });
};

export const getAllDeviceExtremeReadings = async (localTimeZone, deviceId) => {
  return knex.transaction(async trx => {
    const device = await trx('device').where('id', deviceId).first();

    if (!device) {
      return Boom.notFound(`Device with id ${deviceId} not found`);
    }
    const data = await getAll(localTimeZone, trx, deviceId);
    return data.length > 0 ? data[0] : {};
  });
};
