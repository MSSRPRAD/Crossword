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
    const wordsInput = req.body.words;
    const dim = Number(req.body.dim);
    const count = Number(req.body.count);
    // Process the words input from the textarea
    const words = wordsInput
        .split('\n')
        .map((line) => ({ data: line.trim().split('') }))
        .filter((word) => word.data.length > 0);
    // Generate crosswords
    const crosswords = yield (0, crossword_1.default)(words, dim, count);
    // Render the result using Nunjucks
    res.render('index.html', { crosswords });
}));
// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
