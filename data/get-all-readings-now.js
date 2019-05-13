const knex = require('../knex/knex.js');
var Boom = require('boom');
const { DateTime } = require("luxon");

const getAll = async (localTime, trx, device) => {
  const time = localTime || new Date();
  const beginningOfDay = DateTime.fromJSDate(time).startOf('day');
  const endOfDay = DateTime.fromJSDate(time).endOf('day');

  const mostRecentQuery = trx('reading')
    .select([
      'reading.id',
      'reading.temperature',
      'reading.humidity',
      'reading.pressure',
      'reading.lux',
      'reading.battery',
      'reading.created_at',
      'reading.device',
      'device.name',
      'device.location_type',
      'device.sensor_info'
    ])
    .leftJoin('device', 'reading.device', 'device.id')
    .innerJoin(function () {
      this.from('reading').select([
        'device',
      ])
        .max('created_at as max_created_at')
        .groupBy('device')
        .as('max_reading')
    }, function () {
      this.on('max_reading.device', '=', 'reading.device').andOn('max_reading.max_created_at', '=', 'reading.created_at')
    });

  const minMaxQuery = trx('reading')
    .select([
      'device',
    ])
    .where('created_at', '>=', beginningOfDay)
    .andWhere('created_at', '<=', endOfDay)
    .max('temperature as max_temperature')
    .min('temperature as min_temperature')
    .groupBy('device');

  if(device) {
    mostRecentQuery.where('reading.device', device);
    minMaxQuery.where('reading.device', device);
  }

  const mostRecent = await mostRecentQuery;
  const minMax = await  minMaxQuery;

  const minMaxByDevice = minMax.reduce((acc, cur) => {
    acc[cur.device] = cur;
    return acc;
  }, {});

  return mostRecent.map(device => {
    return {
      ...device,
      max_temperature: minMaxByDevice[device.device] ? minMaxByDevice[device.device].max_temperature : null,
      min_temperature: minMaxByDevice[device.device] ? minMaxByDevice[device.device].min_temperature : null
    }
  })
};

const getAllReadingsNow = (localTime) => {
  return knex.transaction(async trx => {
    return getAll(localTime, trx);
  });
};

const getAllDeviceReadingsNow = async (localTime, deviceId) => {
  return knex.transaction(async trx => {
    const device = await trx('device').where('id', deviceId).first();

    if(!device) {
      return Boom.notFound(`Device with id ${deviceId} not found`);
    }
    const data = await getAll(localTime, trx, deviceId);
    return data.length > 0 ? data[0]: {};
  });
};

module.exports = {
  getAllReadingsNow,
  getAllDeviceReadingsNow
};
