import Joi from 'joi';
import { addDevice } from '../../data/devices';

export default {
  method: 'POST',
  path: '/api/devices',
  options: {
    validate: {
      payload: {
        id: Joi.string().length(12).required(),
        order: Joi.number().required(),
        name: Joi.string().required(),
        type: Joi.string().valid('ruuvi', 'sensorbug').required(),
        location: Joi.object()
          .keys({
            x: Joi.number().required(),
            y: Joi.number().required(),
          })
          .required(),
        disabled: Joi.bool().default(true),
      },
    },
  },
  handler: request => {
    return addDevice({
      id: request.payload.id,
      order: request.payload.order,
      name: request.payload.name,
      type: request.payload.type,
      location: request.payload.location,
      disabled: request.payload.disabled,
    });
  },
};
