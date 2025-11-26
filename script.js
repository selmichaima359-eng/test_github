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
        
        this.init();
    }

    init() {
        this.createGrid();
        this.placeWords();
        this.renderGrid();
        this.setupEventListeners();
        this.updateProgress();
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
        // D'abord réinitialiser toute la grille
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
            
            // Numéroter seulement le début du mot
            this.grid[y][x].number = wordNumber;
            
            // Placer les lettres
            for (let i = 0; i < word.length; i++) {
                const currentX = direction === "across" ? x + i : x;
                const currentY = direction === "down" ? y + i : y;
                
                if (currentX < this.gridSize && currentY < this.gridSize) {
                    this.grid[currentY][currentX].letter = word[i];
                    this.grid[currentY][currentX].blocked = false;
                }
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
                    // Ajouter le numéro
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
            const expectedLetter = this.grid[y][x].letter;
            const userLetter = this.userInput[cellKey].toUpperCase();
            
            // Pour gérer le É/È dans ÉCHARPE
            const normalizedExpected = expectedLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const normalizedUser = userLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            
            if (normalizedUser === normalizedExpected) {
                cell.classList.add('correct');
            } else {
                cell.classList.add('incorrect');
            }
        }
    }

    handleCellInput(x, y, value) {
        const cellKey = `${x},${y}`;
        
        if (value) {
            this.userInput[cellKey] = value.toUpperCase();
        } else {
            delete this.userInput[cellKey];
        }
        
        this.renderGrid();
        this.updateProgress();
    }

    updateProgress() {
        let correctCells = 0;
        let totalCells = 0;
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid[y][x].blocked) {
                    totalCells++;
                    const cellKey = `${x},${y}`;
                    
                    // Pour gérer les accents (ÉCHARPE)
                    const expectedLetter = this.grid[y][x].letter;
                    const userLetter = this.userInput[cellKey];
                    
                    if (userLetter) {
                        const normalizedExpected = expectedLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        const normalizedUser = userLetter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                        
                        if (normalizedUser === normalizedExpected) {
                            correctCells++;
                        }
                    }
                }
            }
        }
        
        const progress = totalCells > 0 ? (correctCells / totalCells) * 100 : 0;
        
        document.getElementById('percent').textContent = `${Math.round(progress)}%`;
        document.getElementById('bar').style.width = `${progress}%`;
        
        let foundWords = 0;
        this.words.forEach(wordObj => {
            const { word, x, y, direction } = wordObj;
            let wordCorrect = true;
            
            for (let i = 0; i < word.length; i++) {
                const currentX = direction === "across" ? x + i : x;
                const currentY = direction === "down" ? y + i : y;
                const cellKey = `${currentX},${currentY}`;
                
                if (this.userInput[cellKey]) {
                    // Normaliser pour ignorer les accents
                    const expectedChar = word[i];
                    const userChar = this.userInput[cellKey];
                    
                    const normalizedExpected = expectedChar.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    const normalizedUser = userChar.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                    
                    if (normalizedUser !== normalizedExpected) {
                        wordCorrect = false;
                        break;
                    }
                } else {
                    wordCorrect = false;
                    break;
                }
            }
            
            if (wordCorrect) {
                foundWords++;
            }
        });
        
        document.getElementById('status').textContent = `Mots trouvés : ${foundWords} / ${this.words.length}`;
    }

    revealSolution() {
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (!this.grid[y][x].blocked) {
                    const cellKey = `${x},${y}`;
                    this.userInput[cellKey] = this.grid[y][x].letter;
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
        document.getElementById('reveal').addEventListener('click', () => {
            this.revealSolution();
        });

        document.getElementById('reset').addEventListener('click', () => {
            this.reset();
        });
    }
}

// Démarrer
document.addEventListener('DOMContentLoaded', () => {
    new Crossword();
}); 