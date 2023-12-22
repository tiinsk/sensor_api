exports.up = async function (knex, Promise) {
  await knex.schema.createTable('device', function (table) {
    table.string('id').primary();
    table.enu('location', ['living_room', 'balcony', 'bedroom'], {
      useNative: true,
      enumName: 'location',
    });
  });

  await knex.schema.createTable('reading', function (table) {
    table.increments();
    table.float('temperature');
    table.float('humidity');
    table.float('pressure');
    table.float('lux');
    table.float('battery');
    table.string('device').references('device.id').notNullable();
    table.timestamps(true, true);
  });

  await knex.schema.createTable('auth', function (table) {
    table.string('api_key').primary();
    table.string('device').references('device.id').nullable();
    table.string('description');
  });
};

exports.down = async function (knex, Promise) {
  await knex.schema.dropTableIfExists('reading');
  await knex.schema.dropTableIfExists('auth');
  await knex.schema.dropTableIfExists('device');
  await knex.schema.raw(`
    DROP TYPE location;
  `);
};
