import Joi from 'joi';
import Boom from 'boom';
import { addDeviceReading } from '../../data/readings';

export default {
  method: 'POST',
  path: '/api/devices/{id}/readings',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      payload: {
        temperature: Joi.number(),
        humidity: Joi.number(),
        pressure: Joi.number(),
        lux: Joi.number(),
        battery: Joi.number(),
      },
    },
  },
  handler: request => {
    if (request.auth.credentials.device !== request.params.id) {
      return Boom.conflict(
        `Device can add records to only itself (JWT device (${request.auth.credentials.device}) does not match parameter id (${request.params.id}))`
      );
    }
    return addDeviceReading({
      id: request.params.id,
      payload: request.payload,
    });
  },
};
