/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable("users", (table) => {
    table.increments("id").primary();
    table.string("username").notNullable().unique();
    table.string("password").notNullable().checkLength(">=", 8).checkLength("<=", 64);
    table.timestamp("created_at", { useTz: true }).notNullable().defaultTo(knex.fn.now());
  }).then(() => {
    console.log("Users table created successfully");
});
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists("users").then(() => {
        console.log("Users table dropped successfully");
   });
};
