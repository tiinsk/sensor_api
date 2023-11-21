exports.up = async function (knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.integer('order').unique();
  });
};

exports.down = async function (knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.dropColumn('order');
  });
};
