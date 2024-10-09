// server.js
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { Dictionary } from './dictionary.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// In-memory store for games
const games = {};

// Helper functions
function getRandomWord() {
  return Dictionary[Math.floor(Math.random() * Dictionary.length)].toUpperCase();
}

function isWordValid(word) {
  return Dictionary.includes(word.toLowerCase());
}

// API to start a new game
app.post('/api/start', (req, res) => {
  const gameId = Date.now().toString(); // Simple unique ID
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

function calculateFeedback(secret, guess) {
    const feedback = Array(5).fill('empty');
    const secretLetters = secret.split('');
    const guessLetters = guess.split('');
  
    // First pass: Check for correct letters in correct positions
    guessLetters.forEach((letter, index) => {
      if (letter === secretLetters[index]) {
        feedback[index] = 'right';
        secretLetters[index] = null; // Remove matched letters
        guessLetters[index] = null;
      }
    });
  
    // Second pass: Check for correct letters in wrong positions
    guessLetters.forEach((letter, index) => {
      if (letter && secretLetters.includes(letter)) {
        feedback[index] = 'wrong';
        secretLetters[secretLetters.indexOf(letter)] = null; // Remove to prevent duplicate matching
      }
    });
  
    return feedback;
  }
  
  // API to submit a guess
  app.post('/api/guess', (req, res) => {
    const { gameId, guess } = req.body;
  
    // Validate request
    if (!gameId || !guess) {
      return res.status(400).json({ error: 'Missing gameId or guess.' });
    }
  
    const game = games[gameId];
  
    if (!game) {
      return res.status(400).json({ error: 'Invalid gameId.' });
    }
  
    if (game.completed) {
      return res.status(400).json({ error: 'Game is already completed.' });
    }
  
    const upperGuess = guess.toUpperCase();
  
    if (upperGuess.length !== 5) {
      return res.status(400).json({ error: 'Guess must be 5 letters.' });
    }
  
    if (!isWordValid(upperGuess)) {
      return res.status(400).json({ error: 'Guess is not a valid word.' });
    }
  
    const row = game.currentRow;
  
    if (row >= 6) {
      return res.status(400).json({ error: 'No attempts left.' });
    }
  
    // Update game state
    game.grid[row] = upperGuess.split('');
    game.currentRow += 1;
  
    // Check if guess is correct
    if (upperGuess === game.secret) {
      game.completed = true;
      game.won = true;
    } else if (game.currentRow >= 6) {
      game.completed = true;
    }
  
    // Generate feedback
    const feedback = calculateFeedback(game.secret, upperGuess);
  
    res.json({
      feedback,
      completed: game.completed,
      won: game.won
    });
  });
  

// Simple route to test server
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Catch-all to serve index.html for any other routes (for SPA)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
