import Joi from 'joi';
import { getDeviceStatistics } from '../../data/statistics';

export default {
  method: 'GET',
  path: '/api/devices/{id}/statistics',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      query: {
        startTime: Joi.date(),
        endTime: Joi.date(),
      },
    },
  },
  handler: request => {
    return getDeviceStatistics({
      deviceId: request.params.id,
      startTime: request.query.startTime,
      endTime: request.query.endTime,
    });
  },
};
