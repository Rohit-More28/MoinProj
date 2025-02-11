// Selecting the sidebar and overlay elements
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggle-sidebar');
const overlay = document.getElementById('overlay');

// Toggle sidebar visibility when clicking on the toggle button
toggleSidebar.addEventListener('click', (event) => {
    event.stopPropagation();  // Stop event from bubbling up to document
    sidebar.style.left = '0';  // Open sidebar
    overlay.style.display = 'block';  // Show overlay
});

// Close sidebar when clicking on the overlay
overlay.addEventListener('click', () => {
    sidebar.style.left = '-220px';  // Close sidebar
    overlay.style.display = 'none';  // Hide overlay
});

// Close sidebar when clicking anywhere outside the sidebar and toggle button
document.addEventListener('click', (event) => {
    const isClickInsideSidebar = sidebar.contains(event.target);
    const isClickInsideToggle = toggleSidebar.contains(event.target);

    // If the click is outside the sidebar and toggle button, close the sidebar
    if (!isClickInsideSidebar && !isClickInsideToggle) {
        sidebar.style.left = '-220px';  // Close sidebar
        overlay.style.display = 'none';  // Hide overlay
    }
});

// Prevent clicks inside the sidebar from closing it
sidebar.addEventListener('click', (event) => {
    event.stopPropagation();  // Stop event from bubbling up to document
});

// Keep the existing sidebar functionality

// Function to display bookmarked articles
function displayBookmarks() {
    const bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
    const newsContainer = document.getElementById("news-container");
    
    if (bookmarks.length === 0) {
        newsContainer.innerHTML = `
            <div class="article">
                <h3>No Bookmarks Yet</h3>
                <p>Your bookmarked articles will appear here. Go to the homepage and click the star icon (☆) to bookmark articles.</p>
            </div>
        `;
        return;
    }

    newsContainer.innerHTML = "";
    
    bookmarks.forEach(article => {
        const articleElement = document.createElement("div");
        articleElement.classList.add("article");
        
        articleElement.innerHTML = `
            <img src="${article.urlToImage}" alt="News Image">
            <h3>${article.title}</h3>
            <p>${article.description}</p>
            <a href="${article.url}" target="_blank">Read more</a>
            <div class="news-options">
                <button class="remove-bookmark" data-article-title="${article.title}">Remove Bookmark ★</button>
            </div>
        `;
        
        newsContainer.appendChild(articleElement);
    });
}

// Event listener for remove bookmark buttons
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-bookmark')) {
        const articleTitle = event.target.dataset.articleTitle;
        let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];
        bookmarks = bookmarks.filter(bookmark => bookmark.title !== articleTitle);
        localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
        displayBookmarks();
    }
});

// Load bookmarks when the page loads
window.addEventListener('load', displayBookmarks);