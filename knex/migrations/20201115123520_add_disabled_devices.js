exports.up = async function (knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.boolean('disabled').notNullable().defaultTo(false);
  });
};

exports.down = async function (knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.dropColumn('disabled');
  });
};
