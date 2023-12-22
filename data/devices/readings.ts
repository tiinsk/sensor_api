import knex from '../../knex/knex';
import { ArrayRequestParams } from '../../types';
import { getAll as getAllDevicesQuery } from './index';
import Boom from '@hapi/boom';
import { Knex } from 'knex';

export type ReadingType = 'temperature' | 'humidity' | 'pressure';
export type TimePeriod = 'day' | 'week' | 'month' | 'year';
export type TimeLevel = '10 minutes' | '30 minutes' | 'day' | 'week' | 'month';

const dataMapper = (deviceIds, results) => {
  return deviceIds.map((deviceId, i) => {
    return {
      id: deviceId,
      values: results[i],
    };
  });
};

const typeMapper = (types: ReadingType[], results) => {
  return types.map((type, i) => {
    return {
      type: type,
      values: results[i],
    };
  });
};

const getAll = (
  trx: Knex.Transaction,
  params: {
    startTime: string;
    endTime: string;
    type: ReadingType;
    level: TimeLevel;
    deviceId: string;
  }
) => {
  const rawTrunc = trx.raw(
    `date_trunc('${params.level}', created_at, 'Europe/Helsinki') as time`
  );

  const rawBin = trx.raw(
    `date_bin('30 minutes', created_at, '2000-01-01') as time`
  );

  const selector = ['30 minutes', '10 minutes'].includes(params.level)
    ? rawBin
    : rawTrunc;

  const query = trx('reading')
    .select([selector])
    .avg(params.type)
    .where('created_at', '>=', params.startTime)
    .andWhere('created_at', '<=', params.endTime)
    .max(`${params.type} as max`)
    .min(`${params.type} as min`)
    .groupBy('time')
    .orderBy('time', 'asc');

  if (params.deviceId) {
    query.where('device', params.deviceId);
  }

  return query;
};

export const getAllReadings = (
  params: {
    startTime: string;
    endTime: string;
    type: ReadingType;
    level: TimeLevel;
  } & ArrayRequestParams
) => {
  return knex.transaction(async trx => {
    const devicesQuery = getAllDevicesQuery(trx);

    const totResultCount = await devicesQuery.clone().count('*');

    const devicesResult = await devicesQuery
      .select(['device.id'])
      .orderBy('device.order')
      .limit(params.limit)
      .offset(params.offset);

    const deviceIds = devicesResult.map(device => device.id);

    const results = await Promise.all(
      deviceIds.map(deviceId => getAll(trx, { ...params, deviceId }))
    );

    return {
      count: devicesResult.length,
      totCount: parseInt(totResultCount[0]['count']),
      limit: params.limit,
      values: dataMapper(deviceIds, results),
    };
  });
};

export const getDeviceReadings = async (params: {
  startTime: string;
  endTime: string;
  types: ReadingType[];
  level: TimeLevel;
  deviceId: string;
}) => {
  return knex.transaction(async trx => {
    const deviceResult = await getAllDevicesQuery(trx, params.deviceId).first();

    if (!deviceResult) {
      return Boom.notFound(`Device with id ${params.deviceId} not found`);
    }

    const results = await Promise.all(
      params.types.map(type => getAll(trx, { ...params, type }))
    );

    return {
      id: params.deviceId,
      values: typeMapper(params.types, results),
    };
  });
};
