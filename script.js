document.addEventListener('DOMContentLoaded', () => {
    const board = document.getElementById('board');
    const status = document.getElementById('status');
    const gameModeSelect = document.getElementById('gameMode');
    const difficultySelect = document.getElementById('difficulty');
    const difficultyLabel = document.getElementById('difficultyLabel');
    const startButton = document.getElementById('startButton');
    const resetButton = document.getElementById('resetButton');
    let currentPlayer = 'X'; // 'X' is Player 1, 'O' is Player 2 or AI
    let gameActive = false;
    let timer;
    let timeLimit;
    let isAI = false;

    gameModeSelect.addEventListener('change', () => {
        if (gameModeSelect.value === 'ai') {
            isAI = true;
            difficultySelect.style.display = 'inline';
            difficultyLabel.style.display = 'inline';
        } else {
            isAI = false;
            difficultySelect.style.display = 'none';
            difficultyLabel.style.display = 'none';
        }
    });

    startButton.addEventListener('click', () => {
        if (gameModeSelect.value === '') {
            alert('Please select a game mode to start.');
            return;
        }

        if (isAI && difficultySelect.value === '') {
            alert('Please select a difficulty level to play with AI.');
            return;
        }

        // Initialize the game board
        initializeBoard();
        gameActive = true;
        board.style.display = 'grid';
        resetButton.style.display = 'inline';
        startButton.style.display = 'none';
        setTimeLimit();
        startTimer();
        status.textContent = `Player ${currentPlayer}'s turn`;
    });

    function initializeBoard() {
        board.innerHTML = ''; // Clear previous cells if any
        for (let i = 0; i < 16; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            board.appendChild(cell);
        }
    }

    function setTimeLimit() {
        if (isAI) {
            const difficulty = difficultySelect.value;
            if (difficulty === 'easy') {
                timeLimit = 10;
            } else if (difficulty === 'medium') {
                timeLimit = 7;
            } else if (difficulty === 'hard') {
                timeLimit = 5;
            }
        } else {
            timeLimit = 15; // 15 seconds for two-player mode
        }
    }

    function startTimer() {
        if (!gameActive) return;
        clearInterval(timer);
        let timeRemaining = timeLimit;
        status.textContent = `Player ${currentPlayer}'s turn. Time left: ${timeRemaining}s`;

        timer = setInterval(() => {
            timeRemaining--;
            status.textContent = `Player ${currentPlayer}'s turn. Time left: ${timeRemaining}s`;

            if (timeRemaining <= 0) {
                clearInterval(timer);
                status.textContent = `Time's up!`;
                if (isAI && currentPlayer === 'X') {
                    currentPlayer = 'O';
                    setTimeout(computerMove, 500);
                } else {
                    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
                    startTimer();
                }
            }
        }, 1000);
    }

    function handleCellClick(event) {
        if (!gameActive || event.target.textContent !== '') return;

        if (isAI && currentPlayer !== 'X') return; // Prevent user from playing when it's AI's turn

        event.target.textContent = currentPlayer;
        event.target.classList.add('taken');
        clearInterval(timer);

        if (checkWin(currentPlayer)) {
            status.textContent = `Player ${currentPlayer} wins!`;
            gameActive = false;
            return;
        }

        if (isDraw()) {
            status.textContent = 'Draw!';
            gameActive = false;
            return;
        }

        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

        if (isAI && currentPlayer === 'O') {
            status.textContent = `Computer's turn`;
            setTimeout(computerMove, 500);
        } else {
            status.textContent = `Player ${currentPlayer}'s turn`;
            setTimeLimit();
            startTimer();
        }
    }

    function computerMove() {
        if (!gameActive) return;

        const difficulty = difficultySelect.value;
        let chosenCell;

        if (difficulty === 'easy') {
            chosenCell = chooseRandomCell();
        } else if (difficulty === 'medium') {
            chosenCell = blockUserMove() || chooseRandomCell();
        } else if (difficulty === 'hard') {
            chosenCell = attemptWin('O') || blockUserMove() || chooseStrategicMove() || chooseRandomCell();
        }

        if (chosenCell) {
            chosenCell.textContent = 'O';
            chosenCell.classList.add('taken');

            if (checkWin('O')) {
                status.textContent = 'Computer wins!';
                gameActive = false;
                return;
            }

            if (isDraw()) {
                status.textContent = 'Draw!';
                gameActive = false;
                return;
            }

            currentPlayer = 'X';
            status.textContent = `Player ${currentPlayer}'s turn`;
            setTimeLimit();
            startTimer();
        }
    }

    function chooseRandomCell() {
        const emptyCells = [...document.querySelectorAll('.cell')].filter(cell => cell.textContent === '');
        return emptyCells.length > 0 ? emptyCells[Math.floor(Math.random() * emptyCells.length)] : null;
    }

    function blockUserMove() {
        return attemptWin('X');
    }

    function attemptWin(player) {
        const emptyCells = [...document.querySelectorAll('.cell')].filter(cell => cell.textContent === '');
        for (let cell of emptyCells) {
            cell.textContent = player;
            if (checkWin(player)) {
                cell.textContent = ''; // Reset after test
                return cell;
            }
            cell.textContent = ''; // Reset after test
        }
        return null;
    }

    function chooseStrategicMove() {
        const strategicIndices = [0, 3, 12, 15, 5, 6, 9, 10];
        const emptyCells = [...document.querySelectorAll('.cell')].filter(cell => cell.textContent === '');
        return emptyCells.find(cell => strategicIndices.includes(parseInt(cell.getAttribute('data-index'))));
    }

    function checkWin(player) {
        const winPatterns = [
            [0, 1, 2, 3], [4, 5, 6, 7], [8, 9, 10, 11], [12, 13, 14, 15],
            [0, 4, 8, 12], [1, 5, 9, 13], [2, 6, 10, 14], [3, 7, 11, 15],
            [0, 5, 10, 15], [3, 6, 9, 12]
        ];

        return winPatterns.some(pattern => pattern.every(index => {
            return document.querySelector(`.cell[data-index="${index}"]`).textContent === player;
        }));
    }

    function isDraw() {
        return [...document.querySelectorAll('.cell')].every(cell => cell.textContent !== '');
    }

    window.resetGame = function() {
        currentPlayer = 'X';
        gameActive = false;
        clearInterval(timer);
        board.style.display = 'none';
        resetButton.style.display = 'none';
        startButton.style.display = 'inline';
        status.textContent = '';
        initializeBoard();
    };
});
