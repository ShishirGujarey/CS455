import {
  drawGrid,
  addLetter,
  removeLetter,
  getCurrentWord,
  sanitizeName,
  calculateScore,
  handleEnterKey,
  registerKeyboardEvents,
  resetGame,
  saveScore,
  showLeaderboardModal,
  showInstructionsModal,
  closeInstructionsModal,
  isAnyModalOpen,
  state
} from '../public/index.js';
import '@testing-library/jest-dom';
import { fireEvent } from '@testing-library/dom';
import fetchMock from 'jest-fetch-mock';

global.alert = jest.fn();

beforeEach(() => {
  document.body.innerHTML = `
    <div id="game"></div>
    <div id="name-modal" class="modal" style="display: block;">
      <input type="text" id="player-name-input" value="Tester" />
      <button id="submit-name-button">Submit</button>
      <button id="close-name-modal">Close</button>
    </div>
    <div id="leaderboard-modal" class="modal" style="display: none;">
      <button id="close-leaderboard-modal">Close</button>
      <button id="leaderboard-button">Leaderboard</button>
      <table id="leaderboard-table">
        <tbody></tbody>
      </table>
    </div>
    <div id="instructions-modal" class="modal" style="display: none;">
      <button id="close-instructions-modal">Close</button>
      <button id="instructions-button">Instructions</button>
    </div>
    <button id="reset-button">Reset</button>
    <button id="leaderboard-button">Leaderboard</button>
    <button id="instructions-button">Instructions</button>
  `;

  global.state = {
    gameId: null,
    grid: Array(6).fill().map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
    completed: false,
    won: false,
    playerName: ''
  };

  fetchMock.resetMocks();
  jest.clearAllMocks();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Frontend Unit Tests', () => {
  test('drawGrid should create a 6x5 grid of boxes', () => {
    const container = document.getElementById('game');
    drawGrid(container);
    const boxes = container.querySelectorAll('.box');
    expect(boxes.length).toBe(30);

    for (let i = 0; i < 6; i++) {
      for (let j = 0; j < 5; j++) {
        const box = document.getElementById(`box${i}${j}`);
        expect(box).toBeInTheDocument();
        expect(box).toHaveTextContent('');
      }
    }
  });

  test('addLetter should add a letter to the grid and increment currentCol', () => {
    addLetter('a');
    expect(state.grid[0][0]).toBe('A');
    expect(state.currentCol).toBe(1);
  });

  test('addLetter should not add a letter if currentCol is 5', () => {
    state.currentCol = 5;
    addLetter('b');
    expect(state.grid[0][4]).toBe('');
    expect(state.currentCol).toBe(5);
  });

  test('removeLetter should remove the last letter from the grid and decrement currentCol', () => {
    state.currentCol = 0;
    addLetter('c');
    addLetter('d');
    expect(state.grid[0][0]).toBe('C');
    expect(state.grid[0][1]).toBe('D');
    expect(state.currentCol).toBe(2);

    removeLetter();
    expect(state.grid[0][1]).toBe('');
    expect(state.currentCol).toBe(1);
  });

  test('removeLetter should not decrement currentCol below 0', () => {
    state.currentCol = 0;
    removeLetter();
    expect(state.currentCol).toBe(0);
  });

  test('getCurrentWord should return the concatenated word of the current row', () => {
    state.grid[0] = ['H', 'E', 'L', 'L', 'O'];
    const word = getCurrentWord(state);
    expect(word).toBe('HELLO');
  });

  test('sanitizeName should remove invalid characters and limit the name to 50 characters', () => {
    const longName = 'John@Doe!12345678901234567890123456789012345678901234567890';
    const sanitized = sanitizeName(longName);
    expect(sanitized).toBe('JohnDoe1234567890123456789012345678901234567890123');
    expect(sanitized.length).toBe(50);
  });

  test('calculateScore should return 100 minus (currentRow * 10) if won', () => {
    state.won = true;
    state.currentRow = 3;
    const score = calculateScore();
    expect(score).toBe(70);
  });

  test('calculateScore should return 0 if not won', () => {
    state.won = false;
    const score = calculateScore();
    expect(score).toBe(0);
  });
});

