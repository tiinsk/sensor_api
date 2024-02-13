import Boom from 'boom';
import knex from '../knex/knex';
import { ArrayRequestParams } from '../types';

export type DeviceType = 'ruuvi' | 'sensorbug';
export type LocationType = 'inside' | 'outside' | null;

export interface DeviceLocation {
  x: number;
  y: number;
  type: LocationType;
}

export interface Device {
  id: string;
  order: number;
  name: string;
  type: DeviceType;
  location: DeviceLocation;
  disabled: boolean;
}

export const allDeviceFields = [
  'device.id',
  'device.name',
  'device.location_x',
  'device.location_y',
  'device.disabled',
  'device.order',
  'device.type',
  'device.location_type',
];

const dataMapper = device => ({
  id: device.id,
  name: device.name,
  location: {
    x: device.location_x,
    y: device.location_y,
    type: device.location_type,
  },
  disabled: device.disabled,
  order: device.order,
  type: device.type,
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

export const addDevice = async (device: Device) => {
  return knex.transaction(async trx => {
    const existingDevice = await trx('device')
      .where('device.id', device.id)
      .first();

    if (existingDevice) {
      return Boom.conflict(`Device with id ${device.id} already exists`);
    }

    const existingDeviceWithOrder = await trx('device')
      .where('device.order', device.order)
      .first();

    if (existingDeviceWithOrder) {
      return Boom.conflict(`Device with order ${device.order} already exists`);
    }

    const result = await trx('device')
      .insert({
        id: device.id,
        order: device.order,
        name: device.name,
        type: device.type,
        location_x: device.location.x,
        location_y: device.location.y,
        location_type: device.location.type,
        disabled: device.disabled,
      })
      .returning(allDeviceFields);

    return dataMapper(result[0]);
  });
};

export const updateDevice = async (device: Device) => {
  return knex.transaction(async trx => {
    const existingDevice = await trx('device')
      .where('device.id', device.id)
      .first();

    if (!existingDevice) {
      return Boom.conflict(`Device with id ${device.id} doesn't exist`);
    }

    const existingDeviceWithOrder = await trx('device')
      .whereNot('device.id', device.id)
      .andWhere('device.order', device.order)
      .first();

    if (existingDeviceWithOrder) {
      return Boom.conflict(`Device with order ${device.order} already exists`);
    }

    const result = await trx('device')
      .where({ id: device.id })
      .update({
        order: device.order,
        name: device.name,
        type: device.type,
        location_x: device.location.x,
        location_y: device.location.y,
        location_type: device.location.type,
        disabled: device.disabled,
      })
      .returning(allDeviceFields);

    return dataMapper(result[0]);
  });
};
