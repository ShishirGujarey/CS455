import { state, handleEnterKey, saveScore } from '../public/index.js';
import fetchMock from 'jest-fetch-mock';

fetchMock.enableMocks();

describe('Frontend Integration Tests', () => {
  beforeEach(() => {
    fetch.resetMocks();
    document.body.innerHTML = `
      <div id="game">
        <div id="box00" class="box"></div>
        <div id="box01" class="box"></div>
        <div id="box02" class="box"></div>
        <div id="box03" class="box"></div>
        <div id="box04" class="box"></div>
      </div>
      <div id="name-modal" class="modal" style="display: block;">
        <input type="text" id="player-name-input" value="Tester" />
      </div>
    `;
    global.state = {
      gameId: 'test-game-id',
      grid: Array(6).fill().map(() => Array(5).fill('')),
      currentRow: 0,
      currentCol: 5,
      completed: false,
      won: false,
      playerName: 'Tester'
    };
  });

  test('handleEnterKey should submit a valid guess and update state', async () => {
    fetch.mockResponseOnce(JSON.stringify({
      feedback: ['right', 'right', 'right', 'right', 'right'],
      completed: true,
      won: true
    }));

    window.alert = jest.fn();

    jest.spyOn(global, 'getCurrentWord').mockReturnValue('APPLE');

    await handleEnterKey();

    expect(fetch).toHaveBeenCalledWith('/api/guess', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameId: 'test-game-id', guess: 'APPLE' })
    }));

    expect(state.completed).toBe(true);
    expect(state.won).toBe(true);
    expect(window.alert).toHaveBeenCalledWith('Congratulations, Tester! Your score is 100.');

    global.getCurrentWord.mockRestore();
  });

  test('saveScore should send a POST request to save the score', async () => {
    fetch.mockResponseOnce(JSON.stringify({ message: 'Score saved successfully.' }), { status: 201 });

    await saveScore('TestPlayer', 80);

    expect(fetch).toHaveBeenCalledWith('/api/save-score', expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'TestPlayer', score: 80 })
    }));
  });

  test('saveScore should handle server errors', async () => {
    fetch.mockReject(new Error('Failed to save score.'));

    window.alert = jest.fn();

    await saveScore('TestPlayer', 80);

    expect(window.alert).toHaveBeenCalledWith('Failed to save your score. Please try again.');
  });
});
