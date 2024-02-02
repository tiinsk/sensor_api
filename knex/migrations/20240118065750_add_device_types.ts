exports.up = async function (knex) {
  await knex.schema.table('device', function (table) {
    table
      .enu('type', ['ruuvi', 'sensorbug'], {
        useNative: true,
        enumName: 'device_type',
      })
      .notNullable()
      .defaultTo('ruuvi');
  });
};

exports.down = async function (knex) {
  await knex.schema.table('device', function (table) {
    table.dropColumn('type');
  });
  await knex.schema.raw(`
    DROP TYPE device_type;
  `);
};
