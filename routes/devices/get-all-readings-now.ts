import Joi from 'joi';
import { getAllDeviceReadingsNow } from '../../data/get-all-readings-now';

export default {
  method: 'GET',
  path: '/api/devices/{id}/readings/now',
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
    return getAllDeviceReadingsNow(
      request.query.localTimeZone,
      request.params.id
    );
  },
};
