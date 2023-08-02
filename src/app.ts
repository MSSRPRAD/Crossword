// app.ts

import express from 'express';
import nunjucks from 'nunjucks';
import path from 'path';
import generateCrosswords , { Crossword, Word } from './crossword';

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
  const wordsInput = req.body.words;
  const dim = Number(req.body.dim);
  const count = Number(req.body.count);
  // Process the words input from the textarea
const words: Word[] = wordsInput
  .split('\n')
  .map((line: string) => ({ data: line.trim().split('') }))
  .filter((word: Word) => word.data.length > 0);

  // Generate crosswords
  const crosswords = await generateCrosswords(words, dim, count);
  // Render the result using Nunjucks
  res.render('index.html', { crosswords });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
