import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  // Create user table
  await knex.schema.createTable('user', (table) => {
    table.text('id').notNullable().primary();
    table.text('name').notNullable();
    table.text('email').notNullable().unique();
    table.integer('emailVerified').notNullable();
    table.text('image').nullable();
    table.date('createdAt').notNullable();
    table.date('updatedAt').notNullable();

    // Indexes for performance optimization
    table.index(['email']);
  });

  // Create session table
  await knex.schema.createTable('session', (table) => {
    table.text('id').notNullable().primary();
    table.date('expiresAt').notNullable();
    table.text('token').notNullable().unique();
    table.date('createdAt').notNullable();
    table.date('updatedAt').notNullable();
    table.text('ipAddress').nullable();
    table.text('userAgent').nullable();
    table.text('userId').notNullable().references('id').inTable('user');

    // Indexes for performance optimization
    table.index(['userId']);
    table.index(['token']);
  });

  // Create account table
  await knex.schema.createTable('account', (table) => {
    table.text('id').notNullable().primary();
    table.text('accountId').notNullable();
    table.text('providerId').notNullable();
    table.text('userId').notNullable().references('id').inTable('user');
    table.text('accessToken').nullable();
    table.text('refreshToken').nullable();
    table.text('idToken').nullable();
    table.date('accessTokenExpiresAt').nullable();
    table.date('refreshTokenExpiresAt').nullable();
    table.text('scope').nullable();
    table.text('password').nullable();
    table.date('createdAt').notNullable();
    table.date('updatedAt').notNullable();

    // Indexes for performance optimization
    table.index(['userId']);
  });

  // Create verification table
  await knex.schema.createTable('verification', (table) => {
    table.text('id').notNullable().primary();
    table.text('identifier').notNullable();
    table.text('value').notNullable();
    table.date('expiresAt').notNullable();
    table.date('createdAt').nullable();
    table.date('updatedAt').nullable();

    // Indexes for performance optimization
    table.index(['identifier']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('verification');
  await knex.schema.dropTableIfExists('account');
  await knex.schema.dropTableIfExists('session');
  await knex.schema.dropTableIfExists('user');
}

