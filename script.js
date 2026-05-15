const storeBookmark = async (req, res) => {
  event.preventDefault();
  const bookmarkUrl = document.getElementById('bookmarkInput').value;
  const bookmarkTag = document.getElementById('tagInput').value;
  const {url , tag, created_at} = {
    url: bookmarkUrl,
    tag: bookmarkTag || null,
    created_at: new Date().toISOString()
  };
  try {
    const response = await fetch('/bookmarks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({url, tag, created_at})
      })
    } catch (error) { 
      console.error("Error storing bookmark:", error);
  }
}

document.getElementById('bookmarkForm').addEventListener('submit', storeBookmark);