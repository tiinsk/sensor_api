const Joi = require('joi');
var Boom = require('Boom');
const knex = require('../../knex/knex.js');

module.exports = {
  method: 'GET',
  path: '/api/readings/now',
  options: {
    /*validate: {
      query: {

      }
    }*/
  },
  handler: async (request, h) => {
    return await knex('reading')
      .select([
        'id',
        'temperature',
        'humidity',
        'pressure',
        'lux',
        'battery',
        'created_at',
        'reading.device'
      ])
      .innerJoin(function() {
          this.from('reading').select([
            'device',
          ])
            .max('created_at as max_created_at')
            .groupBy('device')
            .as('max_reading')
        }, function(){ this.on('max_reading.device', '=', 'reading.device').andOn('max_reading.max_created_at', '=', 'reading.created_at')});
  }
};
