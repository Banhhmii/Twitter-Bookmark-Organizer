const express = require('express');
const supabase = require('./supabaseClient.js');
const fs = require('fs');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/', (req, res) => {
    const options = {
        root: __dirname,
        headers: {
            'Content-Type': 'text/html'
        }
    };
    res.sendFile('index.html', options, (err) => {
        if (err) {
            console.error("Error sending index.html:", err);
            res.status(500).send("Internal Server Error");
        }
    });
});


app.get('/script.js', (req, res) => {
    const options = {
        root: __dirname,
        headers: {
            'Content-Type': 'application/javascript'
        }
    };
    res.sendFile('script.js', options, (err) => {
        if (err) {
            console.error("Error sending script.js:", err);
            res.status(500).send("Internal Server Error");
        }
    });
});

app.post('/storeBookmark', async (req, res) => {
    const bookmark = req.body;
    const {data, error} = await supabase
        .from('Twitter-Bookmarks')
        .insert({ url: bookmark.url, tag: bookmark.tag, created_at: bookmark.created_at})
        .select();
    if (error) {
        console.error("Error storing bookmark:", error);
        res.status(500).json({ error: "Failed to store bookmark" });
    } else {
        res.status(201).json({ message: "Bookmark stored successfully", data: data });
    }
});

app.get('/filterBookmarks', async (req, res) => {
    const filterTag = req.query.tag;
    try {
        const { data, error } = await supabase
            .from('Twitter-Bookmarks')
            .select('*')
            .ilike('tag', `%${filterTag}%`);
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