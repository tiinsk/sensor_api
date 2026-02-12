import type { Knex } from 'knex';
import config from './config.js';

const knexConfig: { [key: string]: Knex.Config } = {
  development: {
    client: 'postgresql',
    connection: config.database.development,
    pool: {
      min: 2,
      max: 10,
    },
    migrations: {
      directory: './knex/migrations',
    },
    seeds: {
      directory: './knex/seeds',
      loadExtensions: ['.ts'],
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
      directory: './knex/migrations',
    },
    seeds: {
      directory: './knex/seeds',
    },
  },
};

module.exports = knexConfig;
