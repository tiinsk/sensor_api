import Joi from 'joi';
import { getAllExtremeReadings } from '../../data/get-all-extreme-readings';

export default {
  method: 'GET',
  path: '/api/readings/extremes',
  options: {
    validate: {
      query: {
        localTimeZone: Joi.number().min(-11).max(14).optional(),
      },
    },
  },
  handler: (request, h) => {
    return getAllExtremeReadings(request.query.localTimeZone);
  },
};
