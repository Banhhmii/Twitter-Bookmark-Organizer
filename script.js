const storeBookmark = async (req, res) => {
  event.preventDefault();
  const url = document.getElementById('bookmarkURL').value;
  const tag = document.getElementById('tag').value;

  try {
    const response = await fetch('/storeBookmark', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('authToken')}`
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
    const response = await fetch(`/filterBookmarks?tag=${filterTag}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
    });
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
const getBookmarks = async () => {
  try {
    const response = await fetch('/bookmarks', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('authToken')}` }
    });
    const data = await response.json();
    const bookmarksDisplay = document.getElementById('bookmarksResults');
    bookmarksDisplay.innerHTML = data.bookmarks.map(bookmark => `
      <div class="bookmark-card">
        <p>Tag: ${bookmark.tag || "No tag"}</p>
        <a href="${bookmark.url}" target="_blank">${bookmark.url}</a>
      </div>
    `).join('');
  } catch (error) {
    console.error("Error retrieving bookmarks:", error);
  }
};

const registerUser = async () => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password })
    });
    const data = await response.json();
    if (response.ok) {
      alert(data.message);
      window.location.href = "/login";
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error registering user:", error);
  }
}

const loginUser = async () => {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  try {
    const response = await fetch('/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username: username, password: password })
    });
    if (response.ok) {
      const data = await response.json();
      alert(data.message);
      // Store the token in localStorage or a cookie
      localStorage.setItem('authToken', data.token);
      window.location.href = "/home";
    } else {
      alert(data.error);
    }
  } catch (error) {
    console.error("Error logging in:", error);
  }
}

const bookmarkForm = document.getElementById('bookmarkForm');
const filterForm = document.getElementById('filterForm');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');


if (bookmarkForm) {
  bookmarkForm.addEventListener('submit', storeBookmark);
}

if (filterForm) {
  filterForm.addEventListener('submit', filterBookmarks);
}

if (registerForm) {
  registerForm.addEventListener('submit', registerUser);
}

if (loginForm) {
  loginForm.addEventListener('submit', loginUser);
}

const bookmarksBtn = document.getElementById('bookmarksBtn');
if (bookmarksBtn) {
  bookmarksBtn.addEventListener('click', getBookmarks);
}
