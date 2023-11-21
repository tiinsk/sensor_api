export default {
  auth: {
    secret: {
      development: 'bananabanana',
      production: 'change-this-to-something-secure',
    },
    valid_time_in_s: {
      development: 5.184e6, //60 days
      production: 120, //120 s = 2 min
    },
    user_valid_time_in_s: {
      development: 5.184e6, //60 days
      production: 5.184e6, //60 days
    },
  },
  hapi: {
    development: {
      port: 3030,
      host: 'localhost',
      debug: { request: ['*'], log: ['*'] },
      routes: {
        cors: false,
      },
    },
    production: {
      port: 3000,
      host: 'localhost',
    },
  },
  database: {
    production: {
      host: '127.0.0.1',
      database: 'sensordata',
      user: 'CHANGE_THIS',
      password: 'CHANGE_THIS',
    },
    development: {
      host: '127.0.0.1',
      port: 5432,
      database: 'sensordata',
      user: 'tiina.koskiranta',
      //password: '',
    },
  },
};
