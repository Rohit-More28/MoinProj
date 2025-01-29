// Category IDs for OpenTrivia DB
const CATEGORY_IDS = {
    general: 9,
    science: 17,
    sports: 21,
    geography: 22,
    history: 23,
    entertainment: 11,
    art: 25,
    tech: 18
};

// Store user stats
const userStats = {
    points: {
        general: 0,
        science: 0,
        sports: 0,
        geography: 0,
        history: 0,
        entertainment: 0,
        art: 0,
        tech: 0,
        total: 0
    },
    questionsAnswered: 0,
    correctAnswers: 0,
    streak: 0,
    categoryProgress: {}
};

// Store current questions
let currentQuestions = {};

// Initialize localStorage if not exists
function initializeStorage() {
    if (!localStorage.getItem('triviaStats')) {
        localStorage.setItem('triviaStats', JSON.stringify(userStats));
    }
    return JSON.parse(localStorage.getItem('triviaStats'));
}

// Load user stats
let stats = initializeStorage();

async function loadTrivia(category) {
    const categoryId = CATEGORY_IDS[category];
    const API_URL = `https://opentdb.com/api.php?amount=6&category=${categoryId}&type=multiple`;
    
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch questions');
        const data = await response.json();
        
        currentQuestions[category] = data.results;
        displayTriviaCards(category, data.results);
        
        // Update active category styling
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.textContent.toLowerCase().includes(category)) {
                btn.classList.add('active');
            }
        });
    } catch (error) {
        console.error('Error loading trivia:', error);
        document.getElementById('news-container').innerHTML = 
            '<p class="error">Error loading trivia questions. Please try again later.</p>';
    }
}

function displayTriviaCards(category, questions) {
    const container = document.getElementById('news-container');
    container.innerHTML = '';

    questions.forEach((question, index) => {
        const options = [...question.incorrect_answers, question.correct_answer];
        shuffleArray(options);

        const card = document.createElement('div');
        card.className = 'article trivia-card';
        card.innerHTML = `
            <div class="difficulty-badge ${question.difficulty}">${question.difficulty}</div>
            <h3>Question ${index + 1}</h3>
            <p class="question-text">${question.question}</p>
            <div class="options-container">
                ${options.map((option, i) => `
                    <button class="option-button" 
                            onclick="selectAnswer('${category}', ${index}, '${encodeURIComponent(option)}', this)">
                        ${option}
                    </button>
                `).join('')}
            </div>
            <div class="result-message" id="${category}-result-${index}"></div>
            <div class="news-options">
                <span class="category-tag">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
                <span class="points">Points: <span id="${category}-points-${index}">0</span></span>
                <span class="streak-bonus hidden" id="${category}-streak-${index}">Streak Bonus: +5</span>
            </div>
        `;

        container.appendChild(card);
    });
}

function selectAnswer(category, questionIndex, selectedAnswer, buttonElement) {
    selectedAnswer = decodeURIComponent(selectedAnswer);
    const question = currentQuestions[category][questionIndex];
    const resultElement = document.getElementById(`${category}-result-${questionIndex}`);
    const pointsElement = document.getElementById(`${category}-points-${questionIndex}`);
    const streakElement = document.getElementById(`${category}-streak-${questionIndex}`);
    const allOptions = buttonElement.parentElement.getElementsByClassName('option-button');
    
    // Disable all options after selection
    Array.from(allOptions).forEach(button => {
        button.disabled = true;
        button.classList.remove('selected');
    });
    
    buttonElement.classList.add('selected');
    
    let pointsEarned = 0;
    if (selectedAnswer === question.correct_answer) {
        // Calculate points based on difficulty
        pointsEarned = calculatePoints(question.difficulty);
        
        // Add streak bonus if applicable
        if (stats.streak >= 3) {
            pointsEarned += 5;
            streakElement.classList.remove('hidden');
        }
        
        resultElement.innerHTML = `✅ Correct! +${pointsEarned} points`;
        resultElement.className = 'result-message correct';
        stats.streak++;
        stats.correctAnswers++;
    } else {
        resultElement.innerHTML = `❌ Wrong! The correct answer was: ${question.correct_answer}`;
        resultElement.className = 'result-message incorrect';
        stats.streak = 0;
        streakElement.classList.add('hidden');
    }
    
    pointsElement.textContent = pointsEarned;
    updateStats(category, pointsEarned);
}

function calculatePoints(difficulty) {
    switch(difficulty) {
        case 'easy': return 5;
        case 'medium': return 10;
        case 'hard': return 15;
        default: return 10;
    }
}

function updateStats(category, points) {
    stats.points[category] += points;
    stats.points.total += points;
    stats.questionsAnswered++;
    
    // Update UI
    document.getElementById('total-points').textContent = stats.points.total;
    document.getElementById('total-points-display').textContent = stats.points.total;
    document.getElementById('questions-answered').textContent = stats.questionsAnswered;
    document.getElementById('success-rate').textContent = 
        `${Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)}%`;
    
    // Save to localStorage
    localStorage.setItem('triviaStats', JSON.stringify(stats));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Load stats on page load
window.addEventListener('DOMContentLoaded', () => {
    stats = initializeStorage();
    document.getElementById('total-points').textContent = stats.points.total;
    document.getElementById('total-points-display').textContent = stats.points.total;
    document.getElementById('questions-answered').textContent = stats.questionsAnswered;
    document.getElementById('success-rate').textContent = 
        stats.questionsAnswered ? 
        `${Math.round((stats.correctAnswers / stats.questionsAnswered) * 100)}%` : '0%';
        
    // Load default category
    loadTrivia('general');
});