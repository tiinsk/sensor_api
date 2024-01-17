import Boom from 'boom';
import knex from '../knex/knex';
import { ArrayRequestParams } from '../types';

export const allDeviceFields = [
  'device.id',
  'device.name',
  'device.location_x',
  'device.location_y',
  'device.disabled',
];

const dataMapper = device => ({
  id: device.id,
  name: device.name,
  location: { x: device.location_x, y: device.location_y },
  disabled: device.disabled,
});

export const getAll = (trx, includeDisabled, device = undefined) => {
  const deviceQuery = trx('device');

  if (!includeDisabled) {
    deviceQuery.where('device.disabled', false);
  }

  if (device) {
    deviceQuery.where('device.id', device);
  }

  return deviceQuery;
};

export const getAllDevices = (
  params: ArrayRequestParams & { includeDisabled: boolean }
) => {
  return knex.transaction(async trx => {
    const query = getAll(trx, params.includeDisabled, undefined);

    const totResultCount = await query.clone().count('*');

    const results = await query
      .select(allDeviceFields)
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

export const getDevice = async (deviceId, includeDisabled = false) => {
  return knex.transaction(async trx => {
    const deviceData = await getAll(trx, includeDisabled, deviceId)
      .select(allDeviceFields)
      .first();

    if (!deviceData) {
      return Boom.notFound(`Device with id ${deviceId} not found`);
    }
    return dataMapper(deviceData);
  });
};
