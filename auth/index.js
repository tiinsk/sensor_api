const knex = require('../knex/knex');
const config = require('../config');

/*
payload = {
  device: "some-device-id"
  api_key: "some-api-key"
  iat: "issued-at-timestamp"
}
*/
const validateJWT = async function (request, payload, h) {
  const credentials = payload || {};

  if(!payload.api_key) {
    return {isValid: false, credentials: null}
  }

  const valid_time = config.auth.valid_time_in_s[process.env.NODE_ENV];

  console.log(Date.now() - payload.iat);

  if(!payload.iat || typeof payload.iat !== 'number'  || Date.now() - payload.iat > valid_time*1000) {
    return {isValid: false, credentials: null}
  }

  const auth = await knex('auth').where('api_key', payload.api_key).first();


  if(!auth) {
    return {isValid: false, credentials: null}
  }

  if((payload.device || auth.device) && payload.device !== auth.device) {
    return {isValid: false, credentials: null}
  }

  return {
    isValid: true,
    credentials
  }
};

module.exports = {
  validateJWT
};
