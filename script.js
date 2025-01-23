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
    const response = await fetch(`https://newsapi.org/v2/everything?q=${category}&apiKey=ecfccc58d345415bb9818c6612a272aa`);
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
                <button>Post Comment</button>
                <ul class="comments-list"></ul>
            </div>
        `;

        newsContainer.appendChild(articleElement);
    });
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
        const commentsList = commentsSection.querySelector(".comments-list");
        const newComment = document.createElement("li");
        newComment.textContent = commentText;
        commentsList.appendChild(newComment);
        textarea.value = ""; // Clear the textarea
    }
}

// Function to share the article link
function shareArticle(button) {
    const article = button.closest(".article");
    const articleLink = article.querySelector("a").href;  // Get the link from the article
    navigator.clipboard.writeText(articleLink).then(() => {
        alert("Link copied to clipboard!");
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
    } else if (event.target.textContent === "Post Comment") {
        addComment(event.target);
    }
});
