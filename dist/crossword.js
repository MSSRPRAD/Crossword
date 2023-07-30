"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}
function generate(words, dim) {
    return __awaiter(this, void 0, void 0, function* () {
        // Make an empty Crossword
        var crossword = {
            board: Array.from({ length: dim }, () => Array.from({ length: dim }, () => 'X')),
        };
        console.log(words[0].data);
        // Useful Functions
        // Function to check if a word fits in the chosen direction
        function checkFit(word, row, col, direction) {
            const len = word.length;
            if (direction === "horizontal") {
                if (col + len > dim)
                    return false; // Word goes out of bounds
                for (let i = 0; i < len; i++) {
                    if (crossword.board[row][col + i] !== "X" && crossword.board[row][col + i] !== word[i])
                        return false; // Word overlaps with existing letters
                }
            }
            else if (direction === "vertical") {
                if (row + len > dim)
                    return false; // Word goes out of bounds
                for (let i = 0; i < len; i++) {
                    if (crossword.board[row + i][col] !== "X" && crossword.board[row + i][col] !== word[i])
                        return false; // Word overlaps with existing letters
                }
            }
            else if (direction === "diagonal") {
                if (row + len > dim || col + len > dim)
                    return false; // Word goes out of bounds
                for (let i = 0; i < len; i++) {
                    if (crossword.board[row + i][col + i] !== "X" && crossword.board[row + i][col + i] !== word[i])
                        return false; // Word overlaps with existing letters
                }
            }
            return true;
        }
        // Function to place a word in the chosen direction
        function placeWord(word, row, col, direction) {
            const len = word.length;
            if (direction === "horizontal") {
                for (let i = 0; i < len; i++) {
                    crossword.board[row][col + i] = word[i];
                }
            }
            else if (direction === "vertical") {
                for (let i = 0; i < len; i++) {
                    crossword.board[row + i][col] = word[i];
                }
            }
            else if (direction === "diagonal") {
                for (let i = 0; i < len; i++) {
                    crossword.board[row + i][col + i] = word[i];
                }
            }
        }
        while (true) {
            let allWordsPlaced = true;
            for (let i = 0; i < words.length; i++) {
                const word = words[i].data;
                let wordPlaced = false;
                while (!wordPlaced) {
                    const startRow = Math.floor(Math.random() * dim);
                    const startCol = Math.floor(Math.random() * dim);
                    const directions = ["horizontal", "vertical", "diagonal"];
                    const randomDirection = directions[Math.floor(Math.random() * directions.length)];
                    if (checkFit(word, startRow, startCol, randomDirection)) {
                        placeWord(word, startRow, startCol, randomDirection);
                        wordPlaced = true;
                    }
                }
                if (!wordPlaced) {
                    // If a word cannot be placed, break the outer loop and start over
                    allWordsPlaced = false;
                    break;
                }
            }
            if (allWordsPlaced) {
                // All words are placed successfully, exit the while loop
                break;
            }
            else {
                // Clear the board and try again
                crossword.board = Array.from({ length: dim }, () => Array.from({ length: dim }, () => 'X'));
            }
        }
        return crossword;
    });
}
function generateCrosswords(words, dim, count) {
    return __awaiter(this, void 0, void 0, function* () {
        const crosswords = [];
        return Promise.all(Array.from({ length: count }, () => generate(shuffleArray([...words]), dim)));
    });
}
exports.default = generateCrosswords;
