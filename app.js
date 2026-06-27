const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const { hashPassword, verifyPassword } = require("./utils/passwordHashing");
const { generateToken, authenticateUser } = require("./middleware/auth");
const { Pool } = require("pg");


const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
});
const port = 3000;

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

app.post("/storeBookmark", authenticateUser, async (req, res) => {
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
    console.error("Error storing bookmark:", error);
    res.status(500).json({ error: "Failed to store bookmark" });
  }
});

app.get("/filterBookmarks", authenticateUser, async (req, res) => {
  const filterTag = req.query.tag;
  const userId = req.user.userId;
  try {
    const result = await pool.query(
      'SELECT * FROM "bookmarks" WHERE LOWER(tag) = LOWER($1) and user_id = $2',
      [filterTag, userId]
    );
    res.status(200).json({ bookmarks: result.rows });
  } catch (error) {
    console.error("Error filtering bookmarks:", error);
    res.status(500).json({ error: "Failed to filter bookmarks" });
  }
});

app.get("/bookmarks", authenticateUser, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM "bookmarks" WHERE user_id = $1',
      [req.user.userId]
    );
    res.status(200).json({ bookmarks: result.rows });
  } catch (error) {
    console.error("Error retrieving bookmarks:", error);
    res.status(500).json({ error: "Failed to retrieve bookmarks" });
  }
});

app.post("/register", async (req, res) => {
  const { username, password } = req.body;
  const securePassword = await hashPassword(password.trim());
  try {
    const result = await pool.query(
      'INSERT INTO "users" (username, password) VALUES ($1, $2) RETURNING *',
      [username.trim(), securePassword]
    );
    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ error: "Failed to register user" });
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query(
      'SELECT * FROM "users" WHERE username = $1',
      [username.trim()]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }
    const user = result.rows[0];
    const isMatch = await verifyPassword(password.trim(), user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    } 
    const token = generateToken({ userId: user.id})
    res.status(200).json({ message: "Login successful", token: token });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Failed to login" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
