const secret = "TOI NHO NAM";
const letters = [
  "A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M",
  "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z"
];
const maxCats = 5;
let catsLeft = maxCats;
let revealed = [];
let isGameOver = false;

const phraseEl = document.getElementById("phrase");
const lettersEl = document.getElementById("letters");
const catCountEl = document.getElementById("catCount");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const bgmAudio = document.getElementById("bgm");

function resetGame() {
  catsLeft = maxCats;
  revealed = Array.from(secret, (ch) => (ch === " " ? true : false));
  isGameOver = false;
  statusEl.textContent = "Chọn một chữ cái để đoán.";
  renderCats();
  renderPhrase();
  renderLetters();
}

function renderCats() {
  const cats = Array.from({ length: catsLeft }, () => "😺").join("");
  const empties = Array.from({ length: maxCats - catsLeft }, () => "⬜").join("");
  catCountEl.textContent = cats + empties;
}

function renderPhrase() {
  phraseEl.innerHTML = "";
  for (let i = 0; i < secret.length; i += 1) {
    const char = secret[i];
    const cell = document.createElement("div");
    cell.className = "cell" + (revealed[i] ? "" : " hidden");
    if (char === " ") {
      cell.textContent = "";
      cell.style.background = "transparent";
      cell.style.border = "none";
      cell.style.boxShadow = "none";
    } else {
      cell.textContent = revealed[i] ? char : "";
      cell.style.background = "#ffdfe4";
      cell.style.borderColor = "#f7ced5";
    }
    phraseEl.appendChild(cell);
  }
}

function renderLetters() {
  lettersEl.innerHTML = "";
  for (const letter of letters) {
    const btn = document.createElement("button");
    btn.className = "letter-btn";
    btn.textContent = letter;
    btn.disabled = false;
    btn.addEventListener("click", () => chooseLetter(letter, btn));
    lettersEl.appendChild(btn);
  }
}

function chooseLetter(letter, button) {
  if (isGameOver || button.disabled) return;

  let found = false;
  for (let i = 0; i < secret.length; i += 1) {
    if (secret[i] === letter) {
      revealed[i] = true;
      found = true;
    }
  }

  button.disabled = true;
  if (!found) {
    catsLeft -= 1;
    statusEl.textContent = `Sai rồi! Còn lại ${catsLeft} con mèo.`;
  } else {
    statusEl.textContent = `Chính xác! Đã hiện ${letter}.`;
  }

  renderCats();
  renderPhrase();
  checkGameEnd();
}

function checkGameEnd() {
  if (!revealed.includes(false)) {
    isGameOver = true;
    statusEl.textContent = "Bạn đã thắng! Cụm từ là TÔI NHỚ NAM.";
    if (bgmAudio) {
      bgmAudio.currentTime = 0;
      bgmAudio.play().catch(() => {
        /* nếu trình duyệt chặn phát tự động, bỏ qua */
      });
    }
    disableLetterButtons();
    return;
  }

  if (catsLeft <= 0) {
    isGameOver = true;
    statusEl.textContent = "Hết mèo rồi! Bạn đã thua. Cụm từ là TOI NHO EM.";
    revealAll();
    disableLetterButtons();
  }
}

function disableLetterButtons() {
  const buttons = lettersEl.querySelectorAll("button");
  buttons.forEach((btn) => (btn.disabled = true));
}

function revealAll() {
  revealed = Array.from(secret, () => true);
  renderPhrase();
}

resetBtn.addEventListener("click", resetGame);
resetGame();
