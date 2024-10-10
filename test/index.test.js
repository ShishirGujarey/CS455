import {
  state,
  drawGrid,
  addLetter,
  getCurrentWord,
  calculateScore
} from '../public/index.js';

describe('Frontend Unit Tests', () => {
  let container;

  beforeEach(() => {
    document.body.innerHTML = `<div id="game"></div>`;
    container = document.getElementById('game');
    global.state = {
      gameId: null,
      grid: Array(6).fill().map(() => Array(5).fill('')),
      currentRow: 0,
      currentCol: 0,
      completed: false,
      won: false,
      playerName: ''
    };
  });

  test('drawGrid should create a 6x5 grid', () => {
    drawGrid(container);
    const boxes = container.querySelectorAll('.box');
    expect(boxes.length).toBe(30);
  });

  test('addLetter should add a letter to the grid', () => {
    addLetter('a');
    expect(state.grid[0][0]).toBe('A');
    expect(state.currentCol).toBe(1);
  });

  test('getCurrentWord should return the current guess as a string', () => {
    state.grid[0] = ['A', 'P', 'P', 'L', 'E'];
    const word = getCurrentWord(state);
    expect(word).toBe('APPLE');
  });

  test('calculateScore should return correct score for win', () => {
    state.won = true;
    state.currentRow = 2;
    const score = calculateScore();
    expect(score).toBe(100 - (2 * 10)); // 80
  });

  test('calculateScore should return 0 for loss', () => {
    state.won = false;
    const score = calculateScore();
    expect(score).toBe(0);
  });
});
