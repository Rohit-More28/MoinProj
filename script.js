const profanityFilter = {
    // Add common inappropriate words to this array
    bannedWords: ['badword1', 'badword2', 'inappropriate', 'vulgar'],
    
    // Method to check if text contains inappropriate content
    containsProfanity(text) {
        const words = text.toLowerCase().split(/\s+/);
        return this.bannedWords.some(banned => 
            words.some(word => word.includes(banned))
        );
    },
    
    // Method to clean text
    clean(text) {
        return text.split(/\s+/)
            .map(word => {
                if (this.bannedWords.some(banned => word.toLowerCase().includes(banned))) {
                    return '*'.repeat(word.length);
                }
                return word;
            })
            .join(' ');
    }
};

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

// Function to fetch and display news articles dynamically
async function fetchNews(category) {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(category)}&apiKey=ecfccc58d345415bb9818c6612a272aa`);
        const data = await response.json();

        const newsContainer = document.getElementById("news-container");
        newsContainer.innerHTML = ""; // Clear existing articles

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
                </div>
                <div class="comments-section" style="display: none;">
                    <textarea placeholder="Add a comment"></textarea>
                    <button class="post-comment">Post Comment</button>
                    <ul class="comments-list"></ul>
                </div>
            `;

            newsContainer.appendChild(articleElement);
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

// Function to handle upvote/downvote
function updateVote(button, change) {
    const voteContainer = button.closest(".vote-container");
    const voteCountElement = voteContainer.querySelector(".vote-count");
    let currentVotes = parseInt(voteCountElement.textContent, 10);
    currentVotes += change;
    voteCountElement.textContent = currentVotes;
}

// Function to toggle the comments section
function toggleComments(button) {
    const article = button.closest(".article");
    const commentsSection = article.querySelector(".comments-section");
    
    // Reset other comment sections first
    document.querySelectorAll(".comments-section").forEach(section => {
        if (section !== commentsSection) {
            section.style.display = "none";
        }
    });
    
    // Toggle the clicked comment section
    commentsSection.style.display =
        commentsSection.style.display === "none" || commentsSection.style.display === ""
            ? "block"
            : "none";
}

// Function to add a comment
function addComment(button) {
    const commentsSection = button.closest(".comments-section");
    const textarea = commentsSection.querySelector("textarea");
    const commentText = textarea.value.trim();
    
    if (commentText) {
        // Check for inappropriate content
        if (profanityFilter.containsProfanity(commentText)) {
            alert("Your comment contains inappropriate language. Please revise it.");
            return;
        }
        
        const commentsList = commentsSection.querySelector(".comments-list");
        const newComment = document.createElement("li");
        
        // Create comment structure
        newComment.innerHTML = `
            <div class="comment-content">
                <span class="comment-text">${commentText}</span>
                <div class="comment-metadata">
                    <span class="comment-time">${new Date().toLocaleString()}</span>
                </div>
            </div>
        `;
        
        commentsList.appendChild(newComment);
        textarea.value = ""; // Clear the textarea
    }
}

// Function to share the article link
function shareArticle(button) {
    const article = button.closest(".article");
    const articleLink = article.querySelector("a").href;
    navigator.clipboard.writeText(articleLink)
        .then(() => {
            alert("Link copied to clipboard!");
        })
        .catch(err => {
            console.error('Failed to copy link:', err);
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
    }
});

// Settings sidebar functionality
const settingsButton = document.getElementById('settings-button');
const settingsSidebar = document.getElementById('settings-sidebar');
const settingsOverlay = document.getElementById('settings-overlay');
const backArrow = document.querySelector('.back-arrow');
const logoutButton = document.getElementById('logout-button');

// Function to open settings sidebar
function openSettingsSidebar() {
    settingsSidebar.classList.add('active');
    settingsOverlay.style.display = 'block';
}

// Function to close settings sidebar
function closeSettingsSidebar() {
    settingsSidebar.classList.remove('active');
    settingsOverlay.style.display = 'none';
}

// Event listeners for settings sidebar
settingsButton.addEventListener('click', (event) => {
    event.stopPropagation();
    openSettingsSidebar();
});

backArrow.addEventListener('click', () => {
    closeSettingsSidebar();
});

settingsOverlay.addEventListener('click', () => {
    closeSettingsSidebar();
});

// Handle logout
// Find the existing logout button handler in script.js and replace it with this:

// Handle logout
logoutButton.addEventListener('click', (e) => {
    e.preventDefault();
    // Clear any user data or session if needed
    localStorage.removeItem('user'); // If you're storing any user data
    // Redirect to signup page
    window.location.href = 'signup.html';
});
// Prevent clicks inside settings sidebar from closing it
settingsSidebar.addEventListener('click', (event) => {
    event.stopPropagation();
});
// Add this to script.js

// Store bookmarks in localStorage
let bookmarks = JSON.parse(localStorage.getItem('bookmarks')) || [];

// Function to add or remove bookmark
function toggleBookmark(article) {
    const isBookmarked = bookmarks.some(bookmark => bookmark.title === article.title);
    
    if (isBookmarked) {
        bookmarks = bookmarks.filter(bookmark => bookmark.title !== article.title);
    } else {
        bookmarks.push(article);
    }
    
    localStorage.setItem('bookmarks', JSON.stringify(bookmarks));
    updateBookmarkIcon(article.title);
}

// Function to update bookmark icon
function updateBookmarkIcon(articleTitle) {
    const bookmarkButtons = document.querySelectorAll(`[data-article-title="${articleTitle}"]`);
    const isBookmarked = bookmarks.some(bookmark => bookmark.title === articleTitle);
    
    bookmarkButtons.forEach(button => {
        button.innerHTML = isBookmarked ? '★' : '☆';
        button.style.color = isBookmarked ? '#ffd700' : '#000';
    });
}

// Modify the article creation in fetchNews function
async function fetchNews(category) {
    try {
        const response = await fetch(`https://newsapi.org/v2/everything?q=${encodeURIComponent(category)}&apiKey=ecfccc58d345415bb9818c6612a272aa`);
        const data = await response.json();

        const newsContainer = document.getElementById("news-container");
        newsContainer.innerHTML = "";

        data.articles.forEach((article) => {
            const articleElement = document.createElement("div");
            articleElement.classList.add("article");

            // Add bookmark button to the news options
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
                    <button class="bookmark" data-article-title="${article.title}">☆</button>
                </div>
                <div class="comments-section" style="display: none;">
                    <textarea placeholder="Add a comment"></textarea>
                    <button class="post-comment">Post Comment</button>
                    <ul class="comments-list"></ul>
                </div>
            `;

            newsContainer.appendChild(articleElement);
            
            // Update bookmark icon if article is already bookmarked
            updateBookmarkIcon(article.title);
        });
    } catch (error) {
        console.error('Error fetching news:', error);
    }
}

// Add bookmark event handler to the event delegation
document.getElementById("news-container").addEventListener("click", (event) => {
    if (event.target.classList.contains("bookmark")) {
        const article = event.target.closest(".article");
        const articleData = {
            title: article.querySelector("h3").textContent,
            description: article.querySelector("p").textContent,
            url: article.querySelector("a").href,
            urlToImage: article.querySelector("img").src
        };
        toggleBookmark(articleData);
    }
    // ... existing event handlers ...
});
