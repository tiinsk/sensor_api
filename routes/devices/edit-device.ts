import Joi from 'joi';
import { updateDevice } from '../../data/devices';

export default {
  method: 'PUT',
  path: '/api/devices/{id}',
  options: {
    validate: {
      params: {
        id: Joi.string().required(),
      },
      payload: {
        order: Joi.number().required(),
        name: Joi.string().required(),
        type: Joi.string().valid('ruuvi', 'sensorbug').required(),
        location: Joi.object()
          .keys({
            x: Joi.number().required(),
            y: Joi.number().required(),
            type: Joi.string()
              .allow(null)
              .valid('inside', 'outside')
              .required(),
          })
          .required(),
        disabled: Joi.bool().default(true),
      },
    },
  },
  handler: request => {
    return updateDevice({
      id: request.params.id,
      order: request.payload.order,
      name: request.payload.name,
      type: request.payload.type,
      location: request.payload.location,
      disabled: request.payload.disabled,
    });
  },
};
