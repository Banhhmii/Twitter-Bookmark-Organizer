const storeBookmark = async (req, res) => {
  event.preventDefault();
  const bookmarkUrl = document.getElementById('bookmarkURL').value;
  const tag = document.getElementById('tag').value;
  const {url , tag} = {
    url: bookmarkUrl,
    tag: tag|| null,
  };
  try {
    const response = await fetch('/storeBookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({url, tag})
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