import Joi from 'joi';
import { getAllStatistics } from '../../data/devices/statistics';

export default {
  method: 'GET',
  path: '/api/devices/statistics',
  options: {
    validate: {
      query: {
        limit: Joi.number().integer().min(1).max(500).default(100),
        offset: Joi.number().integer().min(0).default(0),
        startTime: Joi.date(),
        endTime: Joi.date(),
      },
    },
  },
  handler: request => {
    return getAllStatistics({
      limit: request.query.limit,
      offset: request.query.offset,
      startTime: request.query.startTime,
      endTime: request.query.endTime,
    });
  },
};
