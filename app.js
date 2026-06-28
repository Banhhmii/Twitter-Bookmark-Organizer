const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const { hashPassword, verifyPassword } = require("./utils/passwordHashing");
const { generateToken, authenticateUser } = require("./middleware/auth");
const { validateLogin, validateBookmark, validateFilter } = require("./middleware/inputValidation");
const { rateLimiter, authLimiter } = require("./middleware/rateLimiter");
const { errorHandler } = require("./middleware/errorHandling");
const { AuthError, ConflictError } = require("./utils/appError");
const { Pool } = require("pg");


const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
});

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  const options = {
    root: __dirname + "/views",
    headers: {
      "Content-Type": "text/html",
    },
  };
  res.sendFile("index.html", options, (err) => {
    if (err) {
      console.error("Error sending index.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/script.js", (req, res) => {
  const options = {
    root: __dirname,
    headers: {
      "Content-Type": "application/javascript",
    },
  };
  res.sendFile("script.js", options, (err) => {
    if (err) {
      console.error("Error sending script.js:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/styles.css", (req, res) => {
  const options = {
    root: __dirname,
    headers: {
      "Content-Type": "text/css",
    },
  };
  res.sendFile("styles.css", options, (err) => {
    if (err) {
      console.error("Error sending styles.css:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/register", (req, res) => {
  const options = {
    root: __dirname + "/views",
    headers: {
      "Content-Type": "text/html",
    },
  };
  res.sendFile("register.html", options, (err) => {
    if (err) {
      console.error("Error sending register.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.get("/login", (req, res) => {
  const options = {
    root: __dirname + "/views",
    headers: {
      "Content-Type": "text/html",
    },
  };
  res.sendFile("login.html", options, (err) => {
    if (err) {
      console.error("Error sending login.html:", err);
      res.status(500).send("Internal Server Error");
    }
  });
});

app.post("/storeBookmark", rateLimiter, authenticateUser, validateBookmark, async (req, res, next) => {
  const bookmark = req.body;
  const { url, tag} = bookmark;
  const userId = req.user.userId;
  try{
    const result = await pool.query(
      'INSERT INTO "bookmarks" (url, tag, user_id) VALUES ($1, $2, $3) RETURNING *',
      [url, tag, userId]
    );
    res.status(201).json({ message: "Bookmark stored successfully"});
  } catch (error) {
    next(error);
  }
});

app.get("/filterBookmarks", rateLimiter, authenticateUser, validateFilter, async (req, res, next) => {
  const filterTag = req.query.tag;
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM "bookmarks" WHERE LOWER(tag) = LOWER($1) and user_id = $2',
      [filterTag, userId]
    );
    res.status(200).json({ bookmarks: result.rows });
  } catch (error) {
    next(error);
  }
});

app.get("/bookmarks", rateLimiter, authenticateUser, async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "bookmarks" WHERE user_id = $1',
      [req.user.userId]
    );
    res.status(200).json({ bookmarks: result.rows });
  } catch (error) {
    next(error);
  }
});

app.post("/register", authLimiter, validateLogin, async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const securePassword = await hashPassword(password.trim());
    const result = await pool.query(
      'INSERT INTO "users" (username, password) VALUES ($1, $2) RETURNING *',
      [username.trim(), securePassword]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    if (error.code === '23505') return next(new ConflictError('Username already taken'));
    next(error);
  }
});

app.post("/login", authLimiter, validateLogin, async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM "users" WHERE username = $1',
      [username.trim()]
    );
    if (result.rows.length === 0) {
      return next(new AuthError('Invalid credentials'));
    }
    const user = result.rows[0];
    const isMatch = await verifyPassword(password.trim(), user.password);
    if (!isMatch) {
      return next(new AuthError('Invalid credentials'));
    }
    const token = generateToken({ userId: user.id });
    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    next(error);
  }
});

app.use(errorHandler);

module.exports = { app, pool };