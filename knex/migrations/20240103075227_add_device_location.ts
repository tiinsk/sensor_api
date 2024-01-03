exports.up = async function (knex) {
  await knex.schema.table('device', function (table) {
    table.integer('location_x').notNullable().defaultTo(0);
    table.integer('location_y').notNullable().defaultTo(0);
  });
};

exports.down = async function (knex) {
  await knex.schema.table('device', function (table) {
    table.dropColumn('location_x');
    table.dropColumn('location_y');
  });
};
