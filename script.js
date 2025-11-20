class Crossword {
    constructor() {
        this.gridSize = 10;
        this.words = [
            { word: "ECHARPE", clue: "Protège le cou du vent et du froid", x: 1, y: 0, direction: "vertical" },
            { word: "MANCHOT", clue: "Oiseau qui vit dans le froid", x: 0, y: 3, direction: "horizontal" },
            { word: "SKI", clue: "Sport d'hiver sur la neige", x: 4, y: 2, direction: "vertical" },
            { word: "NEIGE", clue: "Tombe du ciel en hiver", x: 5, y: 4, direction: "horizontal" },
            { word: "IGLOO", clue: "Maison faite de neige", x: 2, y: 6, direction: "horizontal" },
            { word: "MITAINES", clue: "Protège les mains du froid", x: 0, y: 8, direction: "horizontal" },
            { word: "BONNET", clue: "Pour ne pas avoir froid à la tête", x: 7, y: 7, direction: "vertical" }
        ];
        
        this.grid = [];
        this.selectedCell = null;
        this.userInput = {};
        this.correctCells = new Set();
        
        this.init();
    }

    init() {
        this.createGrid();
        this.placeWords();
        this.renderGrid();
        this.createWordInputs();
        this.setupEventListeners();
        this.updateProgress();
    }

    createGrid() {
        this.grid = Array(this.gridSize).fill().map(() => 
            Array(this.gridSize).fill().map(() => ({ letter: '', blocked: false }))
        );
    }

    placeWords() {
        this.words.forEach(wordObj => {
            const { word, x, y, direction } = wordObj;
            
            for (let i = 0; i < word.length; i++) {
                const currentX = direction === "horizontal" ? x + i : x;
                const currentY = direction === "vertical" ? y + i : y;
                
                if (currentX < this.gridSize && currentY < this.gridSize) {
                    this.grid[currentY][currentX].letter = word[i];
                    this.grid[currentY][currentX].blocked = false;
                }
            }
        });

        // Marquer les cellules vides comme bloquées
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                if (this.grid[y][x].letter === '') {
                    this.grid[y][x].blocked = true;
                }
            }
        }
    }

    renderGrid() {
        const gridElement = document.getElementById('crossword');
        gridElement.innerHTML = '';
        
        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                
                if (this.grid[y][x].blocked) {
                    cell.classList.add('blocked');
                } else {
                    const input = document.createElement('input');
                    input.type = 'text';
                    input.maxLength = 1;
                    input.dataset.x = x;
                    input.dataset.y = y;
                    
                    const cellKey = `${x},${y}`;
                    if (this.userInput[cellKey]) {
                        input.value = this.userInput[cellKey];
                    }
                    
                    input.addEventListener('input', (e) => this.handleCellInput(x, y, e.target.value));
                    input.addEventListener('focus', () => this.selectCell(x, y));
                    input.addEventListener('keydown', (e) => this.handleCellKeydown(x, y, e));
                    
                    cell.appendChild(input);
                    cell.addEventListener('click', () => input.focus());
                    
                    // Mettre à jour l'apparence
                    this.updateCellAppearance(cell, x, y);
                }
                
                gridElement.appendChild(cell);
            }
        }
    }