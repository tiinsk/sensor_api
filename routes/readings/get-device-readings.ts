import Joi from 'joi';
import { getDeviceReadings } from '../../data/readings';

export default {
  method: 'GET',
  path: '/api/devices/{id}/readings',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      query: {
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        types: Joi.array()
          .items(
            Joi.string().valid(
              'temperature',
              'humidity',
              'pressure',
              'lux',
              'battery'
            )
          )
          .single()
          .required(),
        level: Joi.string()
          .valid('10 minutes', '30 minutes', 'day', 'week', 'month')
          .required(),
      },
    },
  },
  handler: request => {
    return getDeviceReadings({
      startTime: request.query.startTime,
      endTime: request.query.endTime,
      level: request.query.level,
      types: request.query.types,
      deviceId: request.params.id,
    });
  },
};
