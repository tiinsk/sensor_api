exports.up = async function (knex, Promise) {
  await knex.schema.createTable('user', function (table) {
    table.string('username').primary().unique().notNullable();
    table.string('password').notNullable();
    table.string('salt').notNullable();
    table.boolean('disabled').notNullable().defaultTo(false);
  });
};

exports.down = async function (knex, Promise) {
  await knex.schema.dropTableIfExists('user');
};
