const profanityFilter = {
    bannedWords: ['badword1', 'badword2', 'inappropriate', 'vulgar'],
    
    containsProfanity(text) {
        const words = text.toLowerCase().split(/\s+/);
        return this.bannedWords.some(banned => 
            words.some(word => word.includes(banned))
        );
    },
    
    clean(text) {
        return text.split(/\s+/)
            .map(word => this.bannedWords.some(banned => word.toLowerCase().includes(banned)) ? '*'.repeat(word.length) : word)
            .join(' ');
    }
};

// Check for existing user or set guest mode
let user = JSON.parse(localStorage.getItem('user')) || { role: "guest" };

// If guest, show default news
if (user.role === "guest") {
    fetchNews("New York");  // Load default news category
}

// Sidebar handling
const sidebar = document.getElementById('sidebar');
const toggleSidebar = document.getElementById('toggle-sidebar');
const overlay = document.getElementById('overlay');

toggleSidebar.addEventListener('click', (event) => {
    event.stopPropagation();
    sidebar.style.left = '0';
    overlay.style.display = 'block';
});

overlay.addEventListener('click', () => {
    sidebar.style.left = '-220px';
    overlay.style.display = 'none';
});

// Fetch and display news dynamically
async function fetchNews(category) {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(category)}&apiKey=ecfccc58d345415bb9818c6612a272aa`);
        const data = await response.json();
        const newsContainer = document.getElementById("news-container");
        newsContainer.innerHTML = "";

        data.articles.forEach((article) => {
            const articleElement = document.createElement("div");
            articleElement.classList.add("article");

            articleElement.innerHTML = `
                <img src="${article.urlToImage || '/default-image.jpg'}" alt="News Image">
                <h3>${article.title}</h3>
                <p>${article.description || 'No description available.'}</p>
                <a href="${article.url}" target="_blank">Read more</a>
                <div class="news-options">
                    <div class="vote-container">
                        <button class="upvote">▲</button>
                        <span class="vote-count">0</span>
                        <button class="downvote">▼</button>
                    </div>
                    <button class="discuss">Comments</button>
                    <button class="share">Share</button>
                    ${user.role === "authenticated" ? `<button class="bookmark" data-article-title="${article.title}">☆</button>` : '<button class="disabled-bookmark" onclick="alert(\'Sign in to bookmark articles\')">☆</button>'}
                </div>
                <div class="comments-section" style="display: none;">
                    <textarea placeholder="Add a comment" ${user.role === "guest" ? 'disabled' : ''}></textarea>
                    <button class="post-comment" ${user.role === "guest" ? 'onclick="alert(\'Sign in to comment\')"' : ''}>Post Comment</button>
                    <ul class="comments-list"></ul>
                </div>
            `;

            newsContainer.appendChild(articleElement);
            if (user.role === "authenticated") updateBookmarkIcon(article.title);
        });
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

// Search functionality
function searchNews(event) {
    if (event.key === "Enter") {
        const query = document.getElementById("search-input").value;
        fetchNews(query);
    }
}

// Handle bookmarks
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

function toggleBookmark(article) {
    if (user.role === "guest") {
        alert("Sign in to bookmark articles.");
        return;
    }

    const isBookmarked = bookmarks.some(bookmark => bookmark.title === article.title);
    if (isBookmarked) {
        bookmarks = bookmarks.filter(bookmark => bookmark.title !== article.title);
    } else {
        bookmarks.push(article);
    }

    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkIcon(article.title);
}

function updateBookmarkIcon(articleTitle) {
    const bookmarkButtons = document.querySelectorAll(`[data-article-title="${articleTitle}"]`);
    const isBookmarked = bookmarks.some(bookmark => bookmark.title === articleTitle);
    
    bookmarkButtons.forEach(button => {
        button.innerHTML = isBookmarked ? '★' : '☆';
        button.style.color = isBookmarked ? '#ffd700' : '#000';
    });
}

// Event delegation for dynamic content
document.getElementById("news-container").addEventListener("click", (event) => {
    if (event.target.classList.contains("upvote")) {
        updateVote(event.target, 1);
    } else if (event.target.classList.contains("downvote")) {
        updateVote(event.target, -1);
    } else if (event.target.classList.contains("discuss")) {
        toggleComments(event.target);
    } else if (event.target.classList.contains("share")) {
        shareArticle(event.target);
    } else if (event.target.classList.contains("post-comment")) {
        addComment(event.target);
    } else if (event.target.classList.contains("bookmark")) {
        const article = event.target.closest(".article");
        const articleData = {
            title: article.querySelector("h3").textContent,
            description: article.querySelector("p").textContent,
            url: article.querySelector("a").href,
            urlToImage: article.querySelector("img").src
        };
        toggleBookmark(articleData);
    }
});

// Handle logout
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('user');
    window.location.href = 'signup.html';
});

// Apply restrictions based on user role
function applyUserRestrictions() {
    if (user.role === "guest") {
        document.querySelectorAll(".bookmark, .post-comment").forEach(element => {
            element.addEventListener("click", () => {
                alert("Sign in to use this feature.");
            });
        });
    }
}

// Initialize restrictions
applyUserRestrictions();
