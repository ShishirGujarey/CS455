// import { state, isWordValid, getCurrentWord, getNumOfOccurrencesInWord, 
//   getPositionOfOccurrence, isLetter, addLetter, 
//   removeLetter, resetGame, drawGrid, updateGrid,
//   revealWord } from '../src/index.js';

// describe('isWordValid', () => {
//   test('isWordValid should return true for a valid word in the dictionary', () => {
//     expect(isWordValid('hello')).toBe(true);
//   });
  
//   test('isWordValid should return false for an invalid word', () => {
//     expect(isWordValid('xyzab')).toBe(false);
//   });
// });


// describe('getCurrentWord', () => {
//   beforeEach(() => {
//     // Reset the grid and other state before each test
//     state.grid = [
//       ['h', 'e', 'l', 'l', 'o'],
//       ['c', 'l', 'e', 'a', 'r'],
//       ['f', 'u', 'n', 'n', 'y'],
//       ['', '', '', '', ''],
//       ['', '', '', '', ''],
//       ['', '', '', '', ''],
//     ];
//   });

//   test('returns the current word from the grid for the current row', () => {
//     state.currentRow = 0;
//     const word = getCurrentWord(state);
//     expect(word).toBe('hello');
//   });

//   test('returns an empty string when the row is empty', () => {
//     state.currentRow = 3; 
//     const word = getCurrentWord(state);
//     expect(word).toBe(''); 
//   });

//   test('returns a partial word if only part of the row is filled', () => {
//     state.currentRow = 3;
//     state.grid[3] = ['p', 'a', 'r', '', ''];
//     const word = getCurrentWord(state);
//     expect(word).toBe('par');
//   });
// });

// describe('getNumOfOccurrencesInWord', () => {
//   test('getNumOfOccurrencesInWord should return the number of occurrences of a letter in a word', () => {
//     expect(getNumOfOccurrencesInWord('hello', 'l')).toBe(2);
//     expect(getNumOfOccurrencesInWord('hello', 'o')).toBe(1);
//     expect(getNumOfOccurrencesInWord('hello', 'z')).toBe(0);
//   });
// });

// describe('getPositionOfOccurrence', () => {
//   test('getPositionOfOccurrence should return the position of the nth occurrence of a letter in a word', () => {
//     expect(getPositionOfOccurrence('hello', 'l', 2)).toBe(1);
//     expect(getPositionOfOccurrence('hello', 'l', 3)).toBe(2);
//     expect(getPositionOfOccurrence('hello', 'o', 4)).toBe(1);
//   });
// });

// describe('isLetter', () => {
//   test('isLetter should return true for a letter', () => {
//     expect(isLetter('a')).toBe(true);
//     expect(isLetter('z')).toBe(true);
//     expect(isLetter('1')).toBe(false);
//     expect(isLetter('!')).toBe(false);
//   });
// });

// describe('addLetter', () => {
//   beforeEach(() => {
//     state.grid = [
//       ['h', 'e', 'l', 'l', 'o'],
//       ['c', 'l', 'e', 'a', 'r'],
//       ['f', 'u', 'n', 'n', 'y'],
//       ['c', 'l', 'o', 'w', ''],
//       ['', '', '', '', ''],
//       ['', '', '', '', ''],
//     ];
//     state.currentRow = 3;
//     state.currentCol = 4;
//   });

//   test('addLetter should add a letter to the grid', () => {
//     addLetter('n');
//     expect(state.grid[3][4]).toBe('n');
//     expect(state.currentCol).toBe(5);  
//   });

//   test('addLetter should add a letter to the grid', () => {
//     addLetter('a');
//     expect(state.grid[4]).toEqual(['', '', '', '', '']);
//     expect(state.currentCol).toBe(5);  
//   });
// });

// describe('removeLetter', () => {
//   beforeEach(() => {
//     state.grid = [
//       ['h', 'e', 'l', 'l', 'o'],
//       ['c', 'l', 'e', 'a', 'r'],
//       ['f', 'u', 'n', 'n', 'y'],
//       ['a', 'b', '', '', ''], 
//       ['', '', '', '', ''],
//       ['', '', '', '', ''],
//     ];
//     state.currentRow = 3; 
//   });

//   test('removes the last letter and decrements currentCol', () => {
//     state.currentCol = 2;  
//     removeLetter();
//     expect(state.grid[3][1]).toBe('');
//     expect(state.currentCol).toBe(1); 
//   });

//   test('does nothing when currentCol is 0', () => {
//     state.currentCol = 1;
//     removeLetter();
//     removeLetter();
//     expect(state.grid[3][0]).toBe('');
//     expect(state.currentCol).toBe(0);
//   });
// });

