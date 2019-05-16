const { getAllExtremeReadings } =  require("../../data/get-all-extreme-readings");

const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/api/readings/extremes',
  options: {
    validate: {
      query: {
        localTimeZone: Joi.number().min(-11).max(14).optional()
      }
    }
  },
  handler: (request, h) => {
    return getAllExtremeReadings(request.query.localTimeZone);
  }
};
