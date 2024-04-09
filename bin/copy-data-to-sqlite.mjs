/**
 * Usage: node ./copy-data-to-sqlite.mjs
 */
import SqliteDatabase from "better-sqlite3";
import postgres from "postgres";

/**
 *
 */
const sqliteDb = new SqliteDatabase("db.sqlite3");

/**
 *
 */
const pgsql = postgres("postgres://myusername:mypassword@localhost:5432/mydb");

/**
 *
 */
main();

/**
 *
 */
async function main() {
  createSqliteTables();
  await copyModelsTable();
  await copyStylesTable();
  await copyEquipmentConfigurationsTable();
  console.log("Done. Press ^C");
  sqliteDb.close();
}

/**
 *
 */
function createSqliteTables() {
  let sqliteRow;

  // Drop and create models table
  sqliteDb.prepare(`drop table if exists models`).run();
  sqliteRow = sqliteDb
    .prepare(
      `
    create table if not exists models (
      id integer primary key,
      name text
    )`,
    )
    .run();
  console.log("[copy-data-to-sqlite.mjs]", sqliteRow.changes);

  // Drop and create styles table
  sqliteDb.prepare(`drop table if exists styles`).run();
  sqliteRow = sqliteDb
    .prepare(
      `
    create table if not exists styles (
      id integer primary key,
      model_id integer,
      name text
    )`,
    )
    .run();
  console.log("[copy-data-to-sqlite.mjs]", sqliteRow.changes);

  // Drop and create equipment_configurations table
  sqliteDb.prepare(`drop table if exists equipment_configurations`).run();
  sqliteRow = sqliteDb
    .prepare(
      `
    create table if not exists equipment_configurations (
      id text primary key,
      style_id integer,
      oem_name text,
      oem_code text,
      oem_msrp integer,
      oem_invoice integer,
      status_id integer
    )`,
    )
    .run();
  console.log("[copy-data-to-sqlite.mjs]", sqliteRow.changes);
}

/**
 *
 */
async function copyModelsTable() {
  const pgRows = await pgsql`
    select id, name from vehicle.models where id = 56233
  `;
  let count = 0;
  for (const pgRow of pgRows) {
    const sqliteRow = sqliteDb
      .prepare(`insert into models (id, name) values (?, ?)`)
      .run(pgRow.id, pgRow.name);
    count += sqliteRow.changes;
  }
  console.log("[copy-data-to-sqlite.mjs]", count);
}

/**
 *
 */
async function copyStylesTable() {
  const pgRows = await pgsql`
    select
      s.id,
      s.model_id,
      s.name
    from
      vehicle.styles s
    join
      vehicle.models m on s.model_id = m.id
    where
      m.id = 56233
  `;
  let count = 0;
  for (const pgRow of pgRows) {
    const sqliteRow = sqliteDb
      .prepare(`insert into styles (id, model_id, name) values (?, ?, ?)`)
      .run(pgRow.id, pgRow.model_id, pgRow.name);
    count += sqliteRow.changes;
  }
  console.log("[copy-data-to-sqlite.mjs]", count);
}

/**
 *
 */
async function copyEquipmentConfigurationsTable() {
  const pgRows = await pgsql`
    select
      ec.id,
      ec.style_id,
      ec.oem_name,
      ec.oem_code,
      ec.oem_msrp,
      ec.oem_invoice,
      ec.style_equipment_status_id
    from
      vehicle.equipment_configurations ec
    join
      vehicle.styles s on ec.style_id = s.id
    join
      vehicle.models m on s.model_id = m.id
    where
      m.id = 56233
  `;
  let count = 0;
  for (const pgRow of pgRows) {
    const sqliteRow = sqliteDb
      .prepare(
        `
        insert into equipment_configurations (
          id,
          style_id,
          oem_name,
          oem_code,
          oem_msrp,
          oem_invoice,
          status_id
        ) values (?, ?, ?, ?, ?, ?, ?)
        `,
      )
      .run(
        pgRow.id,
        pgRow.style_id,
        pgRow.oem_name,
        pgRow.oem_code,
        pgRow.oem_msrp,
        pgRow.oem_invoice,
        pgRow.style_equipment_status_id,
      );
    count += sqliteRow.changes;
  }
  console.log("[copy-data-to-sqlite.mjs]", count);
}
