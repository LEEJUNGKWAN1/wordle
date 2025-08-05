class WordleGame {
  constructor() {
    this.words = [
      "APPLE",
      "BEACH",
      "CHAIR",
      "DREAM",
      "EARTH",
      "FLAME",
      "GRAPE",
      "HEART",
      "IMAGE",
      "JUICE",
      "KNIFE",
      "LEMON",
      "MUSIC",
      "NIGHT",
      "OCEAN",
      "PEACE",
      "QUEEN",
      "RADIO",
      "SMILE",
      "TABLE",
      "UNITY",
      "VOICE",
      "WATER",
      "YOUTH",
      "ZEBRA",
      "BRAIN",
      "CLOUD",
      "DANCE",
      "EAGLE",
      "FROST",
      "GREEN",
      "HAPPY",
    ];
    this.currentWord = "";
    this.currentRow = 0;
    this.currentTile = 0;
    this.gameOver = false;
    this.maxAttempts = 6;
    this.wordLength = 5;

    this.gameBoard = document.getElementById("gameBoard");
    this.keyboard = document.getElementById("keyboard");
    this.message = document.getElementById("message");
    this.newGameBtn = document.getElementById("newGameBtn");
    this.hintBtn = document.getElementById("hintBtn");

    this.init();
  }

  init() {
    this.setupGame();
    this.createGameBoard();
    this.createKeyboard();
    this.setupEventListeners();
  }

  setupGame() {
    this.currentWord =
      this.words[Math.floor(Math.random() * this.words.length)];
    this.currentRow = 0;
    this.currentTile = 0;
    this.gameOver = false;
    this.message.textContent = "";
    console.log("정답:", this.currentWord); // 디버깅용
  }

  createGameBoard() {
    this.gameBoard.innerHTML = "";
    for (let row = 0; row < this.maxAttempts; row++) {
      for (let col = 0; col < this.wordLength; col++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.dataset.row = row;
        tile.dataset.col = col;
        this.gameBoard.appendChild(tile);
      }
    }
  }

  createKeyboard() {
    const keyboardLayout = [
      ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
      ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
      ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACKSPACE"],
    ];

    this.keyboard.innerHTML = "";

    keyboardLayout.forEach((row) => {
      const keyboardRow = document.createElement("div");
      keyboardRow.className = "keyboard-row";

      row.forEach((key) => {
        const keyElement = document.createElement("button");
        keyElement.className = "key";

        if (key === "BACKSPACE") {
          keyElement.innerHTML = "←";
          keyElement.classList.add("wide");
        } else {
          keyElement.textContent = key;
          if (key === "ENTER") {
            keyElement.classList.add("wide");
          }
        }

        keyElement.addEventListener("click", () => this.handleKeyPress(key));
        keyboardRow.appendChild(keyElement);
      });

      this.keyboard.appendChild(keyboardRow);
    });
  }

  setupEventListeners() {
    document.addEventListener("keydown", (e) => {
      if (this.gameOver) return;

      const key = e.key.toUpperCase();
      if (key === "ENTER") {
        this.submitGuess();
      } else if (key === "BACKSPACE" || key === "DELETE") {
        this.deleteLetter();
      } else if (/^[A-Z]$/.test(key)) {
        this.addLetter(key);
      }
    });

    this.newGameBtn.addEventListener("click", () => this.newGame());
    this.hintBtn.addEventListener("click", () => this.showHint());
  }

  handleKeyPress(key) {
    if (this.gameOver) return;

    if (key === "ENTER") {
      this.submitGuess();
    } else if (key === "BACKSPACE") {
      this.deleteLetter();
    } else {
      this.addLetter(key);
    }
  }

  addLetter(letter) {
    if (this.currentTile < this.wordLength) {
      const tile = this.getCurrentTile();
      tile.textContent = letter;
      tile.classList.add("filled");
      this.currentTile++;
    }
  }

  deleteLetter() {
    if (this.currentTile > 0) {
      this.currentTile--;
      const tile = this.getCurrentTile();
      tile.textContent = "";
      tile.classList.remove("filled");
    }
  }

  getCurrentTile() {
    return document.querySelector(
      `[data-row="${this.currentRow}"][data-col="${this.currentTile}"]`
    );
  }

  submitGuess() {
    if (this.currentTile !== this.wordLength) {
      this.showMessage("5글자를 모두 입력해주세요!", "error");
      return;
    }

    const guess = this.getCurrentRowText();
    if (!this.isValidWord(guess)) {
      this.showMessage("유효하지 않은 단어입니다!", "error");
      return;
    }

    this.evaluateGuess();
    this.updateKeyboard();

    if (guess === this.currentWord) {
      this.gameOver = true;
      this.showMessage("축하합니다! 정답을 맞추셨습니다! 🎉", "success");
    } else if (this.currentRow === this.maxAttempts - 1) {
      this.gameOver = true;
      this.showMessage(
        `게임 오버! 정답은 "${this.currentWord}"였습니다.`,
        "error"
      );
    } else {
      this.currentRow++;
      this.currentTile = 0;
    }
  }

  getCurrentRowText() {
    let word = "";
    for (let i = 0; i < this.wordLength; i++) {
      const tile = document.querySelector(
        `[data-row="${this.currentRow}"][data-col="${i}"]`
      );
      word += tile.textContent;
    }
    return word;
  }

  isValidWord(word) {
    // 간단한 검증: 5글자이고 알파벳만 포함
    return word.length === 5 && /^[A-Z]+$/.test(word);
  }

  evaluateGuess() {
    const guess = this.getCurrentRowText();
    const letterCounts = {};

    // 정답에서 각 글자의 개수 세기
    for (let letter of this.currentWord) {
      letterCounts[letter] = (letterCounts[letter] || 0) + 1;
    }

    // 먼저 정확한 위치의 글자들 처리
    for (let i = 0; i < this.wordLength; i++) {
      const tile = document.querySelector(
        `[data-row="${this.currentRow}"][data-col="${i}"]`
      );
      const letter = guess[i];

      if (letter === this.currentWord[i]) {
        tile.classList.add("correct");
        letterCounts[letter]--;
      }
    }

    // 그 다음 잘못된 위치의 글자들 처리
    for (let i = 0; i < this.wordLength; i++) {
      const tile = document.querySelector(
        `[data-row="${this.currentRow}"][data-col="${i}"]`
      );
      const letter = guess[i];

      if (letter !== this.currentWord[i] && letterCounts[letter] > 0) {
        tile.classList.add("present");
        letterCounts[letter]--;
      } else if (letter !== this.currentWord[i]) {
        tile.classList.add("absent");
      }
    }
  }

  updateKeyboard() {
    const guess = this.getCurrentRowText();

    for (let i = 0; i < this.wordLength; i++) {
      const letter = guess[i];
      const keys = document.querySelectorAll(".key");
      const key = Array.from(keys).find((k) => k.textContent === letter);

      if (key) {
        const tile = document.querySelector(
          `[data-row="${this.currentRow}"][data-col="${i}"]`
        );

        if (tile.classList.contains("correct")) {
          key.classList.add("correct");
        } else if (
          tile.classList.contains("present") &&
          !key.classList.contains("correct")
        ) {
          key.classList.add("present");
        } else if (
          tile.classList.contains("absent") &&
          !key.classList.contains("correct") &&
          !key.classList.contains("present")
        ) {
          key.classList.add("absent");
        }
      }
    }
  }

  showMessage(text, type = "info") {
    this.message.textContent = text;
    this.message.className = type;

    setTimeout(() => {
      this.message.textContent = "";
    }, 3000);
  }

  showHint() {
    if (this.gameOver) return;

    const hint = this.currentWord[0] + "...";
    this.showMessage(`힌트: ${hint}`, "hint");
  }

  newGame() {
    this.setupGame();
    this.createGameBoard();
    this.createKeyboard();
    this.setupEventListeners();
  }
}

// 게임 시작
document.addEventListener("DOMContentLoaded", () => {
  new WordleGame();
});
