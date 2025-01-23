const API_URL = 'https://opentdb.com/api.php?amount=50&category=9&difficulty=medium&type=multiple';
        const questionElement = document.getElementById('question');
        const optionsContainer = document.getElementById('options');
        const submitButton = document.getElementById('submit-answer');
        const resultMessage = document.getElementById('result-message');
        let currentQuestion = null;
        let selectedOptionIndex = null;

        async function fetchQuestion() {
            try {
                const response = await fetch(API_URL);
                if (!response.ok) throw new Error('Failed to fetch question');
                const data = await response.json();
                currentQuestion = data.results[0];
                displayQuestion();
            } catch (error) {
                questionElement.textContent = 'Error loading question.';
                console.error(error);
            }
        }
        function displayQuestion() {
            questionElement.textContent = currentQuestion.question;
            const allOptions = [...currentQuestion.incorrect_answers, currentQuestion.correct_answer];
            shuffleArray(allOptions); // Shuffle the options for randomness
            optionsContainer.innerHTML = '';
            allOptions.forEach((option, index) => {
                const button = document.createElement('button');
                button.textContent = option;
                button.className = 'option-button';
                button.onclick = () => selectOption(index);
                optionsContainer.appendChild(button);
            });
            submitButton.disabled = true;
        }

        function selectOption(index) {
            selectedOptionIndex = index;
            Array.from(optionsContainer.children).forEach((button, i) => {
                button.classList.toggle('selected', i === index);
            });
            submitButton.disabled = false;
        }
        async function submitAnswer() {
            const selectedAnswer = optionsContainer.children[selectedOptionIndex].textContent;
            const isCorrect = selectedAnswer === currentQuestion.correct_answer;
            resultMessage.textContent = isCorrect ? 'Correct! +10 points' : 'Wrong answer.';
            fetchQuestion();
        }

        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]];
            }
        }

        submitButton.addEventListener('click', submitAnswer);
        fetchQuestion();