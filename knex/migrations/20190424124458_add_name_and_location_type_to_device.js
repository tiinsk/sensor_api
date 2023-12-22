exports.up = async function (knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.string('name');
    table.enu('location_type', ['outside', 'inside'], {
      useNative: true,
      enumName: 'location_type',
    });
  });
};

exports.down = async function (knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.dropColumn('name');
    table.dropColumn('location_type');
  });
  await knex.schema.raw(`
    DROP TYPE location_type;
  `);
};
