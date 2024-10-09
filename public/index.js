const API_URL = '/api';
export const state = {
  gameId: null,
  grid: Array(6).fill().map(() => Array(5).fill('')),
  currentRow: 0,
  currentCol: 0,
  completed: false,
  won: false
};

function drawGrid(container) {
  if (!container) return;
  container.innerHTML = '';
  const grid = document.createElement('div');
  grid.className = 'grid';

  for (let i = 0; i < 6; i++) {
    for (let j = 0; j < 5; j++) {
      drawBox(grid, i, j);
    }
  }

  container.appendChild(grid);
}

function updateGrid() {
  const row = state.currentRow;
  for (let j = 0; j < state.grid[row].length; j++) {
    const box = document.getElementById(`box${row}${j}`);
    box.textContent = state.grid[row][j];
  }
}

function drawBox(container, row, col, letter = '') {
  const box = document.createElement('div');
  box.className = 'box';
  box.textContent = letter;
  box.id = `box${row}${col}`;

  container.appendChild(box);
  return box;
}

function registerKeyboardEvents() {
  document.body.onkeydown = (e) => {
    if (state.completed) return;
    const key = e.key;
    if (key === 'Enter') {
      handleEnterKey();
    }
    if (key === 'Backspace') {
      removeLetter();
    }
    if (isLetter(key)) {
      addLetter(key);
    }
    updateGrid();
  };
}

async function handleEnterKey() {
  if (state.currentCol === 5) {
    const word = getCurrentWord(state);
    try {
      const response = await submitGuess(word);
      await applyFeedback(response.feedback); // Wait for animations to complete
      state.completed = response.completed;
      state.won = response.won;

      if (!state.completed) {
        state.currentRow++;
        state.currentCol = 0;
      }

      if (state.completed) {
        if (state.won) {
          alert('Congratulations!');
        } else {
          state.secret = response.secret;
          alert(`Better luck next time! The word was ${state.secret}.`);
        }
      }
    } catch (error) {
      alert(error.message);
    }
  }
}

function getCurrentWord(state) {
  return state.grid[state.currentRow].reduce((prev, curr) => prev + curr);
}

function isLetter(key) {
  return key.length === 1 && /^[a-zA-Z]$/.test(key);
}

function addLetter(letter) {
  if (state.currentCol === 5) return;
  state.grid[state.currentRow][state.currentCol] = letter.toUpperCase();
  state.currentCol++;
}

function removeLetter() {
  if (state.currentCol === 0) return;
  state.grid[state.currentRow][state.currentCol - 1] = '';
  state.currentCol--;
}

async function submitGuess(word) {
  if (!state.gameId) {
    throw new Error('Game not started.');
  }
  const response = await fetch(`${API_URL}/guess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gameId: state.gameId,
      guess: word
    })
  });
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Error submitting guess.');
  }
  return response.json();
}

function applyFeedback(feedback) {
  const row = state.currentRow;
  const animation_duration = 500;
  const totalBoxes = 5;

  return new Promise((resolve) => {
    for (let i = 0; i < totalBoxes; i++) {
      const box = document.getElementById(`box${row}${i}`);
      const feedbackClass = feedback[i];
      
      box.classList.add('animated');
      box.style.animationDelay = `${(i * animation_duration) / 2}ms`;

      setTimeout(() => {
        box.classList.add(feedbackClass);

        if (i === totalBoxes - 1) {
          setTimeout(() => {
            resolve();
          }, animation_duration);
        }
      }, ((i + 1) * animation_duration) / 2);
    }
  });
}

async function resetGame() {
  try {
    const response = await fetch(`${API_URL}/start`, {
      method: 'POST'
    });
    const data = await response.json();
    state.gameId = data.gameId;
    state.grid = Array(6).fill().map(() => Array(5).fill(''));
    state.currentRow = 0;
    state.currentCol = 0;
    state.completed = false;
    state.won = false;
    state.secret = '';

    const game = document.getElementById('game');
    game.innerHTML = '';
    drawGrid(game);
    updateGrid();

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 5; j++) {
        const box = document.getElementById(`box${i}${j}`);
        if (box) {
          box.classList.remove('right', 'wrong', 'empty', 'animated');
          box.style.animationDelay = '';
        }
      }
    }

    const resetButton = document.getElementById('reset-button');
    if (resetButton) {    
      resetButton.blur();
    }
  } catch (error) {
    alert('Error resetting game.');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const resetButton = document.getElementById('reset-button');
  if (resetButton) {
    resetButton.addEventListener('click', resetGame);
  }
  resetGame();
  registerKeyboardEvents();
});

export { getCurrentWord, resetGame, isLetter, addLetter, removeLetter, drawGrid, updateGrid, registerKeyboardEvents, handleEnterKey };