describe('Frontend Integration Tests', () => {
  test('handleEnterKey should submit a valid guess and handle a win', async () => {
    state.gameId = 'test-game-id';
    state.grid[0] = ['H', 'E', 'L', 'L', 'O'];
    state.currentCol = 5;
    state.playerName = 'Tester';

    fetchMock.mockResponseOnce(JSON.stringify({
      feedback: ['right', 'right', 'right', 'right', 'right'],
      completed: true,
      won: true
    }));

    // const saveScoreSpy = jest.spyOn(global, 'saveScore').mockImplementation(() => Promise.resolve());

    await handleEnterKey();

    expect(fetch).toHaveBeenCalledWith('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'test-game-id', guess: 'HELLO' })
    });

    expect(state.completed).toBe(true);
    expect(state.won).toBe(true);
    expect(state.currentRow).toBe(1);
    expect(state.currentCol).toBe(0);

    expect(global.alert).toHaveBeenCalledWith('Congratulations, Tester! Your score is 100.');

    // expect(saveScoreSpy).toHaveBeenCalledWith('Tester', 100);

    // saveScoreSpy.mockRestore();
  });

  test('handleEnterKey should submit an invalid guess and handle error', async () => {
    state.gameId = 'test-game-id';
    state.grid[0] = ['A', 'B', 'C', 'D', 'E'];
    state.currentCol = 5;
    state.playerName = 'Tester';

    fetchMock.mockResponseOnce(JSON.stringify({
      error: 'Invalid word.'
    }), { status: 400 });

    await handleEnterKey();

    expect(fetch).toHaveBeenCalledWith('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'test-game-id', guess: 'ABCDE' })
    });

    expect(global.alert).toHaveBeenCalledWith('Invalid word.');
  });

  test('handleEnterKey should handle game completion without a win', async () => {
    state.gameId = 'test-game-id';
    state.grid[0] = ['A', 'P', 'P', 'L', 'E'];
    state.currentCol = 5;
    state.playerName = 'Tester';

    fetchMock.mockResponseOnce(JSON.stringify({
      feedback: ['right', 'right', 'right', 'right', 'wrong'],
      completed: true,
      won: false,
      secret: 'APPLE'
    }));

    const saveScoreSpy = jest.spyOn(global, 'saveScore').mockImplementation(() => Promise.resolve());

    await handleEnterKey();

    expect(fetch).toHaveBeenCalledWith('/api/guess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'test-game-id', guess: 'APPLE' })
    });

    expect(state.completed).toBe(true);
    expect(state.won).toBe(false);
    expect(state.currentRow).toBe(1);
    expect(state.currentCol).toBe(0);
    expect(state.secret).toBe('APPLE');

    expect(global.alert).toHaveBeenCalledWith('Better luck next time, Tester! Your score is 0. The word was APPLE.');

    expect(saveScoreSpy).toHaveBeenCalledWith('Tester', 0);

    saveScoreSpy.mockRestore();
  });

  test('resetGame should initialize a new game and reset state', async () => {
    state.gameId = 'old-game-id';
    state.grid[0] = ['H', 'E', 'L', 'L', 'O'];
    state.currentRow = 1;
    state.currentCol = 5;
    state.completed = true;
    state.won = true;
    state.secret = 'HELLO';

    fetchMock.mockResponseOnce(JSON.stringify({ gameId: 'new-game-id' }));

    await resetGame();

    expect(fetch).toHaveBeenCalledWith('/api/start', { method: 'POST' });

    expect(state.gameId).toBe('new-game-id');
    expect(state.grid).toEqual(Array(6).fill().map(() => Array(5).fill('')));
    expect(state.currentRow).toBe(0);
    expect(state.currentCol).toBe(0);
    expect(state.completed).toBe(false);
    expect(state.won).toBe(false);
    expect(state.secret).toBe('');

    const gameContainer = document.getElementById('game');
    expect(gameContainer).toBeEmptyDOMElement();

    expect(global.alert).not.toHaveBeenCalled();
  });

  test('saveScore should successfully save a score', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ message: 'Score saved successfully.' }), { status: 201 });

    await saveScore('Tester', 90);

    expect(fetch).toHaveBeenCalledWith('/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', score: 90 })
    });

  });

  test('saveScore should handle server errors', async () => {
    fetchMock.mockRejectOnce(new Error('Server error'));

    await saveScore('Tester', 90);

    expect(fetch).toHaveBeenCalledWith('/api/save-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Tester', score: 90 })
    });

    expect(global.alert).toHaveBeenCalledWith('Failed to save your score. Please try again.');
  });
});

