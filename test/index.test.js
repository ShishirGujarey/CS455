import { state, isWordValid, getCurrentWord, getNumOfOccurrencesInWord, getPositionOfOccurrence, isLetter, addLetter, removeLetter } from '../src/index.js';

test('isWordValid should return true for a valid word in the dictionary', () => {
  expect(isWordValid('hello')).toBe(true);
});

test('isWordValid should return false for an invalid word', () => {
  expect(isWordValid('xyzab')).toBe(false);
});

describe('getCurrentWord', () => {
  beforeEach(() => {
    // Reset the grid and other state before each test
    state.grid = [
      ['h', 'e', 'l', 'l', 'o'],
      ['c', 'l', 'e', 'a', 'r'],
      ['f', 'u', 'n', 'n', 'y'],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ];
  });

  test('returns the current word from the grid for the current row', () => {
    state.currentRow = 0;
    const word = getCurrentWord(state);
    expect(word).toBe('hello');
  });

  test('returns an empty string when the row is empty', () => {
    state.currentRow = 3; 
    const word = getCurrentWord(state);
    expect(word).toBe(''); 
  });

  test('returns a partial word if only part of the row is filled', () => {
    state.currentRow = 3;
    state.grid[3] = ['p', 'a', 'r', '', ''];
    const word = getCurrentWord(state);
    expect(word).toBe('par');
  });
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

describe('addLetter', () => {
  beforeEach(() => {
    state.grid = [
      ['h', 'e', 'l', 'l', 'o'],
      ['c', 'l', 'e', 'a', 'r'],
      ['f', 'u', 'n', 'n', 'y'],
      ['c', 'l', 'o', 'w', ''],
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ];
    state.currentRow = 3;
    state.currentCol = 4;
  });

  test('addLetter should add a letter to the grid', () => {
    addLetter('n');
    expect(state.grid[3][4]).toBe('n');
    expect(state.currentCol).toBe(5);  
  });

  test('addLetter should add a letter to the grid', () => {
    addLetter('a');
    expect(state.grid[4]).toEqual(['', '', '', '', '']);
    expect(state.currentCol).toBe(5);  
  });
});

describe('removeLetter', () => {
  beforeEach(() => {
    state.grid = [
      ['h', 'e', 'l', 'l', 'o'],
      ['c', 'l', 'e', 'a', 'r'],
      ['f', 'u', 'n', 'n', 'y'],
      ['a', 'b', '', '', ''], 
      ['', '', '', '', ''],
      ['', '', '', '', ''],
    ];
    state.currentRow = 3; 
  });

  test('removes the last letter and decrements currentCol', () => {
    state.currentCol = 2;  
    removeLetter();
    expect(state.grid[3][1]).toBe('');
    expect(state.currentCol).toBe(1); 
  });

  test('does nothing when currentCol is 0', () => {
    state.currentCol = 1;
    removeLetter();
    removeLetter();
    expect(state.grid[3][0]).toBe('');
    expect(state.currentCol).toBe(0);
  });
});
