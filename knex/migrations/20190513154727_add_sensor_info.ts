exports.up = async function (knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.json('sensor_info');
  });
};

exports.down = async function (knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.dropColumn('sensor_info');
  });
};
