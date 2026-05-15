# Twitter Bookmark Organizer

**A lightweight backend tool to save, tag, and filter Twitter bookmarks.**

## The Problem

I needed a way to organize my Twitter bookmarks into specific folders [3]. Twitter's native bookmarking system makes it difficult to categorize links efficiently, causing me to lose track of important resources, tutorials, and threads.

## The Solution

I built a custom Express backend connected to a Supabase (PostgreSQL) database. It provides a simple UI to submit a Twitter URL and assign it a custom tag in one click. I can then retrieve and filter my database by specific tags to instantly find what I'm looking for.

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript [5]
- **Backend:** Node.js, Express [6]
- **Database:** Supabase (PostgreSQL) [6]


### 1. Save a Bookmark

Saves a new Twitter link and its associated tag to the database.

- **Method:** `POST`
- **URL:** `/bookmarks`
- **Request Body:**
  ```json
  {
    "url": "https://twitter.com/user/status/12345",
    "tag": "Algorithms",
    "created_at": "2026-05-15T00:00:00.000Z"
  }
  Success Response (201 Created):
  ```

### 2. Filter Bookmarks
   Retrieves a list of saved bookmarks matching a specific tag.

- **Method**: GET  
  **URL**: /filterBookmarks?tag=[your_tag]  
  **Success Response**: (200 OK)

## Setup Instructions

How to run this project:

1. Clone this repository down to your local machine.
2. Run npm install to install dependencies (Express, dotenv, Supabase client).
3. Create a .env file in the root directory and add your Supabase credentials:
4. Run node app.js to start the server.
   Open your browser and navigate to http://localhost:3000.

## What I Learned
I learned how to use Supabase to store and retrieve data and how to use environment variales to secure my database connections. I also learned how to build my own backend API.