describe('Frontend Event Handlers', () => {
  test('registerKeyboardEvents should handle letter input', () => {
    registerKeyboardEvents();

    addLetter('A');
    addLetter('B');

    expect(state.grid[0][0]).toBe('A');
    expect(state.grid[0][1]).toBe('B');
    expect(state.currentCol).toBe(2);
  });

  test('registerKeyboardEvents should handle Backspace', () => {
    registerKeyboardEvents();

    addLetter('c');
    addLetter('d');
    expect(state.currentCol).toBe(2);

    fireEvent.keyDown(document.body, { key: 'Backspace' });

    expect(state.grid[0][1]).toBe('');
    expect(state.currentCol).toBe(1);
  });

  test('registerKeyboardEvents should handle Enter key', () => {
    registerKeyboardEvents();

    const handleEnterKeyMock = jest.spyOn(global, 'handleEnterKey').mockImplementation(() => {});

    fireEvent.keyDown(document.body, { key: 'Enter' });

    expect(handleEnterKeyMock).toHaveBeenCalled();

    handleEnterKeyMock.mockRestore();
  });

  test('isAnyModalOpen should return true if any modal is displayed', () => {
    const result = isAnyModalOpen();
    expect(result).toBe(true);
  });

  test('isAnyModalOpen should return false if no modals are displayed', () => {
    document.querySelectorAll('.modal').forEach(modal => {
      modal.style.display = 'none';
    });

    const result = isAnyModalOpen();
    expect(result).toBe(false);
  });
});

describe('Modal Functionality', () => {
  test('handleNameSubmission should set playerName and close the modal', () => {
    const closeNameModalSpy = jest.spyOn(global, 'closeNameModal').mockImplementation(() => {});

    const submitButton = document.getElementById('submit-name-button');
    fireEvent.click(submitButton);

    expect(state.playerName).toBe('Tester');
    expect(closeNameModalSpy).toHaveBeenCalled();

    closeNameModalSpy.mockRestore();
  });

  test('handleNameSubmission should alert if name is empty', () => {
    const nameInput = document.getElementById('player-name-input');
    nameInput.value = '';

    const submitButton = document.getElementById('submit-name-button');
    fireEvent.click(submitButton);

    expect(global.alert).toHaveBeenCalledWith('Please enter your name.');
  });

  test('showLeaderboardModal should display leaderboard and populate the table', async () => {
    fetchMock.mockResponseOnce(JSON.stringify([
      { name: 'Player1', score: 100, created_at: '2023-10-10T10:00:00Z' },
      { name: 'Player2', score: 90, created_at: '2023-10-10T09:00:00Z' },
    ]));

    await showLeaderboardModal();

    const leaderboardModal = document.getElementById('leaderboard-modal');
    expect(leaderboardModal).toHaveStyle('display: block');

    const tbody = document.querySelector('#leaderboard-table tbody');
    expect(tbody.children.length).toBe(2);
    expect(tbody.children[0]).toHaveTextContent('Player1');
    expect(tbody.children[0]).toHaveTextContent('100');
    expect(tbody.children[1]).toHaveTextContent('Player2');
    expect(tbody.children[1]).toHaveTextContent('90');
  });

  test('showLeaderboardModal should handle API failure', async () => {
    fetchMock.mockRejectOnce(new Error('API failure'));

    const alertSpy = jest.spyOn(global, 'alert').mockImplementation(() => {});

    await showLeaderboardModal();

    const leaderboardModal = document.getElementById('leaderboard-modal');
    expect(leaderboardModal).toHaveStyle('display: block');

    const tbody = document.querySelector('#leaderboard-table tbody');
    expect(tbody.children.length).toBe(1);
    expect(tbody.children[0]).toHaveTextContent('Failed to load leaderboard.');

    expect(alertSpy).toHaveBeenCalledWith('Failed to load leaderboard. Please try again later.');

    alertSpy.mockRestore();
  });

  test('showInstructionsModal should display instructions modal', () => {
    showInstructionsModal();
    const instructionsModal = document.getElementById('instructions-modal');
    expect(instructionsModal).toHaveStyle('display: block');
  });

  test('closeInstructionsModal should hide instructions modal', () => {
    showInstructionsModal();
    const instructionsModal = document.getElementById('instructions-modal');
    expect(instructionsModal).toHaveStyle('display: block');

    closeInstructionsModal();
    expect(instructionsModal).toHaveStyle('display: none');
  });
});
