import Boom from 'boom';
import knex from '../../knex/knex';
import { ArrayRequestParams } from '../../types';

const allLatestReadingFields = [
  'device.id',
  'device.name',
  'device.location_type',
  'device.sensor_info',
  'reading.id as reading_id',
  'reading.temperature',
  'reading.humidity',
  'reading.pressure',
  'reading.battery',
  'reading.created_at',
];

const dataMapper = device => ({
  id: device.id,
  order: device.order,
  name: device.name,
  sensor_info: device.sensor_info,
  location_type: device.location_type,
  reading: {
    id: device.reading_id,
    battery: device.battery,
    created_at: device.created_at,
    humidity: device.humidity,
    pressure: device.pressure,
    temperature: device.temperature,
  },
});

const getAll = (trx, device = undefined) => {
  const mostRecentQuery = trx('device')
    .where('device.disabled', false)
    .leftJoin('reading', function () {
      this.on('device.latest_reading', '=', 'reading.id');
    });

  if (device) {
    mostRecentQuery.where('device.id', device);
  }

  return mostRecentQuery;
};

export const getAllLatestReadings = (params: ArrayRequestParams) => {
  return knex.transaction(async trx => {
    const query = getAll(trx, undefined);

    const totResultCount = await query.clone().count('*');

    const results = await query
      .select(allLatestReadingFields)
      .orderBy('device.order')
      .limit(params.limit)
      .offset(params.offset);

    return {
      count: results.length,
      totCount: parseInt(totResultCount[0]['count']),
      limit: params.limit,
      values: results.map(dataMapper),
    };
  });
};

export const getDeviceLatestReading = async deviceId => {
  return knex.transaction(async trx => {
    const deviceData = await getAll(trx, deviceId)
      .select(allLatestReadingFields)
      .first();

    if (!deviceData) {
      return Boom.notFound(`Device with id ${deviceId} not found`);
    }
    return dataMapper(deviceData);
  });
};
