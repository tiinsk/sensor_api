import Joi from 'joi';
import { getDevice } from '../../data/devices';

export default {
  method: 'GET',
  path: '/api/devices/{id}',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
    },
  },
  handler: async ({ params }: { params: { id: string } }) =>
    getDevice(params.id),
};
