const LIMIT = 1;

export interface Crossword {
  board: string[][];
  hints: Hint[];
}
export interface Hint {
  hint: string;
  x: number;
  y: number;
  direction: 'horizontal' | 'vertical' | 'horizontal-reverse' | 'vertical-reverse' | 'unknown';
}
export interface Word {
  data: string[];
  hint: string;
}

type PotentialPlacement = [number, number, 'horizontal' | 'vertical' | 'horizontal-reverse' | 'vertical-reverse', number];

function createInitialCrossword(rows: number, cols: number): Crossword {
  const emptyBoard: string[][] = [];

  for (let r = 0; r < rows; r++) {
    emptyBoard[r] = [];
    for (let c = 0; c < cols; c++) {
      emptyBoard[r][c] = "/";
    }
  }

  return { board: emptyBoard, hints: [] as Hint[] };
}

function findPotentialPlacements(
  board: string[][],
  word: Word
): PotentialPlacement[] {
  const placements: PotentialPlacement[] = [];
  const rows = board.length;
  const cols = board[0].length;
  const wordLength = word.data.length;
  const isEmptyBoard = board.every(row => row.every(cell => cell === "/"));
  if(isEmptyBoard) {
    return [[rows / 2, cols / 2, 'horizontal', 0]];
  }

  for (let r = 3; r < rows-3; r++) {
    for (let c = 3; c <= cols - wordLength-3; c++) {
      // Forward placement
      let intersections = 0;
      let nearnessScore = 0;
      for (let i = 0; i < wordLength; i++) {
        if (board[r][c + i] === word.data[i]) {
          intersections++;
        } else if (board[r][c + i] !== "/") {
          intersections = 0;
          nearnessScore = 0;
          break;
        } else {
          for (let p = 1; p <= 3; p++) {
            if (board[r - p][c + i] !== "/" || board[r + p][c + i] !== "/") {
              nearnessScore += (4-p);
            }
          }
        }
      }

      if (intersections >= 0 || nearnessScore >= 0) {
        placements.push([r, c, 'horizontal', intersections * 10 + nearnessScore]);
      }

      // Backward placement
      intersections = 0;
      nearnessScore = 0;
      for (let i = 0; i < wordLength; i++) {
        if (board[r][c + wordLength - i - 1] === word.data[i]) {
          intersections++;
        } else if (board[r][c + wordLength - i - 1] !== "/") {
          intersections = 0;
          nearnessScore = 0;
          break;
        } else {
          for (let p = 1; p <= 3; p++) {
            if (board[r - p][c + wordLength - i - 1] !== "/" || board[r + p][c + wordLength - i - 1] !== "/") {
              nearnessScore += (4-p);
            }
          }
        }
      }

      if (intersections >= 0 || nearnessScore >= 0) {
        placements.push([r, c, 'horizontal-reverse', intersections * 10 + nearnessScore]);
      }
    }
  }

  for (let r = 3; r <= rows - wordLength-3; r++) {
    for (let c = 3; c < cols-3; c++) {
      // Forward placement
      let intersections = 0;
      let nearnessScore = 0;

      for (let i = 0; i < wordLength; i++) {
        if (board[r + i][c] === word.data[i]) {
          intersections++;
        } else if (board[r + i][c] !== "/") {
          nearnessScore = 0;
          intersections = 0;
          break;
        } else {
          for (let p = 1; p <= 3; p++) {
            if (board[r + i][c - p] !== "/" || board[r + i][c + p] !== "/") {
              nearnessScore += p;
            }
          }
        }
      }

      if (intersections >= 0 || nearnessScore >= 0) {
        placements.push([r, c, 'vertical', intersections * 10 + nearnessScore]);
      }

      // Backward placement
      intersections = 0;
      nearnessScore = 0;
      for (let i = 0; i < wordLength; i++) {
        if (board[r + wordLength - i - 1][c] === word.data[i]) {
          intersections++;
        } else if (board[r + wordLength - i - 1][c] !== "/") {
          intersections = 0;
          nearnessScore = 0;
          break;
        } else {
          for (let p = 1; p <= 3; p++) {
            if (board[r + wordLength - i - 1][c - p] !== "/" || board[r + wordLength - i - 1][c + p] !== "/") {
              nearnessScore += p;
            }
          }
        }
      }

      if (intersections >= 0 || nearnessScore >= 0) {
        placements.push([r, c, 'vertical-reverse', intersections * 10 + nearnessScore]);
      }
    }
  }

  // Sort placements based on intersections (higher is better) and nearnessScore (lower is better)
  placements.sort((a, b) => b[3] - a[3]);

  // Return only the top 5 placements
  return placements.slice(0, LIMIT);
}



