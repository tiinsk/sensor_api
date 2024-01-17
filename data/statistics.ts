import knex from '../knex/knex';
import { ArrayRequestParams } from '../types';
import { getAll as getAllDevicesQuery } from './devices';
import Boom from '@hapi/boom';
import { Knex } from 'knex';

const dataMapper = (deviceId, statistics) => ({
  id: deviceId,
  statistics: {
    temperature: {
      avg: statistics?.avg_temperature || null,
      min: statistics?.min_temperature || null,
      max: statistics?.max_temperature || null,
    },
    humidity: {
      avg: statistics?.avg_humidity || null,
      min: statistics?.min_humidity || null,
      max: statistics?.max_humidity || null,
    },
    pressure: {
      avg: statistics?.avg_pressure || null,
      min: statistics?.min_pressure || null,
      max: statistics?.max_pressure || null,
    },
  },
});

const getAll = (
  trx: Knex.Transaction,
  params: {
    startTime: string;
    endTime: string;
    deviceIds?: string[];
  }
) => {
  const query = trx('reading')
    .select(['device'])
    .where('created_at', '>=', params.startTime)
    .andWhere('created_at', '<=', params.endTime)
    .max('temperature as max_temperature')
    .min('temperature as min_temperature')
    .max('humidity as max_humidity')
    .min('humidity as min_humidity')
    .max('pressure as max_pressure')
    .min('pressure as min_pressure')
    .avg('temperature as avg_temperature')
    .avg('humidity as avg_humidity')
    .avg('pressure as avg_pressure')
    .groupBy('device');

  if (params.deviceIds) {
    query.whereIn('device', params.deviceIds);
  }

  return query;
};

export const getAllStatistics = (
  params: {
    startTime: string;
    endTime: string;
  } & ArrayRequestParams
) => {
  return knex.transaction(async trx => {
    const devicesQuery = getAllDevicesQuery(trx, false);

    const totResultCount = await devicesQuery.clone().count('*');

    const devicesResult = await devicesQuery
      .select(['device.id'])
      .orderBy('device.order')
      .limit(params.limit)
      .offset(params.offset);

    const deviceIds = devicesResult.map(device => device.id);

    const statisticsResult = await getAll(trx, {
      ...params,
      deviceIds: deviceIds,
    });

    const statisticsByDevice = statisticsResult.reduce((acc, cur) => {
      acc[cur.device] = cur;
      return acc;
    }, {});

    return {
      count: devicesResult.length,
      totCount: parseInt(totResultCount[0]['count']),
      limit: params.limit,
      values: devicesResult.map(device =>
        dataMapper(device.id, statisticsByDevice?.[device.id])
      ),
    };
  });
};

export const getDeviceStatistics = async (params: {
  startTime: string;
  endTime: string;
  deviceId: string;
}) => {
  return knex.transaction(async trx => {
    const deviceResult = await getAllDevicesQuery(trx, params.deviceId).first();

    if (!deviceResult) {
      return Boom.notFound(`Device with id ${params.deviceId} not found`);
    }

    const statisticsResult = await getAll(trx, {
      ...params,
      deviceIds: [params.deviceId],
    }).first();

    return dataMapper(params.deviceId, statisticsResult);
  });
};
