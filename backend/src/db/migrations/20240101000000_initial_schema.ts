import type { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('plan_data', (table) => {
    table.increments('id').primary();
    table.string('contract_id', 20);
    table.integer('plan_id');
    table.float('ssa_code');
    table.integer('fips_code');
    table.string('state', 60).notNullable().index();
    table.string('county', 100).notNullable();
    table.integer('enrollments').notNullable().defaultTo(0);
    table.string('parent_organization', 120).notNullable().index();
    table.string('plan_type', 80).notNullable();
    table.string('offers_part_d', 3);
    table.string('snp_plan', 3);
    table.string('eghp', 3);
    table.string('plan_name', 200);
    table.integer('year').notNullable();
    table.string('month', 12).notNullable();
    table.integer('month_num').notNullable();
    table.float('ma_eligibles');
    table.string('special_needs_plan_type', 60);
    table.float('snp_eligibles');
    table.string('poa', 200);
    table.string('acquisition_type', 50);
    table.string('ind_grp_plans', 20).notNullable().defaultTo('Individual MA Plans').index();
    table.string('ma_mapd_pdp', 10).notNullable().defaultTo('MAPD').index();
    table.index(['state', 'year', 'month_num']);
    table.index(['state', 'ind_grp_plans', 'ma_mapd_pdp', 'special_needs_plan_type']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('plan_data');
}
