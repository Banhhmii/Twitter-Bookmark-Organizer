/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("bookmarks", (table) => {
    table.increments("id").primary();
    table.string("url").notNullable().unique();
    table.string("tag").notNullable();
    table.integer("user_id").unsigned().notNullable().references("id").inTable("users").onDelete("CASCADE");
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  }).then(() => {
    console.log("Bookmarks table created successfully");
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists("bookmarks").then(() => {
    console.log("Bookmarks table dropped successfully");
  });
};
