import { getAllLatestReadings } from '../../data/devices/latest-readings';
import Joi from 'joi';
import { ArrayRequestParams } from '../../types';

export default {
  method: 'GET',
  path: '/api/devices/latest-readings',
  options: {
    validate: {
      query: {
        limit: Joi.number().integer().min(1).max(100).default(100),
        offset: Joi.number().integer().min(0).max(100).default(0),
      },
    },
  },
  handler: async (request: { query: ArrayRequestParams }) => {
    return getAllLatestReadings(request.query);
  },
};
