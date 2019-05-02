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
        localTime: Joi.date().optional()
      }
    }
  },
  handler: (request, h) => {
    return getAllDeviceExtremeReadings(request.query.localTime, request.params.id);
  }
};