// jest.mock('../src/index.js', () => ({
//   ...jest.requireActual('../src/index.js'),
//   drawGrid: jest.fn(),
//   updateGrid: jest.fn(),
// }));

// describe('resetGame', () => {
//   beforeEach(() => {
//     state.secret = 'funny';  // Initial secret word
//     state.grid = [
//       ['h', 'e', 'l', 'l', 'o'],
//       ['c', 'l', 'e', 'a', 'r'],
//       ['f', 'u', 'n', 'n', 'y'],
//       ['', '', '', '', ''],
//       ['', '', '', '', ''],
//       ['', '', '', '', ''],
//     ];
//     state.currentRow = 2;
//     state.currentCol = 4;
//     document.body.innerHTML = `
//       <div id="game"></div>
//       <button id="reset-button"></button>
//     `;
//     drawGrid.mockClear();
//     updateGrid.mockClear();
//   });

//   test('resets the game state correctly', () => {
//     resetGame();

//     expect(state.secret).not.toBe('funny');  // Secret word should change
//     expect(state.secret.length).toBe(5);

//     const expectedEmptyGrid = Array(6).fill().map(() => Array(5).fill(''));
//     expect(state.grid).toEqual(expectedEmptyGrid);

//     expect(state.currentRow).toBe(0);
//     expect(state.currentCol).toBe(0);
//   });

//   test('clears the grid', () => {
//     resetGame();
//     state.grid.forEach(row => {
//       row.forEach(cell => {
//         expect(cell).toBe('');
//       });
//     });
//   });
// });

// describe('revealWord', () => {
//   beforeEach(() => {
//     document.body.innerHTML = '<div id="game"></div>';
    
//     const game = document.getElementById('game');
//     for (let i = 0; i < 6; i++) {
//       for (let j = 0; j < 5; j++) {
//         const box = document.createElement('div');
//         box.className = 'box';
//         box.id = `box${i}${j}`;
//         game.appendChild(box);
//       }
//     }

//     state.grid = Array(6).fill().map(() => Array(5).fill(''));
//     state.secret = 'apple';
//     state.currentRow = 0;
//   });

//   test('revealWord adds correct classes for matching letters', () => {
//     jest.useFakeTimers();
  
//     const guess = 'apple';
//     for (let i = 0; i < guess.length; i++) {
//       state.grid[0][i] = guess[i];
//       const box = document.getElementById(`box0${i}`);
//       box.textContent = guess[i];
//     }
//     revealWord(guess);
  
//     jest.advanceTimersByTime(500 * 3);
  
//     for (let i = 0; i < 5; i++) {
//       const box = document.getElementById(`box0${i}`);
//       expect(box.classList.contains('right')).toBe(true);
//     }
  
//     jest.useRealTimers();
//   });
  
//   test('revealWord adds wrong and empty classes for incorrect letters', () => {
//     jest.useFakeTimers();
  
//     const guess = 'april';
//     for (let i = 0; i < guess.length; i++) {
//       state.grid[0][i] = guess[i];
//       const box = document.getElementById(`box0${i}`);
//       box.textContent = guess[i];
//     }
//     revealWord(guess);
  
//     jest.advanceTimersByTime(500 * 3);
//     expect(document.getElementById('box00').classList.contains('right')).toBe(true);
//     expect(document.getElementById('box01').classList.contains('right')).toBe(true);
//     expect(document.getElementById('box02').classList.contains('empty')).toBe(true);
//     expect(document.getElementById('box03').classList.contains('empty')).toBe(true);
//     expect(document.getElementById('box04').classList.contains('wrong')).toBe(true);
  
//     jest.useRealTimers();
//   });
  
//   // Test for handling game win
//   test('revealWord triggers win alert when the guess matches the secret', () => {
//     jest.useFakeTimers();
//     global.alert = jest.fn(); // Mock alert
  
//     const guess = 'apple'; // Correct guess
//     revealWord(guess);
  
//     // Advance timers to trigger the alert
//     jest.advanceTimersByTime(500 * 3); 
  
//     expect(global.alert).toHaveBeenCalledWith('Congratulations!');
    
//     jest.useRealTimers();
//   });
  
//   // Test for handling game over
//   test('revealWord triggers game over alert when on the last row', () => {
//     jest.useFakeTimers();
//     global.alert = jest.fn(); // Mock alert function
  
//     state.currentRow = 5; // Last row of the grid
//     const guess = 'apric'; // Incorrect guess
//     revealWord(guess);
  
//     jest.advanceTimersByTime(500 * 3); // Allow setTimeout to finish
  
//     expect(global.alert).toHaveBeenCalledWith(`Better luck next time! The word was ${state.secret}.`);
    
//     jest.useRealTimers();
//   });
// });
