// app.ts

import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import generateCrosswords , { Crossword, Word, Hint } from './crossword';

const app = express();
const port = 3000;

// Configure Nunjucks
const templatesDir = path.resolve(__dirname, 'public');
nunjucks.configure(templatesDir, {
  autoescape: true,
  express: app,
});

// Middleware to parse the request body
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  const crosswords: Crossword[] = [];
  res.render('index.html', { crosswords });
});

// Route to handle the form submission and display the result
app.post('/generate', async (req, res) => {
  // Assuming that `wordsInput` is an array of strings
  const wordsInput = req.body.words;
  const hints: string[] = req.body.hints.split('\n');
  const words: Word[] = wordsInput
  .split('\n')
  .map((line: string, i: number) => ({
    data: parseInputLine(line.trim()),
    hint: hints[i]
  }))
  .filter((word: Word) => word.data.length > 0);
  // Generate crosswords
  const crosswords = await generateCrosswords(words, hints);
  // Render the result using Nunjucks
  res.render('index.html', { crosswords });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});


function parseInputLine(inputLine: string): string[] {
  const words: string[] = [];
  const vowels = "aiufxAIUeEoOFX";
  const consonants = "kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh";
  const others = "MH";
  let curr = "";
  for(let i = 0; i < inputLine.length; i++){
    const char = inputLine[i];
    if(consonants.includes(char)){
      if(i === inputLine.length-1){
        curr += char;
        curr += "a";
        words.push(curr);
        curr = "";
      } else {
        curr += char;
      }
    } else if(vowels.includes(char)){
      if(i !== inputLine.length-1){
        if(others.includes(inputLine[i+1])){
          curr+=char;
          curr += inputLine[i+1];
          words.push(curr);
          curr = "";
          i++;
        } else {
          curr+=char;
          words.push(curr);
          curr = "";
        }
      } else {
        curr+=char;
        words.push(curr);
        curr = "";
      }
    }
  }

  return words;
}
