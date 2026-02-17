/**
 * DELETE /api/devices/:id
 * Delete a device and all its readings (CASCADE)
 */

import Joi from 'joi';
import { deleteDevice } from '../../data/devices';

export default {
  method: 'DELETE' as const,
  path: '/api/devices/{id}',
  options: {
    validate: {
      params: Joi.object({
        id: Joi.string().required(),
      }),
    },
  },
  handler: request => deleteDevice(request.params.id),
};
