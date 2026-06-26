const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require("pg");


const pool = new Pool({
  connectionString: process.env.PG_CONNECTION_STRING,
});
const port = 3000;

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  const options = {
    root: __dirname,
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

app.post("/storeBookmark", async (req, res) => {
  const bookmark = req.body;
  const { url, tag} = bookmark;
  try{
    const result = await pool.query(
      'INSERT INTO "bookmarks" (url, tag) VALUES ($1, $2) RETURNING *',
      [url, tag]
    );
    res.status(201).json({ message: "Bookmark stored successfully"});
  } catch (error) {
    console.error("Error storing bookmark:", error);
    res.status(500).json({ error: "Failed to store bookmark" });
  }
});

app.get("/filterBookmarks", async (req, res) => {
  const filterTag = req.query.tag;
  try {
    const result = await pool.query(
      'SELECT * FROM "bookmarks" WHERE LOWER(tag) = LOWER($1)',
      [filterTag],
    );
    res.status(200).json({ bookmarks: result.rows });
  } catch (error) {
    console.error("Error filtering bookmarks:", error);
    res.status(500).json({ error: "Failed to filter bookmarks" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
