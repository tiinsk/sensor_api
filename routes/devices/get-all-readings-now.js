const Joi = require('joi');
const { getAllDeviceReadingsNow } = require('../../data/get-all-readings-now');

module.exports = {
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
