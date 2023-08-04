"use strict";
// app.ts
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const nunjucks_1 = __importDefault(require("nunjucks"));
const path_1 = __importDefault(require("path"));
const crossword_1 = __importDefault(require("./crossword"));
const app = (0, express_1.default)();
const port = 3000;
// Configure Nunjucks
const templatesDir = path_1.default.resolve(__dirname, 'public');
nunjucks_1.default.configure(templatesDir, {
    autoescape: true,
    express: app,
});
// Middleware to parse the request body
app.use(express_1.default.urlencoded({ extended: true }));
app.get('/', (req, res) => {
    const crosswords = [];
    res.render('index.html', { crosswords });
});
// Route to handle the form submission and display the result
app.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // Assuming that `wordsInput` is an array of strings
    const wordsInput = req.body.words.toUpperCase();
    const hints = req.body.hints.split('\n');
    const words = wordsInput
        .split('\n')
        .map((line, i) => ({
        data: parseInputLine(line.trim()),
        hint: hints[i]
    }))
        .filter((word) => word.data.length > 0);
    // Generate crosswords
    const crosswords = yield (0, crossword_1.default)(words, hints);
    // Render the result using Nunjucks
    res.render('index.html', { crosswords });
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
function parseInputLine(inputLine) {
    const words = [];
    const vowels = "aiufxAIUeEoOFX";
    const consonants = "kKgGNcCjJYwWqQRtTdDnpPbBmyrlvSzsh";
    const others = "MH";
    let curr = "";
    for (let i = 0; i < inputLine.length; i++) {
        const char = inputLine[i];
        if (consonants.includes(char)) {
            if (i === inputLine.length - 1) {
                curr += char;
                curr += "a";
                words.push(curr);
                curr = "";
            }
            else {
                curr += char;
            }
        }
        else if (vowels.includes(char)) {
            if (i !== inputLine.length - 1) {
                if (others.includes(inputLine[i + 1])) {
                    curr += char;
                    curr += inputLine[i + 1];
                    words.push(curr);
                    curr = "";
                    i++;
                }
                else {
                    curr += char;
                    words.push(curr);
                    curr = "";
                }
            }
            else {
                curr += char;
                words.push(curr);
                curr = "";
            }
        }
    }
    return words;
}
