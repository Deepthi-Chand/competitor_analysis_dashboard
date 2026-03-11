import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('chart_configs', (table) => {
    table.string('id').primary();
    table.string('title').notNullable();
    table.string('type').notNullable();
    table.text('description');
    table.boolean('is_active').defaultTo(true);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('dashboard_data_snapshots', (table) => {
    table.increments('id').primary();
    table.string('chart_id').references('id').inTable('chart_configs').onDelete('CASCADE');
    table.string('time_range').notNullable();
    table.string('category').notNullable();
    table.jsonb('data').notNullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('filter_configs', (table) => {
    table.string('id').primary();
    table.string('label').notNullable();
    table.integer('sort_order').defaultTo(0);
    table.timestamps(true, true);
  });

  await knex.schema.createTable('filter_options', (table) => {
    table.increments('id').primary();
    table.string('filter_id').references('id').inTable('filter_configs').onDelete('CASCADE');
    table.string('value').notNullable();
    table.string('label').notNullable();
    table.integer('sort_order').defaultTo(0);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('filter_options');
  await knex.schema.dropTableIfExists('filter_configs');
  await knex.schema.dropTableIfExists('dashboard_data_snapshots');
  await knex.schema.dropTableIfExists('chart_configs');
}
