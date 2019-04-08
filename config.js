module.exports = {
  auth: {
    secret: {
      development: 'bananabanana',
      production: 'change-this-to-something-secure'
    },
    valid_time_in_s: {
      development: 5.184e+6, //60 days
      production: 120 //120 s = 2 min
    }
  },
  hapi: {
    development: {
      port: 3000,
      host: 'localhost',
      debug: { request: ['error'] }
    },
    production: {
      port: 3000,
      host: 'localhost'
    }
  },
  database: {
    production: {
      host: '127.0.0.1',
      database: 'sensordata',
      user: 'CHANGE_THIS',
      password: 'CHANGE_THIS'
    },
    development: {
      host: '127.0.0.1',
      database: 'sensordata',
      user: 'sensor_api',
      password: 'apiapi'
    }
  }
};
