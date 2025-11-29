class Crossword {
    constructor() {
        this.gridSize = 10;
        this.words = [
            { word: "ÉCHARPE", clue: "Je sers à protéger le cou du vent et du froid", x: 1, y: 0, direction: "down" },
            { word: "PINGOUIN", clue: "Je suis un oiseau qui vit dans le froid", x: 0, y: 2, direction: "across" },
            { word: "SKI", clue: "Sport d'hiver pratiqué sur la neige", x: 6, y: 0, direction: "down" },
            { word: "NEIGE", clue: "Je tombe du ciel en hiver", x: 3, y: 4, direction: "across" },
            { word: "IGLOO", clue: "Je suis une maison faite de neige", x: 0, y: 6, direction: "across" },
            { word: "GANTS", clue: "On m'utilise pour protéger les mains du froid", x: 5, y: 8, direction: "across" },
            { word: "BONNET", clue: "On le met sur la tête pour ne pas avoir froid", x: 8, y: 3, direction: "down" }
        ];

        this.grid = [];
        this.userInput = {};
        this.activeInput = null; 
        this.startTime = null;
        this.timerInterval = null;
        this.elapsedTime = 0;

        this.init();
    }

    init() {
        this.createGrid();
        this.placeWords();
        this.renderGrid();
        this.setupEventListeners();
        this.updateProgress();
        this.startTimer();
    }

    createGrid() {
        this.grid = [];
        for (let y = 0; y < this.gridSize; y++) {
            this.grid[y] = [];
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x] = {
                    letter: '',
                    blocked: true,
                    number: null
                };
            }
        }
    }

    placeWords() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                this.grid[y][x].blocked = true;
                this.grid[y][x].letter = '';
                this.grid[y][x].number = null;
            }
        }

        let wordNumber = 1;

        this.words.forEach((wordObj) => {
            const { word, x, y, direction } = wordObj;

            this.grid[y][x].number = wordNumber;

            for (let i = 0; i < word.length; i++) {
                const currentX = direction === "across" ? x + i : x;
                const currentY = direction === "down" ? y + i : y;
                
                this.grid[currentY][currentX].letter = word[i];
                this.grid[currentY][currentX].blocked = false;
            }

            wordNumber++;
        });
    }

    renderGrid() {
        const gridElement = document.getElementById('crossword');
        gridElement.innerHTML = '';

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';

                if (this.grid[y][x].blocked) {
                    cell.classList.add('blocked');
                } else {
                    if (this.grid[y][x].number) {
                        const number = document.createElement('div');
                        number.className = 'cell-number';
                        number.textContent = this.grid[y][x].number;
                        cell.appendChild(number);
                    }

                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;

                    const cellKey = `${x},${y}`;
                    if (this.userInput[cellKey]) {
                        input.value = this.userInput[cellKey];
                    }

                    input.addEventListener('input', (e) => {
                        this.handleCellInput(x, y, e.target.value);
                    });

                    input.addEventListener('keydown', (e) => {
                        this.handleKeyNavigation(e, x, y);
                    });

                    cell.appendChild(input);

                    this.updateCellAppearance(cell, x, y);
                }

                gridElement.appendChild(cell);
            }
        }
    }

    updateCellAppearance(cell, x, y) {
        const cellKey = `${x},${y}`;
        cell.classList.remove('correct', 'incorrect');

        if (this.userInput[cellKey]) {
            const expected = this.grid[y][x].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const user = this.userInput[cellKey].normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (expected === user) {
                cell.classList.add('correct');
            } else {
                cell.classList.add('incorrect');
            }
        }
    }

    handleCellInput(x, y, value) {
        const cellKey = `${x},${y}`;

        if (value) {
            value = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase();
            this.userInput[cellKey] = value;
        } else {
            delete this.userInput[cellKey];
        }

        this.renderGrid();
        this.updateProgress();

        this.focusNextCell(x, y); 
    }

    handleKeyNavigation(e, x, y) {
        if (e.key === "ArrowRight") this.moveFocus(x + 1, y);
        if (e.key === "ArrowLeft") this.moveFocus(x - 1, y);
        if (e.key === "ArrowUp") this.moveFocus(x, y - 1);
        if (e.key === "ArrowDown") this.moveFocus(x, y + 1);

        if (e.key === "Backspace") {
            this.userInput[`${x},${y}`] = "";
            this.moveFocus(x - 1, y);
            this.renderGrid();
            this.updateProgress();
        }
    }

    focusNextCell(x, y) {
        this.moveFocus(x + 1, y);
    }

    moveFocus(x, y) {
        if (x < 0 || y < 0 || x >= this.gridSize || y >= this.gridSize) return;
        if (this.grid[y][x].blocked) return;

        const gridElement = document.querySelector('#crossword');
        const index = y * this.gridSize + x;
        const cell = gridElement.children[index];
        const input = cell.querySelector('input');

        if (input) {
            setTimeout(() => input.focus(), 10);
        }
    }

    updateProgress() {
        let correct = 0;
        let total = 0;

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid[y][x].blocked) {
                    total++;
                    const cellKey = `${x},${y}`;

                    const expected = this.grid[y][x].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const user = this.userInput[cellKey]?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                    if (expected === user) correct++;
                }
            }
        }

        const progress = total ? (correct / total) * 100 : 0;

        document.getElementById('percent').textContent = `${Math.round(progress)}%`;
        document.getElementById('bar').style.width = `${progress}%`;
    }

    startTimer() {
        this.startTime = new Date();
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    updateTimer() {
        const now = new Date();
        this.elapsedTime = Math.floor((now - this.startTime) / 1000);
        
        const minutes = Math.floor(this.elapsedTime / 60);
        const seconds = this.elapsedTime % 60;
        
        document.getElementById('timer').textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    revealSolution() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid[y][x].blocked) {
                    this.userInput[`${x},${y}`] = this.grid[y][x].letter;
                }
            }
        }
        this.renderGrid();
        this.updateProgress();
    }

    reset() {
        this.userInput = {};
        this.renderGrid();
        this.updateProgress();
    }

    setupEventListeners() {
        document.getElementById('reveal').addEventListener('click', () => this.revealSolution());
        document.getElementById('reset').addEventListener('click', () => this.reset());
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new Crossword();
});
