exports.up = async function (knex) {
  await knex.schema.table('device', function (table) {
    table.integer('latest_reading').references('reading.id').nullable();
  });
};

exports.down = async function (knex) {
  await knex.schema.table('device', function (table) {
    table.dropColumn('latest_reading');
  });
};
