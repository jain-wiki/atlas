import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('places', (table) => {
    table.string('id', 10).primary();
    table.string('name', 100).notNullable();
    table.string('additional_names', 500);
    table.string('type_of_place', 1);
    table.string('description', 1000);
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('places_log', (table) => {
    table.increments('id').primary();
    table.string('place_id', 10).references('id').inTable('places');
    table.string('action', 1); // (I, U, D)
    table.text('old_data'); // JSON
    table.text('new_data'); // JSON
    table.string('user_email', 255);
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('places');
  await knex.schema.dropTableIfExists('places_log');

}

