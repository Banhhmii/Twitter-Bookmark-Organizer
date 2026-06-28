const request = require("supertest");
const { app } = require("./app");
const { Pool } = require("pg");

// Mock the database connection
jest.mock("pg");

describe("POST /register Database Errors", () => {
  it("should return 500 when the database crashes", async () => {
    Pool.prototype.query.mockRejectedValueOnce(new Error("Database connection lost"));
    const response = await request(app)
      .post("/register")
      .send({ username: "testuser", password: "testpassword" });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: "Internal Server Error",
    });
  });
});

describe("POST /login Database Errors", () => {
  it("should return 500 when the database crashes", async () => {
    Pool.prototype.query.mockRejectedValueOnce(new Error("Database connection lost"));
    const response = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "testpassword" });
    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      success: false,
      error: "Internal Server Error",
    });
  });
});
