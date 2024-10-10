import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Dictionary } from './dictionary.js';
import { query } from './db.js'; 
import { v4 as uuidv4 } from 'uuid';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

const games = {};

function getRandomWord() {
  return Dictionary[Math.floor(Math.random() * Dictionary.length)].toUpperCase();
}

function isWordValid(word) {
  return Dictionary.includes(word.toLowerCase());
}

app.post('/api/start', (req, res) => {
  const gameId = Date.now().toString();
  const secret = getRandomWord();
  games[gameId] = {
    secret,
    grid: Array(6).fill().map(() => Array(5).fill('')),
    currentRow: 0,
    currentCol: 0,
    completed: false,
    won: false
  };
  res.json({ gameId });
});

app.post('/api/guess', (req, res) => {
  const { gameId, guess } = req.body;
  const game = games[gameId];

  if (!game || game.completed) {
    return res.status(400).json({ error: 'Invalid or completed game.' });
  }

  const upperGuess = guess.toUpperCase();

  if (upperGuess.length !== 5 || !isWordValid(upperGuess)) {
    return res.status(400).json({ error: 'Invalid word.' });
  }

  const row = game.currentRow;

  if (row >= 6) {
    return res.status(400).json({ error: 'No more attempts left.' });
  }

  game.grid[row] = upperGuess.split('');
  game.currentRow++;

  if (upperGuess === game.secret) {
    game.completed = true;
    game.won = true;
  } else if (game.currentRow >= 6) {
    game.completed = true;
  }

  const feedback = upperGuess.split('').map((letter, index) => {
    if (letter === game.secret[index]) {
      return 'right';
    } else if (game.secret.includes(letter)) {
      return 'wrong';
    } else {
      return 'empty';
    }
  });

  const response = { feedback, completed: game.completed, won: game.won };
  if (game.completed && !game.won) {
    response.secret = game.secret;
  }

  res.json(response);
});

app.get('/api/game/:gameId', (req, res) => {
  const { gameId } = req.params;
  const game = games[gameId];

  if (!game) {
    return res.status(400).json({ error: 'Invalid game ID.' });
  }

  res.json({
    grid: game.grid,
    currentRow: game.currentRow,
    currentCol: game.currentCol,
    completed: game.completed,
    won: game.won
  });
});

app.get('/api/test-db', async (req, res) => {
    try {
      const result = await query('SELECT NOW()');
      res.json({ currentTime: result.rows[0].now });
    } catch (error) {
      console.error('Database query failed:', error);
      res.status(500).json({ error: 'Database query failed' });
    }
  });

  app.post('/api/save-score', async (req, res) => {
    const { name, score } = req.body;
  
    if (!name || typeof score !== 'number') {
      return res.status(400).json({ error: 'Name and score are required.' });
    }
  
    try {
      let player = await query('SELECT id FROM players WHERE name = $1', [name]);
  
      if (player.rows.length === 0) {
        const insertPlayerResult = await query(
          'INSERT INTO players (name) VALUES ($1) RETURNING id',
          [name]
        );
        player = insertPlayerResult.rows[0];
      } else {
        player = player.rows[0];
      }
  
      await query(
        'INSERT INTO scores (player_id, score) VALUES ($1, $2)',
        [player.id, score]
      );
  
      res.status(201).json({ message: 'Score saved successfully.' });
    } catch (error) {
      console.error('Error saving score:', error);
      res.status(500).json({ error: 'Failed to save score.' });
    }
  });
  
  app.get('/api/leaderboard', async (req, res) => {
    try {
      const result = await query(`
        SELECT players.name, scores.score, scores.created_at
        FROM scores
        JOIN players ON scores.player_id = players.id
        ORDER BY scores.score DESC, scores.created_at ASC
        LIMIT 10
      `);
  
      res.json(result.rows);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
  });

app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
