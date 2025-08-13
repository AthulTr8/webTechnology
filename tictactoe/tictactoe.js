let gameBoard = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // X always starts
let gameActive = true;
let gameMode = 'medium'; // Default mode
let userSymbol = 'X'; // Default to X
let aiSymbol = 'O';

const cells = document.querySelectorAll('.cell');
const statusMessage = document.getElementById("status-message");

// Reset game
function resetGame() {
    gameBoard.fill('');
    currentPlayer = 'X';
    gameActive = true;
    
    // Clear any winning animations
    cells.forEach(cell => {
        cell.classList.remove('winner', 'x-marked', 'o-marked');
    });
    
    updateBoard();
    statusMessage.innerText = "X's turn";
    
    // Update AI symbol based on user choice
    aiSymbol = userSymbol === 'X' ? 'O' : 'X';
    
    if (gameMode !== 'multi' && currentPlayer !== userSymbol) {
        setTimeout(aiMove, 500);
    }
}

// Event Listeners
document.getElementById("restart").addEventListener("click", resetGame);

document.getElementById("hardness").addEventListener("change", function() {
    gameMode = this.value;
    resetGame();
});

document.querySelectorAll('.choice').forEach(button => {
    button.addEventListener('click', (event) => {
        userSymbol = event.target.value;
        resetGame();
    });
});

cells.forEach((cell, index) => {
    cell.addEventListener('click', () => handleMove(index));
});

function handleMove(index) {
    if (gameBoard[index] !== '' || !gameActive) return;
    
    gameBoard[index] = currentPlayer;
    updateBoard();
    
    checkGameState();
    
    if (gameActive) {
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        statusMessage.innerText = `${currentPlayer}'s turn`;
        
        if (gameMode !== 'multi' && currentPlayer !== userSymbol) {
            setTimeout(aiMove, 500);
        }
    }
}

function checkGameState() {
    let result = checkWinner();
    if (result) {
        gameActive = false;
        if (result.winner) {
            statusMessage.innerText = `${result.winner} Wins!`;
            // Animate the winning cells
            result.pattern.forEach(index => {
                cells[index].classList.add('winner');
            });
        } else {
            statusMessage.innerText = "It's a Draw!";
        }
        return true;
    }
    return false;
}

function aiMove() {
    if (!gameActive) return;
    
    let bestMove;
    switch(gameMode) {
        case 'easy':
            bestMove = randomMove();
            break;
        case 'medium':
            // 50% chance of making the best move
            /*bestMove = Math.random() < 1 ? 
                findBestMove(gameBoard, 9) : 
                randomMove();*/
                findMediumMove(gameBoard);
                break;
        case 'hard':
            bestMove = findBestMove(gameBoard, 9);
            break;
        default:
           // bestMove = randomMove();
           findMediumMove(gameBoard);
    }
    
    gameBoard[bestMove] = currentPlayer;
    updateBoard();
    
    if (!checkGameState() && gameActive) {
        currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
        statusMessage.innerText = `${currentPlayer}'s turn`;
    }
}

function randomMove() {
    let availableMoves = gameBoard.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
    return availableMoves[Math.floor(Math.random() * availableMoves.length)];
}


function findBestMove(board, depth) {
    let bestScore = -Infinity;
    let bestMove = null;
    
    // Get all available moves
    let availableMoves = board.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
    
    // Try each move
    for (let move of availableMoves) {
        board[move] = currentPlayer;
        let score = minimax(board, depth, false);
        board[move] = '';
        
        if (score > bestScore) {
            bestScore = score;
            bestMove = move;
        }
    }
    
    return bestMove;
}

function minimax(board, depth, isMaximizing) {
    // Terminal conditions
    let result = checkWinner();
    
    if (result && result.winner === aiSymbol) return 10 - depth;
    if (result && result.winner === userSymbol) return -10 + depth;
    if (result && !result.winner) return 0; // Draw
    if (depth === 0) return 0;
    
    if (isMaximizing) {
        let bestScore = -Infinity;
        let availableMoves = board.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
        
        for (let move of availableMoves) {
            let savedCurrentPlayer = currentPlayer;
            currentPlayer = aiSymbol;
            board[move] = currentPlayer;
            
            let score = minimax(board, depth - 1, false);
            
            board[move] = '';
            currentPlayer = savedCurrentPlayer;
            bestScore = Math.max(score, bestScore);
        }
        
        return bestScore;
    } else {
        let bestScore = Infinity;
        let availableMoves = board.map((cell, i) => cell === '' ? i : null).filter(i => i !== null);
        
        for (let move of availableMoves) {
            let savedCurrentPlayer = currentPlayer;
            currentPlayer = userSymbol;
            board[move] = currentPlayer;
            
            let score = minimax(board, depth - 1, true);
            
            board[move] = '';
            currentPlayer = savedCurrentPlayer;
            bestScore = Math.min(score, bestScore);
        }
        
        return bestScore;
    }
}

function updateBoard() {
    cells.forEach((cell, i) => {
        cell.textContent = gameBoard[i];
        
        // Add classes for styling
        if (gameBoard[i] === 'X') {
            cell.classList.add('x-marked');
            cell.classList.remove('o-marked');
        } else if (gameBoard[i] === 'O') {
            cell.classList.add('o-marked');
            cell.classList.remove('x-marked');
        } else {
            cell.classList.remove('x-marked', 'o-marked');
        }
    });
}

function checkWinner() {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (gameBoard[a] && gameBoard[a] === gameBoard[b] && gameBoard[a] === gameBoard[c]) {
            return {
                winner: gameBoard[a],
                pattern: pattern
            };
        }
    }
    
    return gameBoard.includes('') ? null : { winner: null, pattern: null }; // Draw
}

// Initialize the game
window.onload = function() {
    gameMode = document.getElementById("hardness").value;
    resetGame();
};
function findMediumMove(board) {
    // 70% chance of making the best move (blocking or winning)
    const makeSmartMove = Math.random() < 0.7;
    
    if (makeSmartMove) {
        // First check if AI can win
        const winningMove = findWinningMove(board, aiSymbol);
        if (winningMove !== null) {
            gameBoard[winningMove] = currentPlayer;
            return;
        }
        
        // Then check if player can win and block
        const blockingMove = findWinningMove(board, userSymbol);
        if (blockingMove !== null) {
            gameBoard[blockingMove] = currentPlayer;
            return;
        }
        
        // If no winning or blocking move, make a strategic move
        const strategicMove = findBestMove(board, 2); // Reduced depth for medium difficulty
        gameBoard[strategicMove] = currentPlayer;
    } else {
        // 30% of the time, make a random move
        const randomMoveIndex = randomMove();
        gameBoard[randomMoveIndex] = currentPlayer;
    }
}
function findWinningMove(board, playerSymbol) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    // Check each win pattern
    for (let pattern of winPatterns) {
        const [a, b, c] = pattern;
        
        // Check if player has two in a row and the third cell is empty
        if (board[a] === playerSymbol && board[b] === playerSymbol && board[c] === '') {
            return c;
        }
        if (board[a] === playerSymbol && board[c] === playerSymbol && board[b] === '') {
            return b;
        }
        if (board[b] === playerSymbol && board[c] === playerSymbol && board[a] === '') {
            return a;
        }
    }
    
    return null; // No winning move found
}