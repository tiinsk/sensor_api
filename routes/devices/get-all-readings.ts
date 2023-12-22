import Joi from 'joi';
import { getAllReadings } from '../../data/devices/readings';

export default {
  method: 'GET',
  path: '/api/devices/readings',
  options: {
    validate: {
      query: {
        limit: Joi.number().integer().min(1).max(500).default(100),
        offset: Joi.number().integer().min(0).default(0),
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        type: Joi.string()
          .valid('temperature', 'humidity', 'pressure')
          .required(),
        level: Joi.string()
          .valid('10 minutes', '30 minute', 'day', 'week', 'month')
          .required(),
      },
    },
  },
  handler: request => {
    return getAllReadings({
      startTime: request.query.startTime,
      endTime: request.query.endTime,
      offset: request.query.offset,
      limit: request.query.limit,
      level: request.query.level,
      type: request.query.type,
    });
  },
};
