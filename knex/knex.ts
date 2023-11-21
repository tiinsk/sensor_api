import knex from 'knex';
import knexfile from '../knexfile';

const environment = process.env.NODE_ENV;
const config = knexfile[environment];

export default knex(config);
