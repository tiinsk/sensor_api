const config = require('./config');

module.exports = {
  development: {
    client: 'postgresql',
    connection: config.database.development,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: __dirname + '/knex/migrations',
    },
    seeds: {
      directory: __dirname + '/knex/seeds'
    }
  },
  production: {
    client: 'postgresql',
    connection: config.database.production,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  }

};
