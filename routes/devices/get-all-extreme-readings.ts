import Joi from 'joi';
import { getAllDeviceExtremeReadings } from '../../data/get-all-extreme-readings';

export default {
  method: 'GET',
  path: '/api/devices/{id}/readings/extremes',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      query: {
        localTimeZone: Joi.number().min(-11).max(14).optional(),
      },
    },
  },
  handler: (request, h) => {
    return getAllDeviceExtremeReadings(
      request.query.localTimeZone,
      request.params.id
    );
  },
};
