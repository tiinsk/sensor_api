const knex = require('../knex/knex.js');
var Boom = require('boom');
const { DateTime } = require("luxon");

const getAll = async (localTimeZone, trx, device) => {
  const zone = (localTimeZone || 0)*60;
  const currentDate = new Date();

  const beginningOfDay = DateTime.fromJSDate(currentDate, {zone: zone}).startOf('day');
  const endOfDay = DateTime.fromJSDate(currentDate, {zone: zone}).endOf('day');

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
      'device.disabled',
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
    }).where('device.disabled', false);

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

const getAllReadingsNow = (localTimeZone) => {
  return knex.transaction(async trx => {
    return getAll(localTimeZone, trx);
  });
};

const getAllDeviceReadingsNow = async (localTimeZone, deviceId) => {
  return knex.transaction(async trx => {
    const device = await trx('device').where('id', deviceId).first();

    if(!device) {
      return Boom.notFound(`Device with id ${deviceId} not found`);
    }
    const data = await getAll(localTimeZone, trx, deviceId);
    return data.length > 0 ? data[0]: {};
  });
};

module.exports = {
  getAllReadingsNow,
  getAllDeviceReadingsNow
};
