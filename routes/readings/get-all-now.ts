import Joi from 'joi';
import { getAllReadingsNow } from '../../data/get-all-readings-now';

export default {
  method: 'GET',
  path: '/api/readings/now',
  options: {
    validate: {
      query: {
        localTimeZone: Joi.number().min(-11).max(14).optional(),
      },
    },
  },
  handler: (request, h) => {
    return getAllReadingsNow(request.query.localTimeZone);
  },
};
