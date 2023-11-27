import knex from '../knex/knex';

import config from '../config';

/*
payload = {
  device: "some-device-id"
  api_key: "some-api-key"
  iat: "issued-at-timestamp"
}
*/
export const validateJWT = async function (request, payload, h) {
  const credentials = payload || {};

  if (payload.username) {
    const user_valid_time =
      config.auth.user_valid_time_in_s[process.env.NODE_ENV];

    if (
      !payload.iat ||
      typeof payload.iat !== 'number' ||
      Date.now() - payload.iat > user_valid_time * 1000
    ) {
      return { isValid: false, credentials: null };
    }
    const user = await knex('user').where('username', payload.username).first();
    if (!user || user.disabled) {
      return { isValid: false, credentials: null };
    }
    return {
      isValid: true,
      credentials,
    };
  }

  if (!payload.api_key) {
    return { isValid: false, credentials: null };
  }

  const valid_time = config.auth.valid_time_in_s[process.env.NODE_ENV];

  if (
    !payload.iat ||
    typeof payload.iat !== 'number' ||
    Date.now() - payload.iat > valid_time * 1000
  ) {
    return { isValid: false, credentials: null };
  }

  const auth = await knex('auth').where('api_key', payload.api_key).first();

  if (!auth) {
    return { isValid: false, credentials: null };
  }

  return {
    isValid: true,
    credentials,
  };
};
