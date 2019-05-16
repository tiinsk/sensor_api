const Joi = require('joi');
const { getAllDeviceExtremeReadings } = require('../../data/get-all-extreme-readings');

module.exports = {
  method: 'GET',
  path: '/api/devices/{id}/readings/extremes',
  options: {
    validate: {
      params: {
        id: Joi
          .string()
          .required()
      },
      query: {
        localTimeZone: Joi.number().min(-11).max(14).optional()
      }
    }
  },
  handler: (request, h) => {
    return getAllDeviceExtremeReadings(request.query.localTimeZone, request.params.id);
  }
};
