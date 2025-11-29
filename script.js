class Crossword {
    constructor() {
        // Configuration de base de la grille
        this.gridSize = 10;
        this.words = [ // Liste des mots avec leurs propriétés
            { word: "SLIDING", clue: "Activité de glisse pratiquée en hiver sur la neige ou la glace en anglais", x: 1, y: 0, direction: "down" },
            { word: "PINGOUIN", clue: "Je suis un oiseau qui vit dans le froid", x: 0, y: 2, direction: "across" },
            { word: "SKI", clue: "Sport d'hiver pratiqué sur la neige", x: 6, y: 0, direction: "down" },
            { word: "NEIGE", clue: "Je tombe du ciel en hiver", x: 3, y: 4, direction: "across" },
            { word: "IGLOO", clue: "Je suis une maison faite de neige", x: 0, y: 6, direction: "across" },
            { word: "GANTS", clue: "On m'utilise pour protéger les mains du froid", x: 5, y: 8, direction: "across" },
            { word: "BONNET", clue: "On le met sur la tête pour ne pas avoir froid", x: 8, y: 3, direction: "down" }
        ];
        // Initialisation des variables d'état
        this.grid = []; // Grille de jeu
        this.userInput = {}; // Stocke les réponses de l'utilisateur
        this.activeInput = null; // Case actuellement sélectionnée
        this.startTime = null; // Heure de début du jeu
        this.timerInterval = null; // Intervalle du timer
        this.elapsedTime = 0; // Temps écoulé en secondes

        this.init();  // Lancement de l'initialisation
    }

    init() {
        this.createGrid();
        this.placeWords();
        this.renderGrid();
        this.setupEventListeners();
        this.updateProgress();
        this.startTimer();
    }
     // Création d'une grille vide
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

     // Placement des mots dans la grille
    placeWords() {
        for (let y = 0; y < this.gridSize; y++) {
             // Réinitialisation de toutes les cases
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
     // Affichage de la grille dans le DOM
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
  // Mise à jour de l'apparence d'une case (correct/incorrect)
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
 // Gestion de la saisie dans une case
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
   // Gestion de la navigation au clavier
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
 // Focus sur la case suivante
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
    startTimer() {
        this.startTime = new Date();
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }

    updateProgress() {
    let correct = 0;
    let total = 0;
    let wordsFound = 0;

    // Compter les lettres correctes
    for (let y = 0; y < this.gridSize; y++) {
        for (let x = 0; x < this.gridSize; x++) {
            if (!this.grid[y][x].blocked) {
                total++;
                const cellKey = `${x},${y}`;
                const expected = this.grid[y][x].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const user = this.userInput[cellKey]?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

                if (expected === user) {
                    correct++;
                }
            }
        }
    }

    // Vérifier chaque mot pour voir s'il est complet
    this.words.forEach(wordObj => {
        const { word, x, y, direction } = wordObj;
        let wordComplete = true;

        for (let i = 0; i < word.length; i++) {
            const currentX = direction === "across" ? x + i : x;
            const currentY = direction === "down" ? y + i : y;
            const cellKey = `${currentX},${currentY}`;
            
            const expected = this.grid[currentY][currentX].letter.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const user = this.userInput[cellKey]?.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

            if (expected !== user) {
                wordComplete = false;
                break;
            }
        }

        if (wordComplete) wordsFound++;
    });

    const progress = total ? (correct / total) * 100 : 0;

    document.getElementById('percent').textContent = `${Math.round(progress)}%`;
    document.getElementById('bar').style.width = `${progress}%`;
    document.getElementById('status').textContent = `Mots trouvés : ${wordsFound} / 7`;
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
    updateTimer() {
    const now = new Date();
    this.elapsedTime = Math.floor((now - this.startTime) / 1000);
    
    const minutes = Math.floor(this.elapsedTime / 60);
    const seconds = this.elapsedTime % 60;
    
    document.getElementById('timer').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

        reset() {
        // Réinitialiser les réponses
        this.userInput = {};
        
        // Réinitialiser et redémarrer le timer
        clearInterval(this.timerInterval);
        this.startTime = new Date();
        this.elapsedTime = 0;
        document.getElementById('timer').textContent = '00:00';
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
        
        // Mettre à jour l'affichage
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
