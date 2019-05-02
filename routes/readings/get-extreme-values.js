const { getAllExtremeReadings } =  require("../../data/get-all-extreme-readings");

const Joi = require('joi');

module.exports = {
  method: 'GET',
  path: '/api/readings/extremes',
  options: {
    validate: {
      query: {
        localTime: Joi.date().optional()
      }
    }
  },
  handler: (request, h) => {
    return getAllExtremeReadings(request.query.localTime);
  }
};
