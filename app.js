const express = require("express");
// const supabase = require('./supabaseClient.js');
const dotenv = require("dotenv");
dotenv.config();
const { Pool } = require("pg");
const fs = require("fs");

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
  const { bookmarkUrl, tag} = bookmark;
  pool.query(
    'INSERT INTO "Twitter-Bookmarks" (url, tag) VALUES ($1, $2) RETURNING *',
    [bookmarkUrl, tag],
    (error, result) => {
      if (error) {
        console.error("Error storing bookmark:", error);
        res.status(500).json({ error: "Failed to store bookmark" });
      } else {
        res
          .status(201)
          .json({ message: "Bookmark stored successfully" });
      }
    },
  );
});

app.get("/filterBookmarks", async (req, res) => {
  const filterTag = req.query.tag;
  try {
    const { data, error } = await supabase
      .from("Twitter-Bookmarks")
      .select("*")
      .ilike("tag", `%${filterTag}%`);
    if (error) {
      console.error("Error filtering bookmarks:", error);
      res.status(500).json({ error: "Failed to filter bookmarks" });
    } else {
      res.status(200).json({ bookmarks: data });
    }
  } catch (error) {
    console.error("Error filtering bookmarks:", error);
    res.status(500).json({ error: "Failed to filter bookmarks" });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
