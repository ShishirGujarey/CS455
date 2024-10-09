import express from 'express';
import cors from 'cors';
import { Dictionary } from '../public/dictionary.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

let secret = Dictionary[Math.floor(Math.random() * Dictionary.length)];

app.get('/api/secret', (req, res) => {
  res.json({ secret });
});

app.post('/api/validate', (req, res) => {
  const { guess } = req.body;
  
  if (!guess || guess.length !== 5) {
    return res.status(400).json({ error: 'Guess must be a 5-letter word.' });
  }

  if (!Dictionary.includes(guess)) {
    return res.status(400).json({ error: 'Not a valid word.' });
  }

  const result = [];
  const secretLetters = secret.split('');

  guess.split('').forEach((letter, index) => {
    if (letter === secretLetters[index]) {
      result.push('right');
      secretLetters[index] = null;
    } else {
      result.push(null);
    }
  });

  guess.split('').forEach((letter, index) => {
    if (result[index]) return;

    const foundIndex = secretLetters.indexOf(letter);
    if (foundIndex !== -1) {
      result[index] = 'wrong';
      secretLetters[foundIndex] = null;
    } else {
      result[index] = 'empty';
    }
  });

  const isWinner = guess === secret;

  if (isWinner) {
    secret = Dictionary[Math.floor(Math.random() * Dictionary.length)];
  }

  res.json({ result, isWinner });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
