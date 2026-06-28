const request = require("supertest");
const { app, pool } = require("./app");

let token;

beforeAll(async () => {
  // Set up the database or any necessary preconditions here
  const response = await request(app)
    .post("/login")
    .send({ username: "testuser", password: "testuserpassword" });
    token = response.body.token; // Store the token for use in tests
});

afterAll(async () => {
  await pool.query('DELETE FROM "bookmarks" WHERE url = $1', ["https://example.com"]);
  await pool.end();
});

describe("POST /register Input Validation", () => {
  it("should return 400 when username is missing", async () => {
    const response = await request(app)
      .post("/register")
      .send({ password: "testpassword" });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "Username is required",
    });
  });

  it("should return 400 when password is missing", async () => {
    const response = await request(app)
      .post("/register")
      .send({ username: "testuser" });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "Password is required",
    });
  });

  it("should return 422 when password is too short", async () => {
    const response = await request(app)
      .post("/register")
      .send({ username: "testuser", password: "short" });
    expect(response.status).toBe(422);
    expect(response.body).toEqual({
      success: false,
      error: "Password must be between 8 and 64 characters long",
    });
  });
});

describe("POST /login Authentication", () => {
  it("should return 401 when password is incorrect", async () => {
    const response = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "wrongpassword" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: "Invalid credentials",
    });
  });

  it("should return 200 and a token when credentials are correct", async () => {
    const response = await request(app)
      .post("/login")
      .send({ username: "testuser", password: "testuserpassword" });
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
    expect(response.body.token).toBeTruthy();
  });
});

describe("GET /bookmarks Authentication", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await request(app).get("/bookmarks");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: "Access token missing",
    });
  });

  it("should return 403 when an invalid token is provided", async () => {
    const response = await request(app)
      .get("/bookmarks")
      .set("Authorization", "Bearer invalidtoken");
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      error: "Invalid access token",
    });
  });

  it("should return 200 and a list of bookmarks when a valid token is provided", async () => {
    const response = await request(app)
      .get("/bookmarks")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("bookmarks");
    expect(Array.isArray(response.body.bookmarks)).toBe(true);
  });
});

describe("POST /storeBookmark Authentication", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await request(app)
      .post("/storeBookmark")
      .send({ url: "https://example.com", tag: "tech" });
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: "Access token missing",
    });
  });

  it("should return 403 when an invalid token is provided", async () => {
    const response = await request(app)
      .post("/storeBookmark")
      .set("Authorization", "Bearer invalidtoken")
      .send({ url: "https://example.com", tag: "tech" });
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      error: "Invalid access token",
    });
  });

  it("should return 400 when url is missing", async () => {
    const response = await request(app)
      .post("/storeBookmark")
      .set("Authorization", `Bearer ${token}`)
      .send({ tag: "tech" });
    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      success: false,
      error: "URL is required",
    });
  });

  it("should return 201 when a valid bookmark is stored", async () => {
    const response = await request(app)
      .post("/storeBookmark")
      .set("Authorization", `Bearer ${token}`)
      .send({ url: "https://example.com", tag: "tech" });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      message: "Bookmark stored successfully",
    });
  });
});

describe("GET /filterBookmarks Authentication", () => {
  it("should return 401 when no token is provided", async () => {
    const response = await request(app).get("/filterBookmarks?tag=tech");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({
      success: false,
      error: "Access token missing",
    });
  });

  it("should return 403 when an invalid token is provided", async () => {
    const response = await request(app)
      .get("/filterBookmarks?tag=tech")
      .set("Authorization", "Bearer invalidtoken");
    expect(response.status).toBe(403);
    expect(response.body).toEqual({
      success: false,
      error: "Invalid access token",
    });
  });

  it("should return 200 and filtered bookmarks when a valid token is provided", async () => {
    const response = await request(app)
      .get("/filterBookmarks?tag=tech")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("bookmarks");
    expect(Array.isArray(response.body.bookmarks)).toBe(true);
  });
});
