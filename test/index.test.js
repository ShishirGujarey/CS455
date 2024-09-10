import { isWordValid, getCurrentWord} from '../src/index.js';

test('isWordValid should return true for a valid word in the dictionary', () => {
  expect(isWordValid('hello')).toBe(true);
});

test('isWordValid should return false for an invalid word', () => {
  expect(isWordValid('xyzab')).toBe(false);
});

test('getCurrentWord should return the word in the current row', () => {
  const state = {
    grid: [
      ['h', 'e', 'l', 'l', 'o'],
      ['c', 'l', 'e', 'a', 'r'],
      ['f', 'u', 'n', 'n', 'y'],
      ['c', 'l', 'o', 'w', 'n'],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ],
    currentRow: 0,
  };

  expect(getCurrentWord(state)).toBe('hello');
});

