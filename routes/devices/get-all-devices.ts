import Joi from 'joi';
import { ArrayRequestParams } from '../../types';
import { getAllDevices } from '../../data/devices';

export default {
  method: 'GET',
  path: '/api/devices',
  options: {
    validate: {
      query: {
        limit: Joi.number().integer().min(1).max(100).default(100),
        offset: Joi.number().integer().min(0).max(100).default(0),
      },
    },
  },
  handler: async ({ query }: { query: ArrayRequestParams }) =>
    getAllDevices({ limit: query.limit, offset: query.offset }),
};
