exports.up = async function(knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.dropColumn('location');
  });
};

exports.down = async function(knex, Promise) {
  await knex.schema.table('device', function (table) {
    table.enu('location', null, { useNative: true, existingType: true, enumName: 'location' })
  });
};
