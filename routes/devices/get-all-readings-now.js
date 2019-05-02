const Joi = require('joi');
const { getAllDeviceReadingsNow } = require('../../data/get-all-readings-now');

module.exports = {
  method: 'GET',
  path: '/api/devices/{id}/readings/now',
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
    return getAllDeviceReadingsNow(request.query.localTime, request.params.id);
  }
};
