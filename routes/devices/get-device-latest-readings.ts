import Joi from 'joi';
import { getDeviceLatestReading } from '../../data/devices/latest-reading';

export default {
  method: 'GET',
  path: '/api/devices/{id}/latest-readings',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
    },
  },
  handler: request => {
    return getDeviceLatestReading(request.params.id);
  },
};
