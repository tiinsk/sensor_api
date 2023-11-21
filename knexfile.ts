import path from 'path';
import config from './config';

export default {
  development: {
    client: 'postgresql',
    connection: config.database.development,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: path.join(__dirname, '/knex/migrations'),
    },
    seeds: {
      directory: path.join(__dirname, '/knex/seeds'),
    },
  },
  production: {
    client: 'postgresql',
    connection: config.database.production,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: path.join(__dirname, '/knex/migrations'),
    },
    seeds: {
      directory: path.join(__dirname, '/knex/seeds'),
    },
  },
};
