import request from 'supertest';
import app from '../server.js';
import { query } from '../db.js';

describe('Wordle API Endpoints', () => {
  let gameId;

  beforeEach(() => {
    query.mockClear();
    query.mockImplementation((text, params) => {
      if (text.includes('SELECT id FROM players')) {
        if (params[0] === 'TestPlayer') {
          return Promise.resolve({ rows: [{ id: 1 }] });
        }
        return Promise.resolve({ rows: [] });
      }

      if (text.includes('INSERT INTO players')) {
        return Promise.resolve({ rows: [{ id: 2 }] });
      }

      if (text.includes('INSERT INTO scores')) {
        return Promise.resolve();
      }

      if (text.includes('SELECT NOW()')) {
        return Promise.resolve({ rows: [{ now: new Date().toISOString() }] });
      }

      if (text.includes('SELECT * FROM players')) {
        return Promise.resolve({ rows: [{ id: 1, name: 'TestPlayer' }] });
      }

      if (text.includes('SELECT * FROM scores')) {
        return Promise.resolve({ rows: [{ id: 1, player_id: 1, score: 80, created_at: new Date().toISOString() }] });
      }

      return Promise.resolve({ rows: [] });
    });
  });

  afterAll(() => {
    jest.resetAllMocks();
  });

  describe('POST /api/start', () => {
    it('should start a new game and return a gameId', async () => {
      const res = await request(app)
        .post('/api/start')
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('gameId');
      gameId = res.body.gameId;
    });
  });

  describe('POST /api/guess', () => {
    beforeEach(() => {
      gameId = 'test-game-id';
    });

    it('should reject guess if gameId is invalid', async () => {
      const res = await request(app)
        .post('/api/guess')
        .send({ gameId: 'invalid', guess: 'APPLE' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Invalid or completed game.');
    });

    it('should reject invalid word length', async () => {
      const res = await request(app)
        .post('/api/guess')
        .send({ gameId, guess: 'APP' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Invalid word.');
    });

    it('should reject non-dictionary words', async () => {
      const res = await request(app)
        .post('/api/guess')
        .send({ gameId, guess: 'ABCDE' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Invalid word.');
    });

    it('should accept a valid guess and return feedback', async () => {
      const secretWord = 'APPLE';
      app.locals.games = {
        [gameId]: {
          secret: secretWord,
          grid: Array(6).fill().map(() => Array(5).fill('')),
          currentRow: 0,
          currentCol: 0,
          completed: false,
          won: false
        }
      };

      const res = await request(app)
        .post('/api/guess')
        .send({ gameId, guess: 'APPLE' });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('feedback');
      expect(res.body.feedback).toEqual(['right', 'right', 'right', 'right', 'right']);
      expect(res.body).toHaveProperty('completed', true);
      expect(res.body).toHaveProperty('won', true);
    });
  });

  describe('GET /api/game/:gameId', () => {
    it('should retrieve game state', async () => {
      const gameId = 'test-game-id';
      app.locals.games = {
        [gameId]: {
          secret: 'APPLE',
          grid: ['A', 'P', 'P', 'L', 'E'],
          currentRow: 1,
          currentCol: 5,
          completed: false,
          won: false
        }
      };

      const res = await request(app)
        .get(`/api/game/${gameId}`)
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('grid');
      expect(res.body.grid).toEqual(['A', 'P', 'P', 'L', 'E']);
      expect(res.body).toHaveProperty('currentRow', 1);
      expect(res.body).toHaveProperty('currentCol', 5);
      expect(res.body).toHaveProperty('completed', false);
      expect(res.body).toHaveProperty('won', false);
    });

    it('should reject invalid gameId', async () => {
      const res = await request(app)
        .get('/api/game/invalid')
        .send();

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Invalid game ID.');
    });
  });

  describe('POST /api/save-score', () => {
    it('should save a new score for a new player', async () => {
      const res = await request(app)
        .post('/api/save-score')
        .send({ name: 'NewPlayer', score: 90 });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Score saved successfully.');

      expect(query).toHaveBeenCalledWith('SELECT id FROM players WHERE name = $1', ['NewPlayer']);
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO players (name) VALUES ($1) RETURNING id',
        ['NewPlayer']
      );
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO scores (player_id, score) VALUES ($1, $2)',
        [2, 90]
      );
    });

    it('should save a new score for an existing player', async () => {
      const res = await request(app)
        .post('/api/save-score')
        .send({ name: 'TestPlayer', score: 80 });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty('message', 'Score saved successfully.');

      expect(query).toHaveBeenCalledWith('SELECT id FROM players WHERE name = $1', ['TestPlayer']);
      expect(query).toHaveBeenCalledWith(
        'INSERT INTO scores (player_id, score) VALUES ($1, $2)',
        [1, 80]
      );
    });

    it('should reject invalid input', async () => {
      const res = await request(app)
        .post('/api/save-score')
        .send({ name: '', score: 'not-a-number' });

      expect(res.statusCode).toEqual(400);
      expect(res.body).toHaveProperty('error', 'Name and score are required.');
    });
  });

  describe('GET /api/leaderboard', () => {
    it('should retrieve the top 10 scores', async () => {
      const res = await request(app)
        .get('/api/leaderboard')
        .send();

      expect(res.statusCode).toEqual(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeLessThanOrEqual(10);
      res.body.forEach(entry => {
        expect(entry).toHaveProperty('name');
        expect(entry).toHaveProperty('score');
        expect(entry).toHaveProperty('created_at');
      });

      expect(query).toHaveBeenCalledWith(expect.stringContaining('SELECT players.name'), []);
    });
  });

  describe('GET /api/test-db', () => {
    it('should return the current database time', async () => {
      const res = await request(app)
        .get('/api/test-db')
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('currentTime');
    });
  });

  describe('GET /api/health', () => {
    it('should return server health status', async () => {
      const res = await request(app)
        .get('/api/health')
        .send();

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('status', 'Server is running!');
    });
  });
});