// Function to remove unnecessary '/'s outside the bounding box
function shortenCrossword(crossword: Crossword): Crossword {
  const { board, hints } = crossword;
  const rows = board.length;
  const cols = board[0].length;

  // Calculate the bounding box coordinates
  let minRow = rows;
  let maxRow = 0;
  let minCol = cols;
  let maxCol = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== '/') {
        minRow = Math.min(minRow, r);
        maxRow = Math.max(maxRow, r);
        minCol = Math.min(minCol, c);
        maxCol = Math.max(maxCol, c);
      }
    }
  }

  // Extract the crossword inside the bounding box
  const shortenedBoard: string[][] = [];
  for (let r = minRow; r <= maxRow; r++) {
    shortenedBoard.push(board[r].slice(minCol, maxCol + 1));
  }

  // Update the hints' x and y coordinates
  const updatedHints = hints.map((hint: Hint) => ({
      hint: hint.hint,
      x: hint.x - minRow,
      y: hint.y - minCol,
      direction: hint.direction,
    })
  );
  return { board: shortenedBoard, hints: updatedHints };
}

async function generateCrosswords(words: Word[], hints: string[]): Promise<Crossword[]> {
  const crosswords: Crossword[] = [];
  const initialCrossword: Crossword = createInitialCrossword(300, 300);
  await generateCrosswordHelper(words, initialCrossword, crosswords, hints);
  // Shorten each crossword before returning
  const shortenedCrosswords = crosswords.map(shortenCrossword);
  // Sort shortened crosswords by their dimensions (length x width)
  const sortedCrosswords = shortenedCrosswords.sort((a, b) => getCrosswordSize(b) - getCrosswordSize(a));
  return sortedCrosswords;
}

// Function to get the size (length x width) of a crossword
function getCrosswordSize(crossword: Crossword): number {
  const rows = crossword.board.length;
  const cols = crossword.board[0].length;
  return rows * cols;
}

export function placeWord(board: Crossword, word: Word, placement: PotentialPlacement, hint: string): Crossword {
  const { board: currentBoard, hints: currentHints } = board;
  const [row, col, orientation, score] = placement;
  const newBoard: string[][] = [];

  // Make a deep copy of the current board and hints
  for (let r = 0; r < currentBoard.length; r++) {
    newBoard[r] = currentBoard[r].slice(); // Deep copy each row
  }
  const newHints: Hint[] = JSON.parse(JSON.stringify(currentHints));

  // Place the word on the new board
  if (orientation === 'horizontal' || orientation === 'horizontal-reverse') {
    const reverse = orientation === 'horizontal-reverse';
    for (let i = 0; i < word.data.length; i++) {
      if (reverse) {
        newBoard[row][col + word.data.length - i - 1] = word.data[i];
      } else {
        newBoard[row][col + i] = word.data[i];
      }
    }
  } else if (orientation === 'vertical' || orientation === 'vertical-reverse') {
    const reverse = orientation === 'vertical-reverse';
    for (let i = 0; i < word.data.length; i++) {
      if (reverse) {
        newBoard[row + word.data.length - i - 1][col] = word.data[i];
      } else {
        newBoard[row + i][col] = word.data[i];
      }
    }
  }
  console.log('orientation is: '+orientation);

  // Adjust the x and y values for horizontal-reverse and vertical-reverse placements
  let startX = row;
  let startY = col;
  if (orientation === 'horizontal-reverse') {
    startY = col + word.data.length - 1;
  } else if (orientation === 'vertical-reverse') {
    startX = row + word.data.length - 1;
  }

  // Add the word's hint to the hints array
  newHints.push({
    hint: hint,
    x: startX,
    y: startY,
    direction: orientation,
  });
  return { board: newBoard, hints: newHints };
}



async function generateCrosswordHelper(
  words: Word[],
  currentBoard: Crossword,
  crosswords: Crossword[],
  hints: string[]
): Promise<void> {
  console.log("reached helper");
  // Base case: If no words remain, we have a complete crossword. Save the board and return.
  if (words.length === 0) {
    console.log("finished one");
    crosswords.push(currentBoard);
    return;
  }

  // Extract the first word from the words array and remaining words for recursion.
  const [word, ...remainingWords]: Word[] = words;
  const [hint, ...remainingHints]: string[] = hints;
  // Find all potential placements for the current word on the current board.
  const potentialPlacements = findPotentialPlacements(currentBoard.board, word);
  console.log("got potential placements!");
  console.log(potentialPlacements.length);
  // Explore each potential placement.
  for (const placement of potentialPlacements) {
    // Create a new board with the word placed at the current placement.
    const newBoard = placeWord(currentBoard, word, placement, hint);
    // Recursively call generateCrosswordHelper with the remaining words and the new board.
    await generateCrosswordHelper(remainingWords, newBoard, crosswords, remainingHints);
  }
}

export default generateCrosswords;
