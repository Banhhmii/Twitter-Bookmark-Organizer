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
    const response = await fetch('/storeBookmark', {
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

const filterBookmarks = async () => {
  event.preventDefault();
  const filterTag = document.getElementById('filterInput').value.toLowerCase();
  const filterDisplay = document.getElementById('filterResults');
  try{
    const response = await fetch(`/filterBookmarks?tag=${filterTag}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    } 
    const data = await response.json();
    const filterString = data.bookmarks.map(bookmark => {
      return `
        <div class="bookmark-card">
          <p>Tag: ${bookmark.tag || "No tag"}</p>
          <a href="${bookmark.url}" target="_blank">${bookmark.url}</a>
        </div>
      `
    })
    filterDisplay.innerHTML = filterString.join('');
  } catch (error) {
    console.error("Error filtering bookmarks:", error);
  }

}

document.getElementById('bookmarkForm').addEventListener('submit', storeBookmark);
document.getElementById('filterForm').addEventListener('submit', filterBookmarks);