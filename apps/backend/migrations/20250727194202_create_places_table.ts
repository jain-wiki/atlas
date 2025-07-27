import type { Knex } from "knex";



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
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('places');
}

