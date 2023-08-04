export interface Crossword {
  board: string[][];
}

export interface Word {
  data: string[];
}

type PotentialPlacement = [number, number, 'horizontal' | 'vertical', number];


function createInitialCrossword(rows: number, cols: number): Crossword {
  const emptyBoard: string[][] = [];

  for (let r = 0; r < rows; r++) {
    emptyBoard[r] = [];
    for (let c = 0; c < cols; c++) {
      emptyBoard[r][c] = "X";
    }
  }

  return { board: emptyBoard };
}

function findPotentialPlacements(
  board: string[][],
  word: Word
): PotentialPlacement[] {
  const placements: PotentialPlacement[] = [];
  const rows = board.length;
  const cols = board[0].length;
  const wordLength = word.data.length;
  const isEmptyBoard = board.every(row => row.every(cell => cell === "X"));
  if(isEmptyBoard) {
    return [[rows / 2, cols / 2, 'horizontal', 0]];
  }
  for (let r = 3; r < rows-3; r++) {
    for (let c = 3; c <= cols - wordLength-3; c++) {
      let intersections = 0;
      let nearnessScore = 0;
      for (let i = 0; i < wordLength; i++) {
        if (board[r][c + i] === word.data[i]) {
          intersections++;
        } else if (board[r][c + i] !== "X") {
          intersections = 0;
          nearnessScore = 0;
          break;
        } else {
          for(let p = 1; p <= 3; p++){
            if (board[r-p][c+i] !== "X" || board[r+p][c+i] !== "X") {
              nearnessScore+=p;
            }
          }
        }
      }

      if (intersections >= 0 || nearnessScore >= 0) {
        placements.push([r, c, 'horizontal', intersections * 10 ]);
      }
    }
  }

  for (let r = 3; r <= rows - wordLength-3; r++) {
    for (let c = 3; c < cols-3; c++) {
      let intersections = 0;
      let nearnessScore = 0;

      for (let i = 0; i < wordLength; i++) {
        if (board[r + i][c] === word.data[i]) {
          intersections++;
        } else if (board[r + i][c] !== 'X') {
          nearnessScore = 0;
          intersections = 0;
          break;
        } else {
            for(let p = 1; p <= 3; p++){
                if (board[r+i][c-p] !== "X" || board[r+i][c+p] !== "X") {
                  nearnessScore+=p;
                }
            }
        }
      }

      if (intersections >= 0 || nearnessScore >= 0) {
        placements.push([r, c, 'vertical', intersections * 10 + nearnessScore]);
      }
    }
  }

  // Sort placements based on intersections (higher is better) and nearnessScore (lower is better)
  placements.sort((a, b) => b[3] - a[3]);

  // Return only the top 5 placements
  return placements.slice(0, 2);
}



// Function to remove unnecessary 'X's outside the bounding box
function shortenCrossword(crossword: Crossword): Crossword {
  const { board } = crossword;
  const rows = board.length;
  const cols = board[0].length;

  // Calculate the bounding box coordinates
  let minRow = rows;
  let maxRow = 0;
  let minCol = cols;
  let maxCol = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (board[r][c] !== 'X') {
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

  return { board: shortenedBoard };
}

async function generateCrosswords(words: Word[]): Promise<Crossword[]> {
  const crosswords: Crossword[] = [];
  const initialCrossword: Crossword = createInitialCrossword(300, 300);
  await generateCrosswordHelper(words, initialCrossword, crosswords);
  // Shorten each crossword before returning
  const shortenedCrosswords = crosswords.map(shortenCrossword);
  // Sort shortened crosswords by their dimensions (length x width)
  const sortedCrosswords = shortenedCrosswords.sort((a, b) => getCrosswordSize(a) - getCrosswordSize(b));
  return sortedCrosswords;
}

// Function to get the size (length x width) of a crossword
function getCrosswordSize(crossword: Crossword): number {
  const rows = crossword.board.length;
  const cols = crossword.board[0].length;
  return rows * cols;
}

function placeWord(board: Crossword, word: Word, placement: PotentialPlacement): Crossword {
  const { board: currentBoard } = board;
  const [row, col, orientation, score] = placement;
  const newBoard: string[][] = [];

  // Make a deep copy of the current board
  for (let r = 0; r < currentBoard.length; r++) {
    newBoard[r] = currentBoard[r].slice(); // Deep copy each row
  }

  // Place the word on the new board
  for (let i = 0; i < word.data.length; i++) {
    if (orientation === 'horizontal') {
      newBoard[row][col + i] = word.data[i];
    } else {
      newBoard[row + i][col] = word.data[i];
    }
  }

  return { board: newBoard };
}


async function generateCrosswordHelper(
  words: Word[],
  currentBoard: Crossword,
  crosswords: Crossword[]
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
  // Find all potential placements for the current word on the current board.
  const potentialPlacements = findPotentialPlacements(currentBoard.board, word);
  console.log("got potential placements!");
  console.log(potentialPlacements.length);
  // Explore each potential placement.
  for (const placement of potentialPlacements) {
    // Create a new board with the word placed at the current placement.
    const newBoard = placeWord(currentBoard, word, placement);
    // Recursively call generateCrosswordHelper with the remaining words and the new board.
    await generateCrosswordHelper(remainingWords, newBoard, crosswords);
  }
}

export default generateCrosswords;
