import { isWordValid, getCurrentWord, getNumOfOccurrencesInWord, getPositionOfOccurrence, isLetter } from '../src/index.js';

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

test('getNumOfOccurrencesInWord should return the number of occurrences of a letter in a word', () => {
  expect(getNumOfOccurrencesInWord('hello', 'l')).toBe(2);
  expect(getNumOfOccurrencesInWord('hello', 'o')).toBe(1);
  expect(getNumOfOccurrencesInWord('hello', 'z')).toBe(0);
});

test('getPositionOfOccurrence should return the position of the nth occurrence of a letter in a word', () => {
  expect(getPositionOfOccurrence('hello', 'l', 2)).toBe(1);
  expect(getPositionOfOccurrence('hello', 'l', 3)).toBe(2);
  expect(getPositionOfOccurrence('hello', 'o', 4)).toBe(1);
});

test('isLetter should return true for a letter', () => {
  expect(isLetter('a')).toBe(true);
  expect(isLetter('z')).toBe(true);
  expect(isLetter('1')).toBe(false);
  expect(isLetter('!')).toBe(false);
});